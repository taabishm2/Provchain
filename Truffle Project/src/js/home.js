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
      return App.initContract();
    },
  
    initContract: function() {
      $.getJSON("Supplychain.json", function(data) {
        var SupplychainArtifact = data;
        App.contracts.Supplychain = TruffleContract(SupplychainArtifact);
        App.contracts.Supplychain.setProvider(App.web3Provider);
      }).done(function() {
        return App.getProfileAddress();
      })
    },

    getProfileAddress: async function() {
      $("#loadingOverlay").show();
      await sleep(500);
      return App.fetchProfile(App.account);
    },
  
    fetchProfile: async function(accountAddress) {

      var accountTypes = {
          0: "Manufacturer",
          1: "Distributer",
          2: "Retailer",
          3: "Customer"
      }

      App.contracts.Supplychain.deployed().then(function(instance) {
          supplychainInstance = instance;
          return supplychainInstance.getUserProfileByAddress(accountAddress);
      }).then(function(userArray) {
          console.log(accountAddress);
          console.log(userArray);
          if(userArray[0] == "0x0000000000000000000000000000000000000000"){
              $("#loader-text").html("Could Not Locate the Profile. Try Again");
              return;
          }
          $('#welcome-eth-address-div').html(userArray[0]);
          $('#userName').html(userArray[1]);
          $('#plaque-acc-name').html(userArray[1]);
          $('#plaque-acc-email').html(userArray[5]);
          $('#plaque-acc-type').html(accountTypes[userArray[6].c[0]]); 
          $("#loadingOverlay").hide(); 

          return App.filterUserOptions(userArray[6].c[0]);
      });
    },

    filterUserOptions: function(accountType) {
      if(accountType > 0) {
        $("#register-product-plaque").addClass('disabled');
      }
    }
    
  };
  
  $(function() {
    $(window).on('load', function() {
      App.init();
    });
  });
  