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

  registerProduct: function() {

    $("#loadingOverlay").show();

    var epc = $("#epc").val();
    var productName = $('#productName').val();
    var manufactureDate = $('#manufactureDate').val();
    var expirationDate = $("#expirationDate").val();
    var productMrp = $('#productMrp').val();
    var productUrl = $('#productUrl').val();

    App.contracts.Supplychain.deployed().then(function(instance) {
      supplychainInstance = instance;
      
      return supplychainInstance.produceItem(epc, 
        productName, manufactureDate, expirationDate, 
        productMrp, productUrl, {from: App.account});

    }).then(function(result) {
      var ItemProducedEvent = supplychainInstance.ItemProduced();
      ItemProducedEvent.watch(function(error, result){
        if (!error) {
          $("#loadingOverlay").hide();
          showSuccessSnackbar();
          console.log("Created: "+result.args.epc+" "+result.args.manufacturer);
          console.log("Random Number:"+result.args.randomNumber.c[0]);

          $("#loadingOverlayInner").html("<strong>Product Registered</strong><p style=\"color: #cecece; font-weight: 200; font-size: 0.85em\" id=\"loader-description\">Copy th following details to the NFC Tag</p><p>EPC:&nbsp"+result.args.epc+"<br/>Secret:&nbsp"+result.args.randomNumber+"</p>");
          $('#loadingOverlayInner').css('background-color','#4F8A10')
          $("#loadingOverlay").show();
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
