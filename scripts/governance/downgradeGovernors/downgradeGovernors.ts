import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  getOriginalChainId,
  getOwnerOrImpersonate,
  proposeApproveExecute,
} from '../../../shared/helpers'

import { governorsToDevelopersProposal } from '../../fragments/permissions/governorsToDevelopersProposal'
import { Timelock, EmergencyBrake } from '../../../typechain'
import { accounts, developerToImpersonate } from './downgradeGovernors.arb_mainnet.config'


/**
 * @dev This script downgrades one or more accounts from a governor to a developer role.
 */
 ;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developerToImpersonate as string)

  const governance = readAddressMappingIfExists('governance.json');

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  let proposal = await governorsToDevelopersProposal(timelock, cloak, accounts)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
