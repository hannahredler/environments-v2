/**
 * @dev This script matures a series at the FYToken and/or Cauldron contracts.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, stringToBytes6 } from '../shared/helpers'
import { MAX256 as NOT_MATURE } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { FYToken } from '../typechain/FYToken'

(async () => {
  // Input data
  const seriesToMature: Array<string> = [ // seriesId
      'USDC13'
  ]

  const [ ownerAcc ] = await ethers.getSigners();
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const fyTokens = jsonToMap(fs.readFileSync('./output/fyTokens.json', 'utf8')) as Map<string,string>;

  // Contract instantiation
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron

  console.log('\nCauldron:')
  for (let seriesId of seriesToMature) {
    console.log(`Maturing in FYToken...`)
    const fyToken = await ethers.getContractAt('FYToken', fyTokens.get(stringToBytes6(seriesId)) as string, ownerAcc) as unknown as FYToken
    const chiAtMaturity = await fyToken.chiAtMaturity()
    if (chiAtMaturity.eq(NOT_MATURE)) {
      await fyToken.mature()
      console.log(`chi at maturity ${await fyToken.chiAtMaturity()}`)
    } else {
      console.log('already matured')
      console.log(`chi at maturity ${chiAtMaturity}`)
    }

    console.log(`Maturing in Cauldron...`)
    const rateAtMaturity = await cauldron.ratesAtMaturity(stringToBytes6(seriesId))
    if (rateAtMaturity.eq('0')) {
      await cauldron.mature(stringToBytes6(seriesId))
      console.log(`rate at maturity ${await cauldron.ratesAtMaturity(stringToBytes6(seriesId))}`)
    } else {
      console.log('already matured')
      console.log(`rate at maturity ${rateAtMaturity}`)
    }
  }
})()