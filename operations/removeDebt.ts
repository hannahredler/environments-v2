/**
 * @dev This script cancels the debt from a number of vaults.
 * 
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import *  as hre from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap } from '../shared/helpers'

import { Cauldron } from '../typechain/Cauldron'
import { Timelock } from '../typechain/Timelock'
import { Relay } from '../typechain/Relay'

(async () => {
  const vaultId = '0x3f9765c9a4601ff812bcff99'
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

  // Contract instantiation
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
  const relay = await ethers.getContractAt('Relay', governance.get('relay') as string, ownerAcc) as unknown as Relay

  const debt = (await cauldron.balances(vaultId)).art

  // Build the proposal
  const proposal : Array<{ target: string; data: string}> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRole', [
      id(cauldron.interface, 'pour(bytes12,int128,int128)'),
      timelock.address
    ])
  })
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('pour', [
      vaultId, 0, `-${debt}`
    ])
  })
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('revokeRole', [
      id(cauldron.interface, 'pour(bytes12,int128,int128)'),
      timelock.address
    ])
  })

  // Propose, approve, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await relay.execute(
    [
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('propose', [proposal])
      },
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('approve', [txHash])
      },
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('execute', [proposal])
      },
    ]
  ); console.log(`Executed ${txHash}`)
  // await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
  // await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  // await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()