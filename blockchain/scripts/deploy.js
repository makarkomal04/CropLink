import hre from "hardhat";
import fs from 'fs';

async function main() {
  console.log("Deploying OrderContract to", hre.network.name);
  
  // Get the contract factory
  const OrderContract = await hre.ethers.getContractFactory("OrderContract");
  
  // Deploy the contract
  console.log("Deploying contract...");
  const orderContract = await OrderContract.deploy();
  
  await orderContract.waitForDeployment();
  
  const contractAddress = await orderContract.getAddress();
  
  console.log("OrderContract deployed to:", contractAddress);
  console.log("Transaction hash:", orderContract.deploymentTransaction().hash);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deploymentTime: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address
  };
  
  fs.writeFileSync(
    './deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\nDeployment info saved to deployment-info.json");
  
  // Wait for block confirmations if on testnet/mainnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for 6 block confirmations...");
    await orderContract.deploymentTransaction().wait(6);
    console.log("Confirmations received!");
    
    // Verify contract on Polygonscan
    console.log("\nVerifying contract on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

