// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol"; // IERC20 is for interface

contract Doge is ERC20 { 
    
    constructor() ERC20("Dogecoin", "DOGE") public { 
        _mint(msg.sender, 1000);
    }
}