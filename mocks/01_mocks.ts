import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { mapToJson } from '../shared/helpers'
import { Mocks } from './mocks'
import { assetIds, baseIds, spotPairs } from '../core/config'

/**
 * @dev Deploy mock tokens and oracle sources for testing
 */
 
(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    
    const mocks = await Mocks.setup(ownerAcc, assetIds, baseIds, spotPairs)

    /* keeping it flat and simple for now, albeit a bit 'unDRY' */
    fs.writeFileSync('./output/assets.json', mapToJson(mocks.assets), 'utf8')
    fs.writeFileSync('./output/chiSources.json', mapToJson(mocks.chiSources), 'utf8')
    fs.writeFileSync('./output/rateSources.json', mapToJson(mocks.rateSources), 'utf8')
    fs.writeFileSync('./output/spotSources.json', mapToJson(mocks.spotSources), 'utf8')
})()