pragma solidity >=0.4.4;

//Source: https://github.com/aragon/zeppelin-solidity/blob/master/contracts/ownership/Ownable.sol
contract Ownable {
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender == owner)
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        if (newOwner != address(0)) owner = newOwner;
    }

}
