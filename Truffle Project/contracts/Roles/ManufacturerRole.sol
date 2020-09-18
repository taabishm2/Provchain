pragma solidity >=0.4.4;

import "./Roles.sol";


contract ManufacturerRole {
  using Roles for Roles.Role;

  event ManufacturerAdded(address indexed account);
  event ManufacturerRemoved(address indexed account);

  Roles.Role private manufacturers;

  modifier onlyManufacturer() {
    require(isManufacturer(msg.sender), "Manufacturer access only");
    _;
  }

  function isManufacturer(address account) public view returns (bool) {
    return manufacturers.has(account);
  }

  function addManufacturer(address account) public {
    _addManufacturer(account);
  }

  function _addManufacturer(address account) internal {
    manufacturers.add(account);
    emit ManufacturerAdded(account);
  }
}