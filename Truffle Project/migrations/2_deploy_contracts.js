var Supplychain = artifacts.require("./Supplychain/Supplychain.sol");

module.exports = function(deployer) {
  deployer.deploy(Supplychain);
};