async function main() {
    const contract = await ethers.deployContract("Presale", ["0x0", 0, 0]);

    console.log(`Deployed Stake Contract at ${await contract.getAddress()} !`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
