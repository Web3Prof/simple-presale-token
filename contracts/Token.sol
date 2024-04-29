// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _decimals
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, 1000000 * 10 ** _decimals);
    }

    // override to change decimals
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
