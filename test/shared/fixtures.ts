import { Wallet, Contract } from 'ethers'
import { Web3Provider } from 'ethers/providers'
import { deployContract } from 'ethereum-waffle'

import { expandTo18Decimals } from './utilities'

import FinsV2Factory from '../../build/IFinsFactory.json'
import IFinsV2Pair from '../../build/IFinsPair.json'

import ERC20 from '../../build/ERC20.json'
import WETH9 from '../../build/WETH9.json'
import FinsV1Exchange from '../../build/IFinsV1Exchange.json'
import FinsV1Factory from '../../build/IFinsFactory.json'
import FinsV2Router01 from '../../build/FinsRouter01.json'
import FinsV2Migrator from '../../build/FinsV2Migrator.json'
import FinsV2Router02 from '../../build/FinsRouter02.json'
import RouterEventEmitter from '../../build/RouterEventEmitter.json'

const overrides = {
  gasLimit: 9999999
}

interface V2Fixture {
  token0: Contract
  token1: Contract
  WETH: Contract
  WETHPartner: Contract
  factoryV1: Contract
  factoryV2: Contract
  router01: Contract
  router02: Contract
  routerEventEmitter: Contract
  router: Contract
  migrator: Contract
  WETHExchangeV1: Contract
  pair: Contract
  WETHPair: Contract
}

export async function v2Fixture(provider: Web3Provider, [wallet]: Wallet[]): Promise<V2Fixture> {
  // deploy tokens
  const tokenA = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])
  const tokenB = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])
  const WETH = await deployContract(wallet, WETH9)
  const WETHPartner = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])

  // deploy V1
  const factoryV1 = await deployContract(wallet, FinsV1Factory, [])
  await factoryV1.initializeFactory((await deployContract(wallet, FinsV1Exchange, [])).address)

  // deploy V2
  const factoryV2 = await deployContract(wallet, FinsV2Factory, [wallet.address])

  // deploy routers
  const router01 = await deployContract(wallet, FinsV2Router01, [factoryV2.address, WETH.address], overrides)
  const router02 = await deployContract(wallet, FinsV2Router02, [factoryV2.address, WETH.address], overrides)

  // event emitter for testing
  const routerEventEmitter = await deployContract(wallet, RouterEventEmitter, [])

  // deploy migrator
  const migrator = await deployContract(wallet, FinsV2Migrator, [factoryV1.address, router01.address], overrides)

  // initialize V1
  await factoryV1.createExchange(WETHPartner.address, overrides)
  const WETHExchangeV1Address = await factoryV1.getExchange(WETHPartner.address)
  const WETHExchangeV1 = new Contract(WETHExchangeV1Address, JSON.stringify(FinsV1Exchange.abi), provider).connect(
    wallet
  )

  // initialize V2
  await factoryV2.createPair(tokenA.address, tokenB.address)
  const pairAddress = await factoryV2.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(IFinsV2Pair.abi), provider).connect(wallet)

  const token0Address = await pair.token0()
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  await factoryV2.createPair(WETH.address, WETHPartner.address)
  const WETHPairAddress = await factoryV2.getPair(WETH.address, WETHPartner.address)
  const WETHPair = new Contract(WETHPairAddress, JSON.stringify(IFinsV2Pair.abi), provider).connect(wallet)

  return {
    token0,
    token1,
    WETH,
    WETHPartner,
    factoryV1,
    factoryV2,
    router01,
    router02,
    router: router02, // the default router, 01 had a minor bug
    routerEventEmitter,
    migrator,
    WETHExchangeV1,
    pair,
    WETHPair
  }
}
