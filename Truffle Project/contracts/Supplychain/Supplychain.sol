pragma solidity >=0.4.4;

import "../Libraries/Ownable.sol";
import "../Roles/AdministratorRole.sol";
import "../Roles/ManufacturerRole.sol";


contract Supplychain is AdministratorRole, ManufacturerRole {

    uint public manufacturerCount;
    uint public userCount;

    event StateChanged(
        uint indexed epc, address indexed sender, address indexed recipient, address previousOwner,
        State currentState, address manufacturer, string txnLocation, uint timestamp, uint randomNumber
    );
    event ItemProduced(
        uint indexed epc, string productName, address indexed manufacturer, string manufactureDate,
        string expirationDate, uint productMrp, string productUrl, string txnLocation, uint timestamp,
        uint randomNumber
    );
    event ManufacturerAdded (address manufacturerEthAddress, string manufacturerName, uint manufacturerEpcPrefix);
    event UserAdded (address indexed userEthAddress, string userName, AccountType userType);

    struct Item {
        uint epc;
        string productName;
        address manufacturer;
        string manufactureDate;
        string expirationDate;
        uint productMrp;
        string productUrl;
        State state;
        address nextOwner;
        address currentOwner;
        uint randomNumber;
        bool exists;
    }

    struct Manufacturer {
        address manufacturerEthAddress;
        string manufacturerName;
        uint manufacturerEpcPrefix;
        string manufacturerAddress;
        uint manufacturerContactNumber;
        string manufacturerEmail;
        bool exists;
    }

    struct User {
        address accountAddress;
        string accountName;
        AccountType accountType;
        string userAddress;
        uint userContactNumber;
        string userEmail;
        bool exists;
    }

    enum AccountType {
        Manufacturer,
        Distributor,
        Retailer,
        Customer
    }
    enum State {
        Produced,
        Owned,
        Shipped
    }

    mapping (uint => Item) epcToItem;
    mapping (address => Manufacturer) addressToManufacturer;
    mapping (address => User) addressToUser;
    mapping (uint => address) epcToManufacturerEthAddress;

    modifier onlyRegisteredManufacturer(address account) {
        require(addressToManufacturer[account].exists,
        "Manufacturer address does not exist");
        _;
    }

    modifier onlyUnregisteredManufacturer(address account) {
        require(!addressToManufacturer[account].exists,
        "Manufacturer address already exists");
        _;
    }

    modifier onlyUnregisteredUser(address account) {
        require(!addressToUser[account].exists && !addressToManufacturer[account].exists,
        "User address already exists");
        _;
    }

    modifier onlyRegisteredUser(address account) {
        require(addressToUser[account].exists || addressToManufacturer[account].exists,
        "User address doesn't exists");
        _;
    }

    modifier onlyNextOwner(uint epc){
        require(msg.sender == epcToItem[epc].nextOwner,
        "Recipient Only Access");
        _;
    }

    modifier onlyCurrentOwner(uint epc){
        require(msg.sender == epcToItem[epc].currentOwner,
        "Owner Only Access");
        _;
    }

    modifier onlyEpcManufacturer(uint epc) {
        require(1 == 1,
        "Manufacturer Only Access");
        _;
    }

    modifier onlyProduced(uint epc) {
        require(epcToItem[epc].exists,
        "Invalid Product EPC");
        _;
    }

    modifier onlyNotProduced(uint epc) {
        require(epcToItem[epc].exists == false,
        "EPC already exists");
        _;
    }

    modifier onlyOwned(uint epc) {
        require(epcToItem[epc].state == State.Owned,
        "Item state must be 'Owned'");
        _;
    }

    modifier onlyShipped(uint epc) {
        require(epcToItem[epc].state == State.Shipped,
        "Item state must be 'Shipped'");
        _;
    }

    modifier onlyNotCloned(uint epc, uint currRandomNumber) {
        require(epcToItem[epc].randomNumber == currRandomNumber,
        "Secret Desynchronized. Item possibly cloned");
        _;
    }

    function randomNumberGenerator() public view returns (uint randomNumber){
        randomNumber = uint(keccak256(abi.encodePacked(now)))%100000;
        return (randomNumber);
    }

    function registerManufacturer (address accountAddress, string memory accountName, uint manufacturerEpcPrefix,
    string memory manufacturerAddress, uint manufacturerContactNumber, string memory manufacturerEmail) public
    onlyAdministrator() onlyUnregisteredManufacturer(accountAddress) {
        addressToManufacturer[accountAddress].manufacturerEthAddress = accountAddress;
        addressToManufacturer[accountAddress].manufacturerName = accountName;
        addressToManufacturer[accountAddress].manufacturerEpcPrefix = manufacturerEpcPrefix;
        addressToManufacturer[accountAddress].manufacturerAddress = manufacturerAddress;
        addressToManufacturer[accountAddress].manufacturerContactNumber = manufacturerContactNumber;
        addressToManufacturer[accountAddress].manufacturerEmail = manufacturerEmail;
        addressToManufacturer[accountAddress].exists = true;
        addManufacturer(accountAddress);

        manufacturerCount++;
        epcToManufacturerEthAddress[manufacturerEpcPrefix] = accountAddress;
        emit ManufacturerAdded(accountAddress, accountName, manufacturerEpcPrefix);
    }

    function registerOtherUser (string memory accountName, AccountType accountType,
    string memory userAddress, uint userContactNumber, string memory userEmail) public
    onlyUnregisteredUser(msg.sender) {
        addressToUser[msg.sender].accountAddress = msg.sender;
        addressToUser[msg.sender].accountName = accountName;
        addressToUser[msg.sender].accountType = accountType;
        addressToUser[msg.sender].userAddress = userAddress;
        addressToUser[msg.sender].userContactNumber = userContactNumber;
        addressToUser[msg.sender].userEmail = userEmail;
        addressToUser[msg.sender].exists = true;
        //addManufacturer(msg.sender);

        userCount++;
        emit UserAdded(msg.sender, accountName, accountType);
    }

    function getManufacturerByAddress(address manufacturerEthAddress) public view
    returns(address ethAddress, string memory name, uint epcPrefix, string memory location, uint contact,
    string memory email, AccountType accType) {

        return (
            addressToManufacturer[manufacturerEthAddress].manufacturerEthAddress,
            addressToManufacturer[manufacturerEthAddress].manufacturerName,
            addressToManufacturer[manufacturerEthAddress].manufacturerEpcPrefix,
            addressToManufacturer[manufacturerEthAddress].manufacturerAddress,
            addressToManufacturer[manufacturerEthAddress].manufacturerContactNumber,
            addressToManufacturer[manufacturerEthAddress].manufacturerEmail,
            AccountType.Manufacturer
        );
    }

    function getManufacturerByEpc(uint manufacturerEpcPrefix) public view
    returns(address ethAddress, string memory name, uint epcPrefix, string memory location, uint contact,
    string memory email, AccountType accType) {
        address manufacturerEthAddress = epcToManufacturerEthAddress[manufacturerEpcPrefix];
        return getManufacturerByAddress(manufacturerEthAddress);
    }

    function getUserByAddress(address userEthAddress) public view
    returns(address ethAddress, string memory name, uint epcPrefix, string memory location, uint contact,
    string memory email, AccountType accType) {
        return (
            addressToUser[userEthAddress].accountAddress,
            addressToUser[userEthAddress].accountName,
            0, // Non Manufacturers do not posess EPC Prefix
            addressToUser[userEthAddress].userAddress,
            addressToUser[userEthAddress].userContactNumber,
            addressToUser[userEthAddress].userEmail,
            addressToUser[userEthAddress].accountType
        );
    }

    function getUserProfileByAddress(address profileAddress) public view
    returns(address ethAddress, string memory name, uint epcPrefix, string memory location, uint contact,
    string memory email, AccountType accType) {
        if (addressToManufacturer[profileAddress].exists) {
            return getManufacturerByAddress(profileAddress);
        } else if (addressToUser[profileAddress].exists) {
            return getUserByAddress(profileAddress);
        }
    }

    function getUserLocation(address profileAddress) public view
    returns(string memory location) {
        if (addressToManufacturer[profileAddress].exists) {
            return addressToManufacturer[profileAddress].manufacturerAddress;
        } else if (addressToUser[profileAddress].exists) {
            return addressToUser[profileAddress].userAddress;
        }
    }

    function isUser() public view returns(bool) {
        return (addressToManufacturer[msg.sender].exists || addressToUser[msg.sender].exists);
    }

    function produceItem(uint epc, string memory productName, string memory manufactureDate,
    string memory expirationDate, uint productMrp, string memory productUrl) public
    onlyManufacturer() onlyEpcManufacturer(epc) onlyNotProduced(epc) {
        epcToItem[epc].epc = epc;
        epcToItem[epc].productName = productName;
        epcToItem[epc].manufactureDate = manufactureDate;
        epcToItem[epc].expirationDate = expirationDate;
        epcToItem[epc].productMrp = productMrp;
        epcToItem[epc].productUrl = productUrl;
        epcToItem[epc].state = State.Owned;
        epcToItem[epc].currentOwner = msg.sender;
        epcToItem[epc].manufacturer = msg.sender;
        epcToItem[epc].exists = true;
        epcToItem[epc].randomNumber = randomNumberGenerator();
        Item memory item = epcToItem[epc];

        emit StateChanged(epc, item.currentOwner, address(0), address(0), State.Produced,
        item.manufacturer, getUserLocation(msg.sender), now, item.randomNumber);
        emit ItemProduced(epc, productName, item.manufacturer, manufactureDate, expirationDate,
        productMrp, productUrl, getUserLocation(msg.sender), now, item.randomNumber);
    }

    function shipProduct(uint epc, uint currRandomNumber, address nextOwner) public
    onlyProduced(epc) onlyCurrentOwner(epc) onlyOwned(epc) onlyRegisteredUser(nextOwner) onlyNotCloned(epc, currRandomNumber) {
        epcToItem[epc].state = State.Shipped;
        epcToItem[epc].nextOwner = nextOwner;
        epcToItem[epc].randomNumber = randomNumberGenerator();
        Item memory item = epcToItem[epc];

        emit StateChanged(epc, item.currentOwner, item.nextOwner,
        msg.sender, State.Shipped, item.manufacturer, getUserLocation(msg.sender), now, item.randomNumber);
    }
    
    function getRand(uint epc) public view returns(uint){
        return epcToItem[epc].randomNumber;
    }
    function receiveProduct(uint epc, uint currRandomNumber) public
    onlyProduced(epc) onlyNextOwner(epc) onlyShipped(epc) onlyNotCloned(epc, currRandomNumber){
        address previousOwner = epcToItem[epc].currentOwner;
        epcToItem[epc].state = State.Owned;
        epcToItem[epc].currentOwner = msg.sender;
        epcToItem[epc].nextOwner = address(0);
        epcToItem[epc].randomNumber = randomNumberGenerator();
        Item memory item = epcToItem[epc];

        emit StateChanged(epc, item.currentOwner, item.nextOwner,
        previousOwner, State.Owned, item.manufacturer, getUserLocation(msg.sender), now, item.randomNumber);
    }

    function getCurrentOwner(uint epc) public view
    onlyProduced(epc) onlyOwned(epc)
    returns(address) {
        return epcToItem[epc].currentOwner;
    }

    function getRecipient(uint epc) public view
    onlyProduced(epc) onlyShipped(epc)
    returns(address) {
        return epcToItem[epc].nextOwner;
    }

    function getProductDetails(uint epc) public view
    onlyProduced(epc)
    returns(string memory, string memory, string memory, string memory, uint , address  ) {
        return(epcToItem[epc].productName, epcToItem[epc].manufactureDate,
        epcToItem[epc].expirationDate,
        epcToItem[epc].productUrl, epcToItem[epc].productMrp,
        epcToItem[epc].manufacturer);
    }
}