import { ethers, waffle } from 'hardhat'

import *  as fs from 'fs'

import { jsonToMap, mapToJson } from '../shared/helpers'
import { WAD } from '../shared/constants'

import { id } from '@yield-protocol/utils-v2'

import { Pool } from '../typechain/Pool'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { FYToken } from '../typechain/FYToken'

import { Series } from '../fixtures/series'

 /**
 * This script initiates the pools
 * 
 * run:
 * npx hardhat run ./environments/series.ts --network localhost
 *
 */

const poolAddresses = [
  ['DAI1Pool', '0x019fd0Fc79D57E6c407a9aA4CeDd5C3CAA230DA7'],
  ['DAI2Pool', '0xD794F6b188055adB36d1f2B8f6342c6e567e773C'],
  ['USDC1Pool', '0x091C622621e6aef0F11e6Ad260621b14e76FEf8C'],
  ['USDC2Pool', '0x9cF4D31b1Cf5bAb429239C4C4A1f2095816B8CF2'],
]

const json = fs.readFileSync('./output/pools.json', 'utf8')
const pools = jsonToMap(json) as Series["pools"];

 /**
 * 
 * run:
 * npx hardhat run ./environments/development.ts --network localhost
 *
 */

console.time("Pools initialized");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners(); 
    pools.forEach(async (pool: Pool)=> {

      // const connectedPool = pool.connect(ownerAcc)
      console.log(pool);

      // const base = (await ethers.getContractAt('ERC20Mock', await pool.base(), ownerAcc) as unknown) as ERC20Mock
      // const fyToken = (await ethers.getContractAt('FYToken', await pool.fyToken(), ownerAcc) as unknown) as FYToken
      // // Supply pool with a million tokens of each for initialization
      // try {
      //   // try minting tokens (as the token owner for mock tokens)
      //   await base.mint(pool.address, WAD.mul(1000000)); console.log(`base.mint(pool.address)`)
      // } catch (e) { 
      //   // if that doesn't work, try transfering tokens from a whale/funder account
      //   // await transferFromFunder( base.address, pool.address, WAD.mul(1000000), funder)
      //   console.log(e);
      // }
      // // Initialize pool
      // await pool.mint(await ownerAcc.getAddress(), true, 0); console.log(`pool.mint(owner)`)
  
      // // Donate fyToken to the pool to skew it
      // await fyToken.grantRole(id('mint(address,uint256)'), await ownerAcc.getAddress()); console.log(`fyToken.grantRoles(owner)`)

      // await fyToken.mint(pool.address, WAD.mul(1000000).div(9)); console.log(`fyToken.mint(pool.address)`)
      // await pool.sync(); console.log(`pool.sync`) 
    })

    // for (let [seriesId, poolAddress] of poolAddrs) {
    //     const pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc) as unknown) as Pool
    //     const base = (await ethers.getContractAt('ERC20Mock', await pool.base(), ownerAcc) as unknown) as ERC20Mock
    //     const fyToken = (await ethers.getContractAt('FYToken', await pool.fyToken(), ownerAcc) as unknown) as FYToken

    //     // Supply pool with a million tokens of each for initialization
    //     try {
    //       // try minting tokens (as the token owner for mock tokens)
    //       await base.mint(pool.address, WAD.mul(1000000)); console.log(`base.mint(pool.address)`)
    //     } catch (e) { 
    //       // if that doesn't work, try transfering tokens from a whale/funder account
    //       // await transferFromFunder( base.address, pool.address, WAD.mul(1000000), funder)
    //       console.log(e);
    //     }
    //     // Initialize pool
    //     await pool.mint(await ownerAcc.getAddress(), true, 0); console.log(`pool.mint(owner)`)
    
    //     // Donate fyToken to the pool to skew it
    //     await fyToken.grantRole(id('mint(address,uint256)'), await ownerAcc.getAddress()); console.log(`fyToken.grantRoles(owner)`)
  
    //     await fyToken.mint(pool.address, WAD.mul(1000000).div(9)); console.log(`fyToken.mint(pool.address)`)
    //     await pool.sync(); console.log(`pool.sync`)            
    // }

    console.timeEnd("Pools initialized")
})()
