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
    let addr3: Signer;
    let addr4: Signer;
    let addrs: Signer[];
    let usdt: Contract;
    let KonektionContractFactory: Konektion__factory;
    let Konektion: Konektion;
    let signature: string;
    let expireTime: number;

    before(async function () {
        [signer, deployer, addr1, addr2, addr3, addr4, ...addrs] = await hre.ethers.getSigners();

        KonektionContractFactory = await hre.ethers.getContractFactory("Konektion", deployer);

        Konektion = await KonektionContractFactory.deploy();

        await Konektion.waitForDeployment();
    })

    describe("Should deposit and withdraw", function() {
        it("Should be able to deposit", async function() {
            const depositAmount = hre.ethers.parseEther("1");

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
            ).to.equal(withdrawAmount);

            //Check wallet balances
            const balance_after = await hre.ethers.provider.getBalance(addr1);
            
            expect(balance_after).to.be.approximately(balance_before + withdrawAmount, deltaAmount);
        })
        it("Should not be able to withdraw", async function() {
            const withdrawAmount = hre.ethers.parseEther("0.6");

            const deltaAmount = hre.ethers.parseEther("0.01");

            const balance_before = await hre.ethers.provider.getBalance(addr1);

            await expect(Konektion.connect(addr1).Withdraw(withdrawAmount)
            ).to.be.revertedWith("Insufficient funds.");

            //Check wallet balances
            const balance_after = await hre.ethers.provider.getBalance(addr1);

            console.log(hre.ethers.ensNormalize("Zesti"));
            console.log(hre.ethers.namehash(hre.ethers.ensNormalize("zesti")));

            expect(balance_after).to.be.approximately(balance_before, deltaAmount);

        })
    })
})