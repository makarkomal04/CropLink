import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;


describe("OrderContract", function () {
  let orderContract;
  let owner, customer, farmer, otherAccount;
  
  beforeEach(async function () {
    // Get signers
    [owner, customer, farmer, otherAccount] = await ethers.getSigners();
    
    // Deploy contract
    const OrderContract = await ethers.getContractFactory("OrderContract");
    orderContract = await OrderContract.deploy();
    await orderContract.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct platform owner", async function () {
      expect(await orderContract.platformOwner()).to.equal(owner.address);
    });
    
    it("Should initialize with 0 orders", async function () {
      expect(await orderContract.orderCounter()).to.equal(0);
    });
    
    it("Should have default platform fee of 2%", async function () {
      expect(await orderContract.platformFeePercent()).to.equal(2);
    });
  });
  
  describe("Order Creation", function () {
    const mongoOrderId = "mongo_order_123";
    const orderAmount = ethers.parseEther("1.0");
    
    it("Should create order successfully with payment", async function () {
      const tx = await orderContract.connect(customer).createOrder(
        mongoOrderId,
        farmer.address,
        { value: orderAmount }
      );
      
      await expect(tx)
        .to.emit(orderContract, "OrderCreated")
        .withArgs(1, mongoOrderId, customer.address, farmer.address, orderAmount);
      
      await expect(tx)
        .to.emit(orderContract, "OrderPaid")
        .withArgs(1, orderAmount);
      
      expect(await orderContract.orderCounter()).to.equal(1);
    });
    
    it("Should store order details correctly", async function () {
      await orderContract.connect(customer).createOrder(
        mongoOrderId,
        farmer.address,
        { value: orderAmount }
      );
      
      const order = await orderContract.getOrder(1);
      
      expect(order.orderId).to.equal(1);
      expect(order.mongoOrderId).to.equal(mongoOrderId);
      expect(order.customer).to.equal(customer.address);
      expect(order.farmer).to.equal(farmer.address);
      expect(order.totalAmount).to.equal(orderAmount);
      expect(order.status).to.equal(1); // Paid status
      expect(order.escrowed).to.equal(true);
    });
    
    it("Should map MongoDB ID to blockchain ID", async function () {
      await orderContract.connect(customer).createOrder(
        mongoOrderId,
        farmer.address,
        { value: orderAmount }
      );
      
      const blockchainId = await orderContract.getBlockchainOrderId(mongoOrderId);
      expect(blockchainId).to.equal(1);
    });
    
    it("Should fail if payment amount is 0", async function () {
      await expect(
        orderContract.connect(customer).createOrder(mongoOrderId, farmer.address, { value: 0 })
      ).to.be.revertedWith("Payment amount must be greater than 0");
    });
    
    it("Should fail if farmer address is invalid", async function () {
      await expect(
        orderContract.connect(customer).createOrder(
          mongoOrderId,
          ethers.ZeroAddress,
          { value: orderAmount }
        )
      ).to.be.revertedWith("Invalid farmer address");
    });
    
    it("Should fail if customer and farmer are same", async function () {
      await expect(
        orderContract.connect(customer).createOrder(
          mongoOrderId,
          customer.address,
          { value: orderAmount }
        )
      ).to.be.revertedWith("Farmer cannot be the customer");
    });
    
    it("Should fail if order already exists", async function () {
      await orderContract.connect(customer).createOrder(
        mongoOrderId,
        farmer.address,
        { value: orderAmount }
      );
      
      await expect(
        orderContract.connect(customer).createOrder(
          mongoOrderId,
          farmer.address,
          { value: orderAmount }
        )
      ).to.be.revertedWith("Order already exists");
    });
  });
  
  describe("Order Status Updates", function () {
    const mongoOrderId = "mongo_order_456";
    const orderAmount = ethers.parseEther("2.0");
    
    beforeEach(async function () {
      await orderContract.connect(customer).createOrder(
        mongoOrderId,
        farmer.address,
        { value: orderAmount }
      );
    });
    
    it("Should allow customer to update order status", async function () {
      await expect(
        orderContract.connect(customer).updateOrderStatus(1, 2) // Processing
      ).to.emit(orderContract, "OrderStatusUpdated").withArgs(1, 2);
      
      const order = await orderContract.getOrder(1);
      expect(order.status).to.equal(2);
    });
    
    it("Should allow farmer to update order status", async function () {
      await expect(
        orderContract.connect(farmer).updateOrderStatus(1, 3) // Shipped
      ).to.emit(orderContract, "OrderStatusUpdated").withArgs(1, 3);
    });
    
    it("Should allow platform owner to update order status", async function () {
      await expect(
        orderContract.connect(owner).updateOrderStatus(1, 4) // Delivered
      ).to.emit(orderContract, "OrderStatusUpdated").withArgs(1, 4);
    });
    
    it("Should fail if unauthorized user tries to update", async function () {
      await expect(
        orderContract.connect(otherAccount).updateOrderStatus(1, 2)
      ).to.be.revertedWith("Not authorized to update order");
    });
  });
  
  describe("Order Completion", function () {
    const mongoOrderId = "mongo_order_789";
    const orderAmount = ethers.parseEther("10.0");
    
    beforeEach(async function () {
      await orderContract.connect(customer).createOrder(
        mongoOrderId,
        farmer.address,
        { value: orderAmount }
      );
      
      // Update to delivered status
      await orderContract.connect(farmer).updateOrderStatus(1, 4); // Delivered
    });
    
    it("Should complete order and transfer funds correctly", async function () {
      const farmerBalanceBefore = await ethers.provider.getBalance(farmer.address);
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      
      const platformFee = (orderAmount * 2n) / 100n; // 2%
      const farmerPayout = orderAmount - platformFee;
      
      await expect(
        orderContract.connect(customer).completeOrder(1)
      ).to.emit(orderContract, "OrderCompleted")
        .withArgs(1, farmerPayout, platformFee);
      
      const farmerBalanceAfter = await ethers.provider.getBalance(farmer.address);
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      
      expect(farmerBalanceAfter - farmerBalanceBefore).to.equal(farmerPayout);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(platformFee);
    });
    
    it("Should update order status to completed", async function () {
      await orderContract.connect(customer).completeOrder(1);
      
      const order = await orderContract.getOrder(1);
      expect(order.status).to.equal(5); // Completed
      expect(order.escrowed).to.equal(false);
    });
    
    it("Should fail if not authorized", async function () {
      await expect(
        orderContract.connect(farmer).completeOrder(1)
      ).to.be.revertedWith("Only customer or platform can complete order");
    });
  });
  
  describe("Order Cancellation", function () {
    const mongoOrderId = "mongo_order_cancel";
    const orderAmount = ethers.parseEther("5.0");
    
    beforeEach(async function () {
      await orderContract.connect(customer).createOrder(
        mongoOrderId,
        farmer.address,
        { value: orderAmount }
      );
    });
    
    it("Should cancel order and refund customer", async function () {
      const customerBalanceBefore = await ethers.provider.getBalance(customer.address);
      
      const tx = await orderContract.connect(customer).cancelOrder(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const customerBalanceAfter = await ethers.provider.getBalance(customer.address);
      
      // Customer should receive refund minus gas costs
      expect(customerBalanceAfter - customerBalanceBefore + gasUsed).to.equal(orderAmount);
      
      const order = await orderContract.getOrder(1);
      expect(order.status).to.equal(6); // Cancelled
      expect(order.escrowed).to.equal(false);
    });
    
    it("Should emit OrderCancelled event", async function () {
      await expect(
        orderContract.connect(customer).cancelOrder(1)
      ).to.emit(orderContract, "OrderCancelled").withArgs(1, orderAmount);
    });
    
    it("Should fail if order is delivered", async function () {
      await orderContract.connect(farmer).updateOrderStatus(1, 4); // Delivered
      
      await expect(
        orderContract.connect(customer).cancelOrder(1)
      ).to.be.revertedWith("Cannot cancel delivered order");
    });
  });
  
  describe("Platform Fee Management", function () {
    it("Should allow owner to update platform fee", async function () {
      await orderContract.connect(owner).updatePlatformFee(5);
      expect(await orderContract.platformFeePercent()).to.equal(5);
    });
    
    it("Should fail if fee exceeds 10%", async function () {
      await expect(
        orderContract.connect(owner).updatePlatformFee(11)
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });
    
    it("Should fail if non-owner tries to update fee", async function () {
      await expect(
        orderContract.connect(customer).updatePlatformFee(3)
      ).to.be.revertedWith("Only platform owner can call this");
    });
  });
});
