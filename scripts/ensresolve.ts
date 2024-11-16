import hre from "hardhat";

async function main(name: string, data: any) {

    let wallet;
    let provider
    const abi = [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "ECDSAInvalidSignature",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "length",
              "type": "uint256"
            }
          ],
          "name": "ECDSAInvalidSignatureLength",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "s",
              "type": "bytes32"
            }
          ],
          "name": "ECDSAInvalidSignatureS",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "InvalidInitialization",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "NotInitializing",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "string[]",
              "name": "urls",
              "type": "string[]"
            },
            {
              "internalType": "bytes",
              "name": "callData",
              "type": "bytes"
            },
            {
              "internalType": "bytes4",
              "name": "callbackFunction",
              "type": "bytes4"
            },
            {
              "internalType": "bytes",
              "name": "extraData",
              "type": "bytes"
            }
          ],
          "name": "OffchainLookup",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "OwnableInvalidOwner",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "OwnableUnauthorizedAccount",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint64",
              "name": "version",
              "type": "uint64"
            }
          ],
          "name": "Initialized",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address[]",
              "name": "signers",
              "type": "address[]"
            }
          ],
          "name": "NewSigners",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_url",
              "type": "string"
            },
            {
              "internalType": "address[]",
              "name": "_signers",
              "type": "address[]"
            }
          ],
          "name": "initialize",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "target",
              "type": "address"
            },
            {
              "internalType": "uint64",
              "name": "expires",
              "type": "uint64"
            },
            {
              "internalType": "bytes",
              "name": "request",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "result",
              "type": "bytes"
            }
          ],
          "name": "makeSignatureHash",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "pure",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes",
              "name": "name",
              "type": "bytes"
            }
          ],
          "name": "resolve",
          "outputs": [
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes",
              "name": "response",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "extraData",
              "type": "bytes"
            }
          ],
          "name": "resolveWithProof",
          "outputs": [
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address[]",
              "name": "_signers",
              "type": "address[]"
            }
          ],
          "name": "setSigners",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_url",
              "type": "string"
            }
          ],
          "name": "setURL",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "signers",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "interfaceID",
              "type": "bytes4"
            }
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "pure",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "url",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
   

    if(process.env.ALCHEMY_SEPOLIA_API){
        provider = new hre.ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_API);
    }

    if(process.env.PRIVATE_KEY){

        wallet = new hre.ethers.Wallet(
            process.env.PRIVATE_KEY,
            provider
        )
    }

    const contract = new hre.ethers.Contract(
        "0xf26c74F639FaDF72F5047184a8a938c94c3a5F7C",
        abi,
        wallet
    )

    try {
        // Attempt to call resolve
        const result = await contract.resolve(hre.ethers.toUtf8Bytes(name));
        console.log('On-chain data:', result);
    } catch (error: any) {
        if (error.errorName === 'OffchainLookup') {
            // Extract error arguments
            const [sender, urls, callData, callbackFunction, extraData] = error.errorArgs;

            console.log(sender);

            // Replace the {sender} placeholder in the URL
            const url = urls[0].replace('{sender}', sender);

            console.log(url);

            // Fetch data from the gateway
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender, data: callData })
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data from gateway: ${response.statusText}`);
            }

            const responseData = await response.json();

            // Call the callback function with the fetched data
            const callbackTx = await contract.resolveCallback(responseData.signature, responseData.message.sender, parseInt(responseData.message.amount));
            console.log('Callback transaction hash:', callbackTx.hash);

            // Optionally, wait for the transaction to be mined
            const receipt = await callbackTx.wait();
            console.log('Callback transaction mined:', receipt.transactionHash);
        } else {
            console.error('Unexpected error:', error);
        }
    }

}

main("sub1.alice.eth", '0x').catch(console.error);


