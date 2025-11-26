// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function mintTo(address to, uint256 amount) external returns (bool);
    function burn(uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract MockCreditToken is IERC20 {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;
    string public name = "KCC Credit Token";
    string public symbol = "KCC";

    function mintTo(
        address to,
        uint256 amount
    ) external override returns (bool) {
        balances[to] += amount;
        return true;
    }

    function burn(uint256 amount) external override returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        return true;
    }

    function transfer(
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[recipient] += amount;
        return true;
    }

    function approve(
        address spender,
        uint256 amount
    ) external override returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        require(balances[sender] >= amount, "Insufficient balance");
        require(
            allowances[sender][msg.sender] >= amount,
            "Insufficient allowance"
        );

        balances[sender] -= amount;
        allowances[sender][msg.sender] -= amount;
        balances[recipient] += amount;
        return true;
    }

    function balanceOf(
        address account
    ) external view override returns (uint256) {
        return balances[account];
    }
}
