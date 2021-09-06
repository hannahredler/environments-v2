/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 * 
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, stringToBytes6, bytesToBytes32, jsonToMap } from '../shared/helpers'
import { WAD, DAI, USDC, ETH, WBTC, USDT } from '../shared/constants'

import { Wand } from '../typechain/Wand'
import { Join } from '../typechain/Join'
import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'

import { Timelock } from '../typechain/Timelock'
import { Relay } from '../typechain/Relay'
import { EmergencyBrake } from '../typechain/EmergencyBrake'

(async () => {
  const CHAINLINK = 'chainlinkOracle'
  const COMPOSITE = 'compositeOracle'
  // Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), maxDebt, minDebt, debtDec
  const newIlks: Array<[string, string, string, number, number, number, number]> = [
    [DAI, DAI, CHAINLINK, 1000000, 1000000, 1, 18], // Constant 1
    [DAI, USDC, CHAINLINK, 1000000, 1000000, 1, 18], // Via ETH
    [DAI, ETH, CHAINLINK, 1000000, 1000000, 1, 18],
    [DAI, WBTC, CHAINLINK, 1000000, 1000000, 1, 18], // Via ETH
    [DAI, USDT, CHAINLINK, 1000000, 1000000, 1, 18], // Via ETH
    [USDC, USDC, CHAINLINK, 1000000, 1000000, 1, 6], // Constant 1
    [USDC, DAI, CHAINLINK, 1000000, 1000000, 1, 6], // Via ETH
    [USDC, ETH, CHAINLINK, 1000000, 1000000, 1, 6],
    [USDC, WBTC, CHAINLINK, 1000000, 1000000, 1, 6], // Via ETH
    [USDC, USDT, CHAINLINK, 1000000, 1000000, 1, 6], // Via ETH
    [USDT, USDT, CHAINLINK, 1000000, 1000000, 1, 18], // Constant 1
    [USDT, DAI, CHAINLINK, 1000000, 1000000, 1, 18], // Via ETH
    [USDT, USDC, CHAINLINK, 1000000, 1000000, 1, 18], // Via ETH
    [USDT, ETH, CHAINLINK, 1000000, 1000000, 1, 18],
    [USDT, WBTC, CHAINLINK, 1000000, 1000000, 1, 18] // Via ETH
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const joins = jsonToMap(fs.readFileSync('./output/joins.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
  const relay = await ethers.getContractAt('Relay', governance.get('relay') as string, ownerAcc) as unknown as Relay
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake

  // Build the proposal
  const proposal : Array<{ target: string; data: string}> = []
  const plans : Set<string> = new Set() // Existing plans in the cloak
  for (let [baseId, ilkId, oracleName, ratio, maxDebt, minDebt, debtDec] of newIlks) {
    const join = await ethers.getContractAt('Join', joins.get(ilkId) as string, ownerAcc) as Join

    // Test that the sources for spot have been set. Peek will fail with 'Source not found' if they have not.
    const spotOracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get(oracleName) as string, ownerAcc) as unknown as ChainlinkMultiOracle
    console.log(`Looking for ${bytesToString(baseId)}/${bytesToString(ilkId)} at ${protocol.get(oracleName) as string}`)
    console.log(`Source for ${bytesToString(baseId)}/ETH: ${await spotOracle.sources(baseId, ETH)}`)
    console.log(`Source for ${bytesToString(ilkId)}/ETH: ${await spotOracle.sources(ilkId, ETH)}`)
    console.log(`Current SPOT for ${bytesToString(baseId)}/${bytesToString(ilkId)}: ${(await spotOracle.peek(bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD))[0]}`)

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('makeIlk', [
        baseId, ilkId, spotOracle.address, ratio, maxDebt, minDebt, debtDec
      ])
    })
    console.log(`[Asset: ${bytesToString(ilkId)} made into ilk for ${bytesToString(baseId)}],`)

    if (!plans.has(ilkId)) { 
      plans.add(ilkId)
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [protocol.get('witch') as string,
          [
            {
              contact: join.address, signatures: [
                id(join.interface, 'exit(address,uint128)'),
              ]
            }
          ]
        ])
      })
      console.log(`cloak.plan(witch, join(${bytesToString(ilkId)}))`)
    }
  }

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