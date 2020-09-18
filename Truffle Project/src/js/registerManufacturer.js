App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.enable();
      } catch (error) {
        console.error("User denied account access")
      }
    }
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Supplychain.json", function(data) {
      var SupplychainArtifact = data;
      App.contracts.Supplychain = TruffleContract(SupplychainArtifact);
      App.contracts.Supplychain.setProvider(App.web3Provider);
    });

    return App.setAccount();
  },

  setAccount: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      } else {
        App.account = accounts[0];
        $('#accountAddress').attr('title',App.account);
      }
    });
  },

  registerManufacturer: function() {

    $("#loadingOverlay").show();

    var manufacturerEthAddress = $("#manufacturerEthAddress").val();
    var manufacturerName = $('#manufacturerName').val();
    var manufacturerEpcPrefix = $('#manufacturerEpcPrefix').val();
    var manufacturerAddress = $("#manufacturerAddress").val();
    var manufacturerContactNumber = $('#manufacturerContactNumber').val();
    var manufacturerEmail = $('#manufacturerEmail').val();

    App.contracts.Supplychain.deployed().then(function(instance) {
      supplychainManagerInstance = instance;
      
      return supplychainManagerInstance.registerManufacturer(manufacturerEthAddress, 
        manufacturerName, manufacturerEpcPrefix, manufacturerAddress, 
        manufacturerContactNumber, manufacturerEmail, {from: App.account});

    }).then(function(result) {
      var manufacturerAddedEvent = supplychainManagerInstance.ManufacturerAdded();
      manufacturerAddedEvent.watch(function(error, result){
        if (!error) {
          $("#loadingOverlay").hide();
          showSuccessSnackbar();
          console.log("Added: "+result.args.manufacturerName+" "+result.args.manufacturerEthAddress);
        }
      });
    }).catch(function(err){
      $("#loadingOverlay").hide();
      showErrorSnackbar();
      console.log(err);
    });
  },

  retrieveManufacturerByAddress: function() {
    var manufacturerAddress = $('#getManufacturerAddress').val();

    App.contracts.Supplychain.deployed().then(function(instance) {
      return instance.getManufacturerByAddress(manufacturerAddress);
    }).then(function(result) {
      $("#searchResult").html("Manufacturer: " + result);
      console.log(result);
    }).catch(function(err) {
      alert('Error in Get!');
    });
  }

};

$(function() {
  $(window).on('load', function() {
    App.init();
  });
});
