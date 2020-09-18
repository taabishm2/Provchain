pragma solidity >=0.4.4;

import "./Roles.sol";


contract AdministratorRole {
    using Roles for Roles.Role;

    event AdministratorAdded(address indexed account);
    event AdministratorRemoved(address indexed account);

    Roles.Role private administrators;

    constructor() public {
        _addAdministrator(msg.sender);
    }

    modifier onlyAdministrator() {
        require(administrators.has(msg.sender),
        "Administrator Only Access");
        _;
    }

    function addAdministrator(address account) public onlyAdministrator {
        _addAdministrator(account);
    }

    function _addAdministrator(address account) internal {
        administrators.add(account);
        emit AdministratorAdded(account);
    }

    function renounceAdministrator() public onlyAdministrator {
        administrators.remove(msg.sender);
        emit AdministratorRemoved(msg.sender);
    }

    function isAdministrator() public view returns(bool) {
        return administrators.has(msg.sender);
    }
}
