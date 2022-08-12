import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployJoins } from '../../fragments/assetsAndSeries/deployJoins'

import { Timelock } from '../../../typechain'
const { governance } = require(process.env.CONF as string)
const { developer, assetsToAdd, assets } = require(process.env.CONF as string)

/**
 * @dev This script deploys a Join
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const newJoins = await deployJoins(ownerAcc, timelock, assetsToAdd)
  writeAddressMap('newJoins.json', newJoins) // newJoins.json is a tempporary file
})()
