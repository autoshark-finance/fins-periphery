const FinsRouter02 = artifacts.require("FinsRouter02");
const FACTORY_ARTIFACT  = require('../../core/build/contracts/FinsFactory.json');
module.exports = async function (deployer) {

  await deployer.deploy(FinsRouter02, FACTORY_ARTIFACT.networks["97"].address, '0xae13d989dac2f0debff460ac112a837c89baa7cd');
  let instanceRouter = await FinsRouter02.deployed();
};
