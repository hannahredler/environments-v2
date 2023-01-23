/**
 * @dev This script replaces one or more rate data sources in the CompoundMultiOracle.
 */

import { ethers } from 'hardhat'
import { getName } from '../../../shared/helpers'
import { RATE } from '../../../shared/constants'

import { ERC20Mock, CompoundMultiOracle } from '../../../typechain'

export const updateRateSources = async (
  lendingOracle: CompoundMultiOracle,
  newSources: Array<[string, string]>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  const [ownerAcc] = await ethers.getSigners()
  console.log(`compoundOracle: ${lendingOracle.address}`)

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, sourceAddress] of newSources) {
    const cToken = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      sourceAddress as string,
      ownerAcc
    )) as unknown as ERC20Mock
    console.log(`Using ${await cToken.name()} at ${sourceAddress}`)
    proposal.push({
      target: lendingOracle.address,
      data: lendingOracle.interface.encodeFunctionData('setSource', [baseId, RATE, sourceAddress]),
    })
    console.log(`Rate(${getName(baseId)}): ${sourceAddress}`)
  }

  return proposal
}
