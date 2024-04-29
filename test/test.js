const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Presale Testing", () => {

    let token;
    let tokenAddr;
    let presale;
    let presaleAddr;

    beforeEach(async () => {
        token = await ethers.deployContract("Token", ["REMToken", "REM", 18]);
        tokenAddr = await token.getAddress();
        // console.log(tokenAddr);

        // parseEther is for 18 decimals, can also be used for tokens
        presale = await ethers.deployContract("Presale", [tokenAddr, ethers.parseEther("100000"), ethers.parseEther("0.001")]);
        presaleAddr = await presale.getAddress();

        await token.approve(presaleAddr, ethers.parseEther("100000"));
    });

    it("Check presale contract token balance", async () => {
        let [deployer, buyer1, buyer2] = await ethers.getSigners();
        await presale.startPresale();
        const balance = await token.balanceOf(presaleAddr);
        // console.log(balance);

        expect(balance).to.be.eq(ethers.parseEther("100000"));
    });

    it("Buyer should get token", async () => {
        let [deployer, buyer1, buyer2] = await ethers.getSigners();

        await presale.startPresale();

        // buy 1000 token
        const buyTx1 = {
            to: presaleAddr,
            value: ethers.parseEther('1', 'ether')
        };

        await buyer1.sendTransaction(buyTx1);
        const buyer1TokenBal = await token.balanceOf(buyer1.address);

        // buy 10000 token
        const buyTx2 = {
            to: presaleAddr,
            value: ethers.parseEther('10', 'ether')
        };

        await buyer2.sendTransaction(buyTx2);
        const buyer2TokenBal = await token.balanceOf(buyer2.address);


        expect(buyer1TokenBal).to.be.eq(ethers.parseEther("1000"));
        expect(buyer2TokenBal).to.be.eq(ethers.parseEther("10000"));

    });

    it("Should revert showing available supply", async () => {
        let [deployer, buyer1, buyer2] = await ethers.getSigners();

        await presale.startPresale();

        // buy 1000 token
        const buyTx1 = {
            to: presaleAddr,
            value: ethers.parseEther('1', 'ether')
        };

        await buyer1.sendTransaction(buyTx1);

        // buy fractional token
        const buyTx2 = {
            to: presaleAddr,
            value: ethers.parseEther('0.0050376', 'ether')
        };

        await buyer1.sendTransaction(buyTx2);

        const buyer1TokenBal = await token.balanceOf(buyer1.address);
        // console.log(buyer1TokenBal);

        // console.log(await ethers.provider.getBalance(presaleAddr));

        // buy 100000 token
        const buyTx3 = {
            to: presaleAddr,
            value: ethers.parseEther('100', 'ether')
        };

        await expect(buyer2.sendTransaction(buyTx3)).to.be.revertedWithCustomError(presale, "InsufficientSupply");

    });

    it("Owner should be able to withdraw token and eth", async () => {
        let [deployer, buyer1, buyer2] = await ethers.getSigners();

        await presale.startPresale();

        // buy 1000 token
        const buyTx1 = {
            to: presaleAddr,
            value: ethers.parseEther('1', 'ether')
        };

        await buyer1.sendTransaction(buyTx1);
        const buyer1TokenBal = await token.balanceOf(buyer1.address);

        // buy 10000 token
        const buyTx2 = {
            to: presaleAddr,
            value: ethers.parseEther('10', 'ether')
        };

        await buyer2.sendTransaction(buyTx2);
        const buyer2TokenBal = await token.balanceOf(buyer2.address);

        await presale.withdrawAllEth();
        await presale.withdrawAllToken();
        // console.log("Deployer Eth Balance: ", await ethers.provider.getBalance(deployer.address));
        // console.log("Deployer token balance: ", await token.balanceOf(deployer.address));
    });
});