import hre, { ethers } from 'hardhat'

export async function deploy() {
  const [owner] = await hre.ethers.getSigners()

  const Router = await hre.ethers.getContractFactory('FinsRouter02')
  const router = await Router.deploy(
    '0xe759Dd4B9f99392Be64f1050a6A8018f73B53a13',
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
  )
  // const router = await hre.ethers.getContractAt('FinsRouter02', ROUTER)
  await router.deployed()
  console.log('FinsRouter02: ', (router as any).address)
}

deploy()
