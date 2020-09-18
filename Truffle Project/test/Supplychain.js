var Supplychain = artifacts.require("./Supplychain/Supplychain.sol");

// var deployerAddress         = "0x2d070846F5f2B60C7a81C3403EC6CCf37A7bb421";
// var manufacturerAddress1    = "0xEb1BEe7cF24db39cE30A20A4d278660B8F9B4BE8";
// var manufacturerAddress2    = "0xD7D6f672f40588C086DfC7aC6074aE3588A073Fe";
// var distributorAddress      = "0x627B9bB9e5739962042Be001caa9EF3AeD40dDdC";
// var retailerAddress         = "0x5FA3E203A8eeb3a2d653D6D55eEd67e80d7BF892";
// var consumerAddress         = "0xAD9A3deE828E0F8f295f063458eFE0386d7cFaa8";
// var unregisterdAddress      = "0x7Ef4cB2B6F05c25915033333a1320faD587Fd334";

var deployerAddress         = "0x7aD615Cf41d21482B4C767dD8f6EFbbB1f4a092C";
var manufacturerAddress1    = "0x5efd1d3f7CB2869e3aeAD37Fa7e196fEc2053B0c";
var manufacturerAddress2    = "0x7bD43Cd1Fa4D1eCACbEB39dC2De8f0b434059FBE";
var distributorAddress      = "0x7f2553c35C8aCfB3786E8366a2A64973566F363c";
var retailerAddress         = "0x271C287cf72224f40B556f8F16f9Ec4B21Ab71C3";
var consumerAddress         = "0x0472b2528466537cbe617328777713534ea9B46c";
var unregisterdAddress      = "0xCcEcD2b3e7f9AB89e76524813E1C2df32323300a";

contract("Supplychain", function(accounts) {
    var supplychainInstance = Supplychain;

    it("registerMaufacurer(): Does not register manufacturer if not admin", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.registerManufacturer(
                manufacturerAddress1, "Test Name", 12345,
                "Test Address", 6006600611, "test@test.com" 
            );
        }).then(function(count) {
            return supplychainInstance.registerManufacturer(
                manufacturerAddress2, "Test Name 2", 54321,
                "Test Address 2", 6006600666, "test@test.org" 
            );
        }).then(function(reciept) {
            return supplychainInstance.manufacturerCount();
        }).then(function(count) {
            assert.equal(count, 2, "Manufacturer Count not incremented");
        });
    });

    it("registerMaufacurer(): Correctly Adds a Manufacturer", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.registerManufacturer(
                manufacturerAddress1, "Test Name", 12345,
                "Test Address", 6006600611, "test@test.com",
                {from: manufacturerAddress2}
            );
        })
        .then(assert.fail)
        .catch(function (error) {
            assert.include(error.message, "Administrator Only Access.", 
            "Non Admin shoud not add manufacturer");
        });
    });

    it("getManufacturerByAddress(): Retrieves correct Manufacturer by Address", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.getManufacturerByAddress(manufacturerAddress1);
        }).then(function(manufacturer) {
            assert.equal(manufacturer[0], manufacturerAddress1, "Incorrect Manufacturer's EthAddress");
            assert.equal(manufacturer[1], "Test Name", "Incorrect Manufacturer's Name");
            assert.equal(manufacturer[2], 12345, "Incorrect Manufacturer's EPC Prefix");
            assert.equal(manufacturer[3], "Test Address", "Incorrect Manufacturer's Location");
            assert.equal(manufacturer[4], 6006600611, "Incorrect Manufacturer's Contact");
            assert.equal(manufacturer[5], "test@test.com", "Incorrect Manufacturer's Email");
            assert.equal(manufacturer[6], 0, "Incorrect Manufacturer's Account Type");
        });
    });

    it("getManufacturerByAddress(): Returns Empty String for invalid address", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.getManufacturerByAddress(unregisterdAddress);
        }).then(function(manufacturer) {
            assert.equal(manufacturer[0], "0x0000000000000000000000000000000000000000", "Incorrect Manufacturer's EthAddress");
            assert.equal(manufacturer[1], "", "Incorrect Manufacturer's Name");
            assert.equal(manufacturer[2], 0, "Incorrect Manufacturer's EPC Prefix");
            assert.equal(manufacturer[3], "", "Incorrect Manufacturer's Location");
            assert.equal(manufacturer[4], 0, "Incorrect Manufacturer's Contact");
            assert.equal(manufacturer[5], "", "Incorrect Manufacturer's Email");
            assert.equal(manufacturer[6], 0, "Incorrect Manufacturer's Account Type");
        });
    });

    it("getManufacturerByEpc(): Get a Manufacturer by EPC", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.getManufacturerByEpc(54321);
        }).then(function(manufacturer) {
            assert.equal(manufacturer[0], manufacturerAddress2, "Incorrect Manufacturer's EthAddress");
            assert.equal(manufacturer[1], "Test Name 2", "Incorrect Manufacturer's Name");
            assert.equal(manufacturer[2], 54321, "Incorrect Manufacturer's EPC Prefix");
            assert.equal(manufacturer[3], "Test Address 2", "Incorrect Manufacturer's Location");
            assert.equal(manufacturer[4], 6006600666, "Incorrect Manufacturer's Contact");
            assert.equal(manufacturer[5], "test@test.org", "Incorrect Manufacturer's Email");
            assert.equal(manufacturer[6], 0, "Incorrect Manufacturer's Account Type");
        });
    });

    it("registerOtherUser(): Adds Other Users Correctly", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.registerOtherUser(
                "Distributor User", 1, "Distributor Address", "1234", "Distributor@email.com", {from: distributorAddress}
            );
        }).then(function() {
            return supplychainInstance.registerOtherUser(
                "Retailer User", 2, "Retailer Address", "4321", "Retailer@email.com", {from: retailerAddress}
            );
        }).then(function() {
            return supplychainInstance.registerOtherUser(
                "Consumer User", 3, "Consumer Address", "4567", "Consumer@email.com", {from: consumerAddress}
            );
        }).then(function(reciept) {
            return supplychainInstance.userCount();
        }).then(function(count) {
            assert.equal(count, 3, "User Count not incremented");
        });
    });

    it("getUserByAddress(): Retrieves correct Distributor by Address directly", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.getUserByAddress(distributorAddress);
        }).then(function(distributor) {
            assert.equal(distributor[0], distributorAddress, "Incorrect Distributor's EthAddress");
            assert.equal(distributor[1], "Distributor User", "Incorrect Distributor's Name");
            assert.equal(distributor[2], 0, "Incorrect Distributor's EPC Prefix");
            assert.equal(distributor[3], "Distributor Address", "Incorrect Distributor's Location");
            assert.equal(distributor[4], 1234, "Incorrect Distributor's Contact");
            assert.equal(distributor[5], "Distributor@email.com", "Incorrect Distributor's Email");
            assert.equal(distributor[6], 1, "Incorrect Distributor's Account Type");
        });
    });

    it("getUserByAddress(): Retrieves correct Retailer by Address directly", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.getUserByAddress(retailerAddress);
        }).then(function(retailer) {
            assert.equal(retailer[0], retailerAddress, "Incorrect Retailer's EthAddress");
            assert.equal(retailer[1], "Retailer User", "Incorrect Retailer's Name");
            assert.equal(retailer[2], 0, "Incorrect Retailer's EPC Prefix");
            assert.equal(retailer[3], "Retailer Address", "Incorrect Retailer's Location");
            assert.equal(retailer[4], 4321, "Incorrect Retailer's Contact");
            assert.equal(retailer[5], "Retailer@email.com", "Incorrect Distributor's Email");
            assert.equal(retailer[6], 2, "Incorrect Retailer's Account Type");
        });
    });

    it("getUserByAddress(): Retrieves correct Consumer by Address directly", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.getUserByAddress(consumerAddress);
        }).then(function(consumer) {
            assert.equal(consumer[0], consumerAddress, "Incorrect Consumer's EthAddress");
            assert.equal(consumer[1], "Consumer User", "Incorrect Consumer's Name");
            assert.equal(consumer[2], 0, "Incorrect Consumer's EPC Prefix");
            assert.equal(consumer[3], "Consumer Address", "Incorrect Consumer's Location");
            assert.equal(consumer[4], 4567, "Incorrect Consumer's Contact");
            assert.equal(consumer[5], "Consumer@email.com", "Incorrect Consumer's Email");
            assert.equal(consumer[6], 3, "Incorrect Consumer's Account Type");
        });
    });

    it("getUserProfileByAddress(): Retrieves correct Manufacturer", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.getUserProfileByAddress(manufacturerAddress1);
        }).then(function(manufacturer) {
            assert.equal(manufacturer[0], manufacturerAddress1, "Incorrect Manufacturer's EthAddress");
            assert.equal(manufacturer[1], "Test Name", "Incorrect Manufacturer's Name");
            assert.equal(manufacturer[2], 12345, "Incorrect Manufacturer's EPC Prefix");
            assert.equal(manufacturer[3], "Test Address", "Incorrect Manufacturer's Location");
            assert.equal(manufacturer[4], 6006600611, "Incorrect Manufacturer's Contact");
            assert.equal(manufacturer[5], "test@test.com", "Incorrect Manufacturer's Email");
            assert.equal(manufacturer[6], 0, "Incorrect Manufacturer's Account Type");
        });
    });

    it("getUserProfileByAddress(): Retrieves correct Distributor", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.getUserProfileByAddress(distributorAddress);
        }).then(function(distributor) {
            assert.equal(distributor[0], distributorAddress, "Incorrect Distributor's EthAddress");
            assert.equal(distributor[1], "Distributor User", "Incorrect Distributor's Name");
            assert.equal(distributor[2], 0, "Incorrect Distributor's EPC Prefix");
            assert.equal(distributor[3], "Distributor Address", "Incorrect Distributor's Location");
            assert.equal(distributor[4], 1234, "Incorrect Distributor's Contact");
            assert.equal(distributor[5], "Distributor@email.com", "Incorrect Distributor's Email");
            assert.equal(distributor[6], 1, "Incorrect Distributor's Account Type");
        });
    });

    it("getUserProfileByAddress(): Retrieves correct Retailer", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.getUserProfileByAddress(retailerAddress);
        }).then(function(retailer) {
            assert.equal(retailer[0], retailerAddress, "Incorrect Retailer's EthAddress");
            assert.equal(retailer[1], "Retailer User", "Incorrect Retailer's Name");
            assert.equal(retailer[2], 0, "Incorrect Retailer's EPC Prefix");
            assert.equal(retailer[3], "Retailer Address", "Incorrect Retailer's Location");
            assert.equal(retailer[4], 4321, "Incorrect Retailer's Contact");
            assert.equal(retailer[5], "Retailer@email.com", "Incorrect Distributor's Email");
            assert.equal(retailer[6], 2, "Incorrect Retailer's Account Type");
        });
    });

    it("getUserProfileByAddress(): Retrieves correct Consumer", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.getUserProfileByAddress(consumerAddress);
        }).then(function(consumer) {
            assert.equal(consumer[0], consumerAddress, "Incorrect Consumer's EthAddress");
            assert.equal(consumer[1], "Consumer User", "Incorrect Consumer's Name");
            assert.equal(consumer[2], 0, "Incorrect Consumer's EPC Prefix");
            assert.equal(consumer[3], "Consumer Address", "Incorrect Consumer's Location");
            assert.equal(consumer[4], 4567, "Incorrect Consumer's Contact");
            assert.equal(consumer[5], "Consumer@email.com", "Incorrect Consumer's Email");
            assert.equal(consumer[6], 3, "Incorrect Consumer's Account Type");
        });
    });
    
    it("getUserProfileByAddress(): Retrieves empty result for incorrect address", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.getUserProfileByAddress(unregisterdAddress);
        }).then(function(user) {
            assert.equal(user[0], "0x0000000000000000000000000000000000000000", "Incorrect User's EthAddress");
            assert.equal(user[1], "", "Incorrect User's Name");
            assert.equal(user[2], 0, "Incorrect User's EPC Prefix");
            assert.equal(user[3], "", "Incorrect User's Location");
            assert.equal(user[4], 0, "Incorrect User's Contact");
            assert.equal(user[5], "", "Incorrect User's Email");
            assert.equal(user[6], 0, "Incorrect User's Account Type");
        });
    });

    it("produceItem(): Registers a new product by a valid manufacturer", function() {
        return Supplychain.deployed().then(function(instance) {
            supplychainInstance = instance;
            return supplychainInstance.produceItem(1234, "Test Product", "12/12/2020",
                "12/11/2022", 4200, "www.productA.com", {from:manufacturerAddress1}
            );
        });
    });
});