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
    mapping(address => uint256) public balances;

    mapping(address => uint256) public nonces;

    // EIP-712 Domain Separator
    bytes32 public DOMAIN_SEPARATOR;

    //Typehash for EIP-721
    bytes32 public constant REQUEST_TYPEHASH = keccak256(
        "PaymentRequest(address sender,uint256 amount,uint256 nonce,uint256 expire)"
    );

    //Events
    event Deposited(address indexed deposit, uint256 amount, uint256 balance);
    event Withdrawn(address indexed withdraw, uint256 amount, uint256 balance);
    event PaymentExecuted(address indexed from, address indexed to, uint256 amount);
    event SignatureVerified();

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                // EIP-712 Domain Separator TypeHash
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("Konektion")),        // name
                keccak256(bytes("1.0")),            // version
                1,                      // chainId
                address(this)                       // verifyingContract
            )
        );

    }

    function Deposit(uint256 amount) nonReentrant external payable{
        require(msg.value >= amount, "Insufficient ether.");
        require(msg.value > 0, "You can't deposit 0 ether.");

        //Update balance mapping
        balances[msg.sender] += msg.value;

        //Emit event
        emit Deposited(msg.sender, msg.value, balances[msg.sender]);
    }

    function Withdraw(uint256 amount) nonReentrant external  {
        require(amount <= balances[msg.sender], "Insufficient funds.");
        require(amount > 0, "You can't withdraw 0 ether");

        //Update balance mapping
        balances[msg.sender] -= amount;

        //Release the fund
        payable(msg.sender).transfer(amount);

        //Emit event
        emit Withdrawn(msg.sender, amount, balances[msg.sender]);
    }

    function verifySignature(
        PaymentRequest memory request,
        bytes memory signature
    ) external view returns (bool){
        // Ensure signature is not expired
        require(block.timestamp <= request.expire, "Signature expired"); 
        // Ensure nonce is correct
        require(request.nonce == nonces[request.sender] + 1, "Invalid nonce");

        return recoverAddressOfRequest(request, signature) == request.sender;
    }

    function Payment(
        PaymentRequest memory request,
        bytes memory signature
    ) nonReentrant external {
        //Ensure signature is valid
        require(this.verifySignature(request, signature), "Signature is invalid");

        //Ensure that user have enough funds
        require(balances[msg.sender] >= request.amount, "Insufficient balance.");

        //Update balances
        balances[msg.sender] -= request.amount;
        balances[request.sender] += request.amount;

        //Emit event
        emit PaymentExecuted(msg.sender, request.sender, request.amount);
    }

    //Helper function
    function recoverAddressOfRequest(
        PaymentRequest memory request,
        bytes memory signature
    ) internal view returns (address) {
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, keccak256(encodeRequest(request)))
        );

        return ECDSA.recover(digest, signature);
    }


    function encodeRequest(PaymentRequest memory request) internal pure returns (bytes memory) {
        return (
            abi.encode(
                REQUEST_TYPEHASH,
                request.sender,
                request.amount,
                request.nonce,
                request.expire
            )
        );
    }



}