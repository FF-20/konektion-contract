import hre from "hardhat"
import { expect } from "chai";
import {  Contract, Signature, Signer } from 'ethers'
import { Konektion, Konektion__factory } from "../typechain-types";

describe("Konektion", function() {
    let signer: Signer;
    let deployer: Signer;
    let whale_addr: Signer;
    let addr1: Signer;
    let addr2: Signer;
    let merchant: Signer;
    let addr4: Signer;
    let addrs: Signer[];
    let usdt: Contract;
    let KonektionContractFactory: Konektion__factory;
    let Konektion: Konektion;
    let signature: string;
    let expireTime: number;

    async function createSignature(_signer: Signer, _amount: bigint): Promise<{signature: string, message: any}> {
        // Define the domain and types
        const domain = {
           name: 'Konektion',
           version: '1.0',
           chainId: 1, // Mainnet chain ID
           verifyingContract: await Konektion.getAddress(),
       }

       const types = {
           PaymentRequest: [
               {name: "sender", type:"address"},
               {name: "amount", type:"uint256"},
               {name: "nonce", type:"uint256"},
               {name: "expire", type:"uint256"},
           ],
       }

       const currentNonce = await Konektion.nonces(_signer);
       const nonce = hre.ethers.toNumber(currentNonce) + 1;

       // Get the current time in seconds since Unix epoch
       const currentTime = Math.floor(Date.now() / 1000);

       const expireTime = currentTime + 5 * 60; 

       const message = {
           sender: await _signer.getAddress(),
           amount: _amount,
           nonce: nonce,
           expire: expireTime
       }

       signature = await _signer.signTypedData(domain, types, message);

       return {
           signature: signature,
           message: message
       };
   }

    before(async function () {
        [signer, deployer, addr1, addr2, merchant, addr4, ...addrs] = await hre.ethers.getSigners();

        console.log(hre.ethers.parseEther("0.001"));

        KonektionContractFactory = await hre.ethers.getContractFactory("Konektion", deployer);

        Konektion = await KonektionContractFactory.deploy();

        await Konektion.waitForDeployment();
    })

    describe("Should deposit and withdraw", function() {
        it("Should be able to deposit", async function() {
            const depositAmount = hre.ethers.parseEther("100");

            const tx = await Konektion.connect(addr1).Deposit(depositAmount, {
                value: depositAmount,
            })

            await tx.wait();

            //Check event emitted
            expect(tx).to.emit(Konektion, "Deposited")
            .withArgs(addr1.getAddress, depositAmount, depositAmount);

            //Check balances
            expect(
                await Konektion.balances(await addr1.getAddress())
            ).to.equal(depositAmount);

        })
        it("Should not be able to deposit", async function() {
            let depositAmount = hre.ethers.parseEther("1");
            const fakeDepositAmount = hre.ethers.parseEther("0.5");

            await expect(Konektion.connect(addr1).Deposit(depositAmount, {
                value: fakeDepositAmount,
            })
            ).to.be.revertedWith("Insufficient ether.");

            depositAmount = hre.ethers.parseEther("0");
            await expect(Konektion.connect(addr1).Deposit(depositAmount, {
                value: depositAmount,
            })
            ).to.be.revertedWith("You can't deposit 0 ether.");
        })
        it("Should be able to withdraw", async function() {
            const balance_before = await hre.ethers.provider.getBalance(addr1);

            const withdrawAmount = hre.ethers.parseEther("0.5");

            const deltaAmount = hre.ethers.parseEther("0.01");
            const tx = await Konektion.connect(addr1).Withdraw(withdrawAmount);

            await tx.wait();

            //Check event emitted
            expect(tx).to.emit(Konektion, "Withdrawn")
            .withArgs(addr1.getAddress, withdrawAmount, withdrawAmount);

            //Check balances
            expect(
                await Konektion.balances(await addr1.getAddress())
            ).to.equal(hre.ethers.parseEther("99.5"));

            //Check wallet balances
            const balance_after = await hre.ethers.provider.getBalance(addr1);
            
            expect(balance_after).to.be.approximately(balance_before + withdrawAmount, deltaAmount);
        })
        it("Should not be able to withdraw", async function() {
            const withdrawAmount = hre.ethers.parseEther("100");

            const deltaAmount = hre.ethers.parseEther("0.01");

            const balance_before = await hre.ethers.provider.getBalance(addr1);

            await expect(Konektion.connect(addr1).Withdraw(withdrawAmount)
            ).to.be.revertedWith("Insufficient funds.");

            //Check wallet balances
            const balance_after = await hre.ethers.provider.getBalance(addr1);

            expect(balance_after).to.be.approximately(balance_before, deltaAmount);

        })
    })
    describe("Should create and verify signature", function() {
        it("Should create signature", async function() {
            // Define the domain and types
            const domain = {
                name: 'Konektion',
                version: '1.0',
                chainId: 1, // Mainnet chain ID
                verifyingContract: await Konektion.getAddress(),
            }

            const types = {
                PaymentRequest: [
                    {name: "sender", type:"address"},
                    {name: "amount", type:"uint256"},
                    {name: "nonce", type:"uint256"},
                    {name: "expire", type:"uint256"},
                ],
            }

            const currentNonce = await Konektion.nonces(signer);
            const nonce = hre.ethers.toNumber(currentNonce) + 1;

            // Get the current time in seconds since Unix epoch
            const currentTime = Math.floor(Date.now() / 1000);

            expireTime = currentTime + 5 * 60; 
            
            const message = {
                sender: await signer.getAddress(),
                amount: hre.ethers.parseEther("10").toString(),
                nonce: nonce,
                expire: expireTime
            }

            signature = await signer.signTypedData(domain, types, message);

            expect(signature).not.null
        })
        it("Should verify signature", async function() {
            const amount = hre.ethers.parseEther("10").toString();
            const currentNonce = await Konektion.nonces(signer);
            const nonce = hre.ethers.toNumber(currentNonce) + 1;

            const request = {
                sender: await signer.getAddress(),
                amount: amount,
                nonce: nonce,
                expire: expireTime
            }

            expect(
                await Konektion.verifySignature(
                    request,
                    signature
                )
            )
            .to.be.true;
        })
    })
    describe("Should be able to generate signature, and payment", function() {
        it("Should do payment", async function() {
            
            const deltaAmount = hre.ethers.parseEther("0.1");

            const balance_before = await Konektion.balances(addr1);

            const amount = hre.ethers.parseEther("5");
            
            const {signature, message} = await createSignature(merchant, amount);

            const tx = await Konektion.connect(addr1).Payment(message, signature);

            await tx.wait();

            expect(tx).to.emit(Konektion, "PaymentExecuted")
            .withArgs(addr1.getAddress, merchant.getAddress, amount);

            expect(
                await Konektion.balances(merchant)
            ).to.be.equal(amount);

            expect(
                await Konektion.balances(addr1)
            ).to.be.equal(balance_before - amount);
        })
    })

})