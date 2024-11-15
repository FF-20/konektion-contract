// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

//Initialize EIP712
contract Konektion is ReentrancyGuard , EIP712("Konektion", "1")  {
    //Stuct
    struct PaymentRequest {
        address sender;
        uint256 amount;
        uint256 nonce;
        uint256 expire;  
    }

    //Mapping
    mapping(address => uint256) private balances;

    mapping(address => uint256) public nonces;

    // EIP-712 Domain Separator
    bytes32 public DOMAIN_SEPARATOR;

    //Typehash for EIP-721
    bytes32 public constant REQUEST_TYPEHASH = keccak256(
        "PaymentRequest(address sender,uint256 amount,uint256 nonce,uint256 expire)"
    );

    //Events
    event Deposit(address indexed address, uint256 amount, uint256 balance);
    event Withdraw(address indexed address, uint256 amount, uint256 balance);
    event Payment(address indexed from, address indexed to, uint256 amount);
    event SignatureVerified();

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                // EIP-712 Domain Separator TypeHash
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("SimplyPay")),        // name
                keccak256(bytes("1.0")),            // version
                block.chainId,                      // chainId
                address(this)                       // verifyingContract
            )
        );

    }

    function Deposit(uint256 amount) nonReentrant external payable{
        require(msg.value >= _tokenAmount, "Insufficient ether.");
        require(msg.value > 0, "You can't deposit 0 ether");

        //Update balance mapping
        balances[msg.sender] += msg.value;

        //Emit event
        emit Deposit(msg.sender, msg.value, balances[msg.sender]);
    }

    function Withdraw(uint256 amount) {
        require(msg.value <= balances[msg.sender], "Insufficient funds");
        require(msg.value > 0, "You can't withdraw 0 ether");

        //Update balance mapping
        balances[msg.sender] -= amount;

        //Release the fund
        payable(msg.sender).transfer(amount);

        //Emit event
        emit Withdraw(msg.sender, amount, balances[msg.sender])
    }

    function Verify() {

    }

    function Payment() {

    }

    //Helper function

}