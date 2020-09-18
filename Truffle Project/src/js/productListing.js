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

  listenForProducedEvents: function() {
    App.contracts.Supplychain.deployed().then(function(instance) {
      
      $("#manufacturedByTable").find("tr:gt(2)").remove();
      
      instance.ItemProduced({manufacturer: App.account},{fromBlock: 0, toBlock: 'latest'})
      .watch(function(error, event){
        var productTrackLink = "<a href='track.html?epc="+event.args.epc.c[0]+"'>";
        $('#manufacturedByTable').append(
          '<tr><td>'+productTrackLink+event.args.epc.c[0]+'</a></td>'+
          '<td>'+event.args.productName+'</td>'+
          '<td>'+event.args.manufactureDate+'</td>'+
          '<td>'+event.args.expirationDate+'</td>'+
          '<td>'+event.args.productMrp+'</td>'+
          '<td>'+convertUnixTime(event.args.timestamp)+'</td></tr>'
        );
      });
    });
    
  },

  listenForShippedByEvents: function() {
    App.contracts.Supplychain.deployed().then(function(instance) {
      $("#shippedByTable").find("tr:gt(2)").remove();

      instance.StateChanged(
        {sender: App.account},
        {fromBlock: 0, toBlock: 'latest'})
      .watch(async function(error, event){
        if(event.args.recipient != "0x0000000000000000000000000000000000000000"){
          var productArray = await instance.getProductDetails(event.args.epc.c[0]);
          var productTrackLink = "<a href='track.html?epc="+event.args.epc.c[0]+"'>";
          var manufacturerProfileLink = "<a href='profile.html?account="+event.args.manufacturer+"'>";
          var recipientProfileLink = "<a href='profile.html?account="+event.args.recipient+"'>";

          $('#shippedByTable').append(
            '<tr><td>'+productTrackLink+event.args.epc.c[0]+'</a></td>'+
            '<td>'+productArray[0]+'</td>'+
            '<td>'+manufacturerProfileLink+event.args.manufacturer+'</a></td>'+
            '<td>'+recipientProfileLink+event.args.recipient+'</a></td>'+
            '<td>'+convertUnixTime(event.args.timestamp)+'</td></tr>'
          );
        }
      });
    });
  },

  listenForDestinedForEvents: function() {

    App.contracts.Supplychain.deployed().then(function(instance) {
      $("#destinedForTable").find("tr:gt(2)").remove();

      instance.StateChanged(
        {recipient: App.account},
        {fromBlock: 0, toBlock: 'latest'})
      .watch(async function(error, event){
        var productArray = await instance.getProductDetails(event.args.epc.c[0]);
        var manufacturerProfileLink = "<a href='profile.html?account="+event.args.manufacturer+"'>";
        var senderProfileLink = "<a href='profile.html?account="+event.args.sender+"'>";
        var productTrackLink = "<a href='track.html?epc="+event.args.epc.c[0]+"'>";

        $('#destinedForTable').append(
          '<tr><td>'+productTrackLink+event.args.epc.c[0]+'</a></td>'+
          '<td>'+productArray[0]+'</td>'+
          '<td>'+manufacturerProfileLink+event.args.manufacturer+'</a></td>'+
          '<td>'+senderProfileLink+event.args.sender+'</a></td>'+
          '<td>'+convertUnixTime(event.args.timestamp)+'</td></tr>'
        );
      });
    });
  },
  
  listenForReceivedEvents: function() {
    App.contracts.Supplychain.deployed().then(function(instance) {
      $("#receivedByTable").find("tr:gt(2)").remove();

      instance.StateChanged(
        {sender: App.account},
        {fromBlock: 0, toBlock: 'latest'})
      .watch(async function(error, event){
        if(event.args.recipient == "0x0000000000000000000000000000000000000000" &&
        event.args.previousOwner != "0x0000000000000000000000000000000000000000"){
          var productArray = await instance.getProductDetails(event.args.epc.c[0]);

          var productTrackLink = "<a href='track.html?epc="+event.args.epc.c[0]+"'>";
          var manufacturerProfileLink = "<a href='profile.html?account="+event.args.manufacturer+"'>";
          var oldOwnerProfileLink = "<a href='profile.html?account="+event.args.previousOwner+"'>";
          
          $('#receivedByTable').append(
            '<tr><td>'+productTrackLink+event.args.epc.c[0]+'</a></td>'+
            '<td>'+productArray[0]+'</td>'+
            '<td>'+manufacturerProfileLink+event.args.manufacturer+'</a></td>'+
            '<td>'+oldOwnerProfileLink+event.args.previousOwner+'</a></td>'+
            '<td>'+convertUnixTime(event.args.timestamp)+'</td></tr>'
          );
        }
      });
    });
  }

}

function convertUnixTime(unixTime) {
  var dt=eval(unixTime*1000);
  var myDate = new Date(dt);
  return(myDate.toLocaleString());
}


$(function() {
  $(window).on('load', async function() {
    await App.init();
    $(".tableLinks").click(function () { 
      $(".tableLinks").css("color", "blue");
      $(this).css("color", "#8D0531");
    });
  });
});
  