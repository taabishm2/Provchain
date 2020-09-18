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

  shipProduct: function() {

    $("#loadingOverlay").show();
    $('#ship-modal').modal('toggle');

    var epc = $("#epc").val();
    var randNumber = $("#randomNumber").val();
    var recipientEthAddress = $('#recipientEthAddress').val();
    

    App.contracts.Supplychain.deployed().then(function(instance) {
      supplychainInstance = instance;
      console.log("Shipping:"+epc+" to "+recipientEthAddress+" with random number: "+ randNumber);
      return supplychainInstance.shipProduct(epc, randNumber, recipientEthAddress);
      

    }).then(function(result) {
      var ItemShippedEvent = supplychainInstance.StateChanged();
      
      ItemShippedEvent.watch(function(error, result){
        if (!error) {
          $("#loadingOverlay").hide();
          showSuccessSnackbar();
          console.log("Shipped "+result.args.epc);
          console.log("New Random Number:",result.args.randomNumber.c[0])
        }
      });
    }).catch(function(err){
      $("#loadingOverlay").hide();
      showErrorSnackbar();
      console.log(err);
    });
  },

  receiveProduct: function() {
    $("#loadingOverlay").show();
    $('#receive-modal').modal('toggle');

    var epc = $("#epcRec").val();
    var randNumber = $("#randomNumberRec").val();

    App.contracts.Supplychain.deployed().then(function(instance) {
      supplychainInstance = instance;
      console.log("Receiving:"+epc+" with random number "+randNumber);
      return supplychainInstance.receiveProduct(epc, randNumber);
    }).then(function(result) {
      var ItemReceiveEvent = supplychainInstance.StateChanged();
      ItemReceiveEvent.watch(function(error, result){
        if (!error) {
          $("#loadingOverlay").hide();
          showSuccessSnackbar();
          console.log("Received "+result.args.epc);
          console.log("New Random Number:",result.args.randomNumber.c[0])
        } 
      });  
    }).catch(function(err){
      $("#loadingOverlay").hide();
      showErrorSnackbar();
      console.log(err);
    });
  }

};

$(function() {
  $(window).on('load', function() {
    App.init();
  });
});
