const hre = require("hardhat");

async function main() {
  console.log("Deploying ProductAuthenticity contract...");

  const ProductAuthenticity = await hre.ethers.getContractFactory("ProductAuthenticity");
  const productAuthenticity = await ProductAuthenticity.deploy();

  if (productAuthenticity.waitForDeployment) {
      await productAuthenticity.waitForDeployment();
  } else if (productAuthenticity.deployed) {
      await productAuthenticity.deployed();
  }

  const address = await productAuthenticity.getAddress ? await productAuthenticity.getAddress() : productAuthenticity.address;

  console.log(`ProductAuthenticity deployed to: ${address}`);
  
  // Log the address for .env update instructions
  console.log("\nIMPORTANT: Update your .env file with:");
  console.log(`CONTRACT_ADDRESS_AUTHENTICITY=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
