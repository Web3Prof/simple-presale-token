// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Presale is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    IERC20 token; // token address
    uint256 public presaleSupply; // amount of token left available for presale
    uint256 public presalePrice; // amount of wei (Eth) for 1 token
    bool isActive;

    error InsufficientSupply(uint256 _presaleSupplyLeft);
    event Purchase(address _buyer, uint256 _tokenAmt);

    constructor(address _token, uint256 _presaleSupply, uint256 _presalePrice) {
        token = IERC20(_token);
        presaleSupply = _presaleSupply;
        presalePrice = _presalePrice;
    }

    function startPresale() external onlyOwner {
        token.transferFrom(msg.sender, address(this), presaleSupply);
        isActive = true;
    }

    function endPresale() external onlyOwner {
        isActive = false;
    }

    // to receive Eth
    receive() external payable nonReentrant {
        require(isActive == true, "Inactive presale");
        uint256 boughtAmt = msg.value.mul(10 ** 18).div(presalePrice);

        if (boughtAmt > presaleSupply) {
            revert InsufficientSupply({_presaleSupplyLeft: presaleSupply});
        }

        token.transfer(msg.sender, boughtAmt);
        presaleSupply = presaleSupply.sub(boughtAmt);

        emit Purchase(msg.sender, boughtAmt);
    }

    function withdrawAllEth() external onlyOwner {
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to withdraw Ether");
    }

    function withdrawAllToken() external onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}
