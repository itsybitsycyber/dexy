// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol"; // IERC20 is for interface
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable { 

    struct Token { 
        bytes32 ticker; 
        address tokenAddress;
    }

    mapping(bytes32 => Token)  public tokenMapping; 
    bytes32[] public tokenList;

    mapping(address => mapping(bytes32 => uint256)) public balances;

    modifier token_dne(bytes32 ticker){ 
        require(tokenMapping[ticker].tokenAddress != address(0), "Token does not exist.");
        _;
    }

    function addToken(bytes32 ticker, address tokenAddress) onlyOwner external { 
        tokenMapping[ticker] = Token(ticker, tokenAddress);
        tokenList.push(ticker);
        }

    function deposit(uint amount, bytes32 ticker) token_dne(ticker) external { 

        IERC20(tokenMapping[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender][ticker] =  balances[msg.sender][ticker] + amount;
    }

    function withdraw(uint amount, bytes32 ticker) token_dne(ticker) external { 
    
        require(balances[msg.sender][ticker] >= amount, "Insufficient balance");

        balances[msg.sender][ticker] =  balances[msg.sender][ticker] - amount;
        IERC20(tokenMapping[ticker].tokenAddress).transfer(msg.sender, amount);
    }

    function depositEth() payable external {
        balances[msg.sender][bytes32("ETH")] = balances[msg.sender][bytes32("ETH")] + msg.value;
    }
    
     function withdrawEth(uint amount) external {
        require(balances[msg.sender][bytes32("ETH")] >= amount,'Insuffient balance'); 
        balances[msg.sender][bytes32("ETH")] = balances[msg.sender][bytes32("ETH")]  - amount;
        msg.sender.call{value:amount}("");
    } 
    
}