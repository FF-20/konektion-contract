import hre from "hardhat";

async function main() {
  // Compile the contracts (optional if already compiled)
  // await hre.run('compile');

  // Replace with your contract name
  const ContractFactory = await hre.ethers.getContractFactory("Konektion");

  const contract = await ContractFactory.deploy();
        
  await contract.waitForDeployment();

  console.log("Contract deployed to address:", await contract.getAddress());

  // Optionally, verify the contract on Etherscan (if using the Etherscan plugin)
  // await hre.run("verify:verify", {
  //   address: contract.address,
  //   constructorArguments: [constructorArg1, constructorArg2],
  // });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in deployment script:", error);
    process.exit(1);
  });
