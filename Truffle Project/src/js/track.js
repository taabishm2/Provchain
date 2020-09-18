App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return  App.initWeb3();
  },

  initWeb3:  function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {

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
        $('#accountAddress').attr('title', App.account);
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
      return App.getProductEpc();
    });
  },

  getProductEpc: async function() {
    $("#loadingOverlay").show();
    await sleep(1500);
      let searchParams = new URLSearchParams(window.location.search);
      if(searchParams.has('epc')){
          return App.trackProduct(searchParams.get('epc'));
      } else {
          return App.showModal();
      }
  },

  trackProduct: function(epc){

    App.contracts.Supplychain.deployed().then(function(instance) {
      supplychainInstance = instance;
      return supplychainInstance.getProductDetails(epc);

    }).then(function(result) {
      var manufacturerProfileLink = "<a href='profile.html?account="+result[5]+"'>";

        $("#tr-product-epc").html(epc);
        $("#tr-product-name").html(result[0]);
        $("#tr-product-url").html(result[3]);
        $("#tr-product-manufactured").html(result[1]);
        $("#tr-product-expiry").html(result[2]);
        $("#tr-product-mrp").html(result[4].c);
        $("#tr-product-producer").html(manufacturerProfileLink+result[5]+"</a>");
    
    }).catch(function(err){
        $("#loader").hide();
        $("#eventResponse").html("Error Occurred. See console for details");
        console.log(err);
    });

    App.listenForEvents(epc);
},

    listenForEvents: function(epcValue) {
      var arr=[];

        App.contracts.Supplychain.deployed().then(function(instance) {

          instance.StateChanged({epc:epcValue}, {fromBlock: 0, toBlock: 'latest'}).watch(function(error, event) {

            $('#dynamic-group').prepend($('#track-card').clone());

            if(event.args.currentState == 0)
                {$("#eventName").html("Item Produced");
                $("#tr-product-status").html("Item Produced");
                
              }
            else if(event.args.currentState == 1)
                {
                  $("#eventName").html("Item Received");
                  $("#tr-product-status").html("Item Received");
                }
            else if(event.args.currentState == 2){
              
              $("#eventName").html("Item Shipped");
                $("#tr-product-status").html("Item Shipped");
              }
              var senderProfileLink = "<a href='profile.html?account="+event.args.sender+"'>";
              var recepientProfileLink = "<a href='profile.html?account="+event.args.recipient+"'>";
              
                $("#sender").html(senderProfileLink + event.args.sender + "</a>");
                $("#timestamp").html(convertUnixTime(event.args.timestamp));
                $("#tr-product-owner").html(senderProfileLink + event.args.sender + "</a>");
                $('#txnAddress').html(event.args.txnLocation);
                $('#randNumber').html(event.args.randomNumber.c[0]);

                if(event.args.recipient != "0x0000000000000000000000000000000000000000"){
                  $("#recipient").html(recepientProfileLink + event.args.recipient + "</a>");
                } else {
                  $("#recipient").html('<span style="font-size:0.9em; color:#666">NO RECIPIENT</span>');
                }
                              
          });

      });
        $("#loadingOverlay").hide();
      },



    showModal: function() {
      $("#loadingOverlay").hide();
      $('#myModal').modal('show');
    },

    searchProduct: function() {
      var epc = $("#searchEpcQuery").val();
      window.location.replace("track.html?epc="+epc);
    }


};

function convertUnixTime(unixTime) {
  var dt=eval(unixTime*1000);
  var myDate = new Date(dt);
  return(myDate.toLocaleString());
}

    $(function() {
      $(window).on('load', function() {
        App.init();
      });
    });
    