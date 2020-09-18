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

  registerUser: function() {

    $("#loadingOverlay").show();

    var accountTypeMap = {
      "Customer": 3,
      "Retailer": 2,
      "Distributor": 1
    }

    var accountType = $("#accountType").val();
    var userName = $('#accountName').val();
    var userAddress = $('#userAddress').val();
    var userContact = $("#userContact").val();
    var userEmail = $('#userEmail').val();

    App.contracts.Supplychain.deployed().then(function(instance) {
      supplychainManagerInstance = instance;
      console.log(userName, accountTypeMap[accountType], userAddress, userContact, userEmail);
      return supplychainManagerInstance.registerOtherUser(userName, accountTypeMap[accountType], userAddress, userContact, userEmail);
    }).then(function(result) {
      var userAddedEvent = supplychainManagerInstance.UserAdded();
      userAddedEvent.watch(async function(error, result){
        if (!error) {
          $("#loadingOverlay").hide();
          console.log("Added: "+result.args.userName+" "+result.args.userEthAddress+" "+result.args.userType);
          
          $("#loader-description").html("Account created successfully. Redirecting you to your profile");
          $('#loadingOverlayInner').css('background-color','#4F8A10')
          $("#loadingOverlay").show();
          await sleep(2000);
          window.location.replace("home.html");
        }
      });
    }).catch(function(err){
      $("#loadingOverlay").hide();
      showErrorSnackbar();
      console.log(err);
    });
  },

};

$(function() {
  $(window).on('load', function() {
    App.init();
  });
});
