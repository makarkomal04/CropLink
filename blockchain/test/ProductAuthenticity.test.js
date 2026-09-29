import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("ProductAuthenticity", function () {
  let ProductAuthenticity;
  let productAuthenticity;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    ProductAuthenticity = await ethers.getContractFactory("ProductAuthenticity");
    productAuthenticity = await ProductAuthenticity.deploy();
    
    if (productAuthenticity.waitForDeployment) {
        await productAuthenticity.waitForDeployment();
    } else if (productAuthenticity.deployed) {
        await productAuthenticity.deployed();
    }
  });

  it("Should register a new product", async function () {
    const batchId = "BATCH001";
    const dataHash = "0x1234567890abcdef";

    await expect(productAuthenticity.registerProduct(batchId, dataHash))
      .to.emit(productAuthenticity, "ProductRegistered")
      .withArgs(batchId, owner.address, dataHash);

    const product = await productAuthenticity.getProduct(batchId);
    expect(product.batchId).to.equal(batchId);
    expect(product.productDataHash).to.equal(dataHash);
    expect(product.registrant).to.equal(owner.address);
  });

  it("Should not allow duplicate registration", async function () {
    const batchId = "BATCH001";
    const dataHash = "0x1234567890abcdef";

    await productAuthenticity.registerProduct(batchId, dataHash);

    await expect(
      productAuthenticity.registerProduct(batchId, "0xnewhash")
    ).to.be.revertedWith("Product already registered");
  });

  it("Should add tracking updates", async function () {
    const batchId = "BATCH002";
    const dataHash = "0xinitial";
    await productAuthenticity.registerProduct(batchId, dataHash);

    const status = "In Transit";
    const updateHash = "0xtransitinfo";

    await expect(productAuthenticity.connect(addr1).addTrackingUpdate(batchId, status, updateHash))
      .to.emit(productAuthenticity, "TrackingUpdate")
      .withArgs(batchId, status, addr1.address, updateHash);

    const product = await productAuthenticity.getProduct(batchId);
    const history = product.history;
    
    expect(history.length).to.equal(2); // Initial registration + 1 update
    expect(history[1].status).to.equal(status);
    expect(history[1].handler).to.equal(addr1.address);
  });

  it("Should verify product hash", async function () {
      const batchId = "BATCH003";
      const dataHash = "0xvalidhash";
      await productAuthenticity.registerProduct(batchId, dataHash);

      const isValid = await productAuthenticity.verifyProductHash(batchId, dataHash);
      expect(isValid).to.be.true;

      const isInvalid = await productAuthenticity.verifyProductHash(batchId, "0xinvalid");
      expect(isInvalid).to.be.false;
  });
});
