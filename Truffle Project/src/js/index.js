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

  logInUser: function() {
    $("#loadingOverlay").show();
    sleep(500);

    App.contracts.Supplychain.deployed().then(async function(instance) {
      $("#loadingOverlay").hide();
      if(await instance.isAdministrator()) {window.location.replace("registerManufacturerAdmin.html");}
      else if(await instance.isUser()) {window.location.replace("home.html");}
      else {window.location.replace("register.html");}
    })
  },

};

$(function() {
  $(window).on('load', function() {
    App.init();
    $('#loginLink').click(function(){App.logInUser(); return false; });
  });
});
