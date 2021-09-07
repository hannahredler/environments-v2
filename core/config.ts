import { WAD, ETH, DAI, USDC, WBTC, USDT } from '../shared/constants'
import { stringToBytes6 } from '../shared/helpers'

export const CHAINLINK = 'CHAINLINK'
export const COMPOSITE = 'COMPOSITE'

// Assets to add to the protocol. A Join will be deployed for each one.
export const assetIds: string[] = [DAI, USDC, ETH, WBTC, USDT]

// Assets to make into underlyings. The assets must exist, as well as rate and chi oracle sources.
export const baseIds: string[] = [DAI, USDC, USDT]

// Assets to make into collaterals, as [underlying, collateral]. The underlying and collateral assets must exist.
export const ilkIds: Array<[string, string, string, number]> = [
    [DAI, DAI, CHAINLINK, 18], // Constant 1
    [DAI, USDC, COMPOSITE, 18], // Composite, via ETH
    [DAI, ETH, CHAINLINK, 18],
    [DAI, WBTC, COMPOSITE, 18], // Composite, via ETH
    [DAI, USDT, COMPOSITE, 18], // Composite, via ETH
    [USDC, USDC, CHAINLINK, 18], // Constant 1
    [USDC, DAI, COMPOSITE, 18], // Composite, via ETH
    [USDC, ETH, CHAINLINK, 18],
    [USDC, WBTC, COMPOSITE, 18], // Composite, via ETH
    [USDC, USDT, COMPOSITE, 18], // Composite, via ETH
    [USDT, USDT, CHAINLINK, 18], // Constant 1
    [USDT, DAI, COMPOSITE, 18], // Composite, via ETH
    [USDT, USDC, COMPOSITE, 18], // Composite, via ETH
    [USDT, ETH, CHAINLINK, 18],
    [USDT, WBTC, COMPOSITE, 18] // Composite, via ETH
]

// Spot oracle pairs, either to use directly as part of an ilkId pair, or as intermediate steps in a composite oracle path
export const spotPairs: Array<[string, string, number]> = [
    [DAI, DAI, 18], // Constant 1
    [DAI, ETH, 18],
    [USDC, USDC, 18], // Constant 1
    [USDC, ETH, 18],
    [USDT, USDT, 18], // Constant 1
    [USDT, ETH, 18],
    [WBTC, ETH, 18], // Only needed for a composite path
]

// Spor oracle pairs to be used in composite oracle paths. Subset of spotPairs
export const compositePairs: Array<[string, string, number]> = [
    [DAI, ETH, 18],
    [USDC, ETH, 18],
    [USDT, ETH, 18],
    [WBTC, ETH, 18],
]

// Spot oracle sources, either to use directly as part of an ilkId pair, or as intermediate steps in a composite oracle path
export const compositePaths: Array<[string, string, Array<string>]> = [
    [DAI, USDC, [ETH]],
    [DAI, USDT, [ETH]],
    [DAI, WBTC, [ETH]],
    [USDC, DAI, [ETH]],
    [USDC, USDT, [ETH]],
    [USDC, WBTC, [ETH]],
    [USDT, DAI, [ETH]],
    [USDT, USDC, [ETH]],
    [USDT, WBTC, [ETH]]
]

export const EOSEP21 = 1633042799
export const EODEC21 = 1640995199
export const EO2508 = 1629935999
export const EO2608 = 1630022399
export const EO2708 = 1630108799

// Series to deploy. A FYToken and Pool will be deployed for each one. The underlying assets must exist and have been added as bases. The collaterals accepted must exist and have been added as collateral for the fyToken underlying asset.
export const seriesData: Array<[string, string, number, Array<string>]> = [ // seriesId, baseId, maturity, ilkIds
    [stringToBytes6('DAI1'), DAI, EOSEP21, [DAI, USDC, ETH, WBTC, USDT]], // Sep21
    [stringToBytes6('DAI2'), DAI, EODEC21, [DAI, USDC, ETH, WBTC, USDT]], // Dec21
    [stringToBytes6('DAI25'), DAI, EO2508, [DAI, USDC, ETH, WBTC, USDT]],
    [stringToBytes6('DAI26'), DAI, EO2608, [DAI, USDC, ETH, WBTC, USDT]],
    [stringToBytes6('DAI27'), DAI, EO2708, [DAI, USDC, ETH, WBTC, USDT]],
    [stringToBytes6('USDC1'), USDC, EOSEP21, [USDC, DAI, ETH, WBTC, USDT]],
    [stringToBytes6('USDC2'), USDC, EODEC21, [USDC, DAI, ETH, WBTC, USDT]],
    [stringToBytes6('USDT'), USDT, EOSEP21, [USDT, DAI, USDC, ETH, WBTC]], // TODO: USDT -> USDT1
    [stringToBytes6('USDT2'), USDT, EODEC21, [USDT, DAI, USDC, ETH, WBTC]]
]

// Amount of underlying to initialize pools with. It will only work with mock assets. A 1/9 of this amount in fyToken will be minted and added to the pool.
export const initializePools = WAD.mul(1000000)

export const testAddrsToFund : Array<string> = ['0x885Bc35dC9B10EA39f2d7B3C94a7452a9ea442A7']