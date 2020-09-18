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
        let searchParams = new URLSearchParams(window.location.search);
        if(searchParams.has('account')){
            return App.fetchProfile(searchParams.get('account'));
        } else {
            return App.fetchProfile(App.account);
        }
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
            $('#plaque-acc-name-div').html(userArray[1]);
            $('#plaque-acc-email-div').html(userArray[5]);
            $('#plaque-acc-contact-div').html(userArray[4].c[0]);
            $('#plaque-acc-address-div').html(userArray[3]);
            $('#plaque-acc-type-div').html(accountTypes[userArray[6].c[0]]); 
            $("#loadingOverlay").hide(); 
        });

        return App.getProductListing(accountAddress);
    },

    getProductListing: function(accountAddress) {
        App.contracts.Supplychain.deployed().then(function(instance) {
      
            $("#user-product-listing").find("tr:gt(0)").remove();
            
            instance.StateChanged(
                {sender: accountAddress},
                {fromBlock: 0, toBlock: 'latest'})
            .watch(async function(error, event){
                var productArray = await instance.getProductDetails(event.args.epc.c[0]);
                var productTrackLink = "<a href='track.html?epc="+event.args.epc.c[0]+"'>";
                var manufacturerProfileLink = "<a href='profile.html?account="+event.args.manufacturer+"'>";

                $('#user-product-listing').append(
                    '<tr><td>'+productTrackLink+event.args.epc.c[0]+'</a></td>'+
                    '<td>'+productArray[0]+'</td>'+
                    '<td>'+manufacturerProfileLink+event.args.manufacturer+'</a></td>'+
                    '<td>'+convertUnixTime(event.args.timestamp)+'</td></tr>'
                );
            });
        });
    },

    searchProfile: function(){
      var account = $("#searchEthQuery").val();
      window.location.replace("profile.html?account="+account);
    }
  };
  
  $(function() {
    $(window).on('load', function() {
      App.init();
    });
  });
  