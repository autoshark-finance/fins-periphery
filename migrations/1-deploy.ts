import hre, { ethers } from 'hardhat'

const BLACKHOLE = '0x0000000000000000000000000000000000000000'

export async function deploy() {
  const [owner] = await hre.ethers.getSigners()

  const Router = await hre.ethers.getContractFactory('FinsRouter02')
  const router = await Router.deploy('0xB7D434eeBF091Dbf30a0082d05aCC0CC937c52CE', '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c')
  await router.deployed()
  console.log('FinsRouter02: ', (router as any).address)

}

deploy()
