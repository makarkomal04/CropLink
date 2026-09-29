// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title OrderContract
 * @dev Smart contract for managing agricultural marketplace orders with escrow
 */
contract OrderContract {
    // Order status enumeration
    enum OrderStatus { Created, Paid, Processing, Shipped, Delivered, Completed, Cancelled, Refunded }
    
    // Order structure
    struct Order {
        uint256 orderId;
        string mongoOrderId; // Reference to MongoDB document
        address customer;
        address farmer;
        uint256 totalAmount;
        OrderStatus status;
        uint256 createdAt;
        uint256 paidAt;
        uint256 completedAt;
        bool escrowed;
    }
    
    // State variables
    mapping(uint256 => Order) public orders;
    mapping(string => uint256) public mongoToBlockchainId; // MongoDB ID to blockchain ID mapping
    uint256 public orderCounter;
    address public platformOwner;
    uint256 public platformFeePercent = 2; // 2% platform fee
    
    // Events
    event OrderCreated(uint256 indexed orderId, string mongoOrderId, address indexed customer, address indexed farmer, uint256 amount);
    event OrderPaid(uint256 indexed orderId, uint256 amount);
    event OrderStatusUpdated(uint256 indexed orderId, OrderStatus status);
    event OrderCompleted(uint256 indexed orderId, uint256 farmerPayout, uint256 platformFee);
    event OrderCancelled(uint256 indexed orderId, uint256 refundAmount);
    event PaymentReleased(uint256 indexed orderId, address indexed farmer, uint256 amount);
    
    // Modifiers
    modifier onlyPlatformOwner() {
        require(msg.sender == platformOwner, "Only platform owner can call this");
        _;
    }
    
    modifier orderExists(uint256 _orderId) {
        require(_orderId > 0 && _orderId <= orderCounter, "Order does not exist");
        _;
    }
    
    constructor() {
        platformOwner = msg.sender;
        orderCounter = 0;
    }
    
    /**
     * @dev Create a new order with escrow payment
     * @param _mongoOrderId MongoDB order ID
     * @param _farmer Farmer's wallet address
     */
    function createOrder(string memory _mongoOrderId, address _farmer) external payable returns (uint256) {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(_farmer != address(0), "Invalid farmer address");
        require(_farmer != msg.sender, "Farmer cannot be the customer");
        require(mongoToBlockchainId[_mongoOrderId] == 0, "Order already exists");
        
        orderCounter++;
        
        Order storage newOrder = orders[orderCounter];
        newOrder.orderId = orderCounter;
        newOrder.mongoOrderId = _mongoOrderId;
        newOrder.customer = msg.sender;
        newOrder.farmer = _farmer;
        newOrder.totalAmount = msg.value;
        newOrder.status = OrderStatus.Paid;
        newOrder.createdAt = block.timestamp;
        newOrder.paidAt = block.timestamp;
        newOrder.escrowed = true;
        
        mongoToBlockchainId[_mongoOrderId] = orderCounter;
        
        emit OrderCreated(orderCounter, _mongoOrderId, msg.sender, _farmer, msg.value);
        emit OrderPaid(orderCounter, msg.value);
        
        return orderCounter;
    }
    
    /**
     * @dev Update order status
     * @param _orderId Blockchain order ID
     * @param _status New status
     */
    function updateOrderStatus(uint256 _orderId, OrderStatus _status) external orderExists(_orderId) {
        Order storage order = orders[_orderId];
        
        // Only customer, farmer, or platform owner can update
        require(
            msg.sender == order.customer || 
            msg.sender == order.farmer || 
            msg.sender == platformOwner,
            "Not authorized to update order"
        );
        
        // Validate status transitions
        require(_status != OrderStatus.Created, "Cannot revert to Created status");
        require(order.status != OrderStatus.Completed, "Order already completed");
        require(order.status != OrderStatus.Cancelled, "Order already cancelled");
        
        order.status = _status;
        
        emit OrderStatusUpdated(_orderId, _status);
    }
    
    /**
     * @dev Complete order and release payment to farmer
     * @param _orderId Blockchain order ID
     */
    function completeOrder(uint256 _orderId) external orderExists(_orderId) {
        Order storage order = orders[_orderId];
        
        require(msg.sender == order.customer || msg.sender == platformOwner, "Only customer or platform can complete order");
        require(order.status == OrderStatus.Delivered || order.status == OrderStatus.Shipped, "Order must be delivered or shipped");
        require(order.escrowed, "Order not in escrow");
        
        // Calculate platform fee
        uint256 platformFee = (order.totalAmount * platformFeePercent) / 100;
        uint256 farmerPayout = order.totalAmount - platformFee;
        
        // Update order status
        order.status = OrderStatus.Completed;
        order.completedAt = block.timestamp;
        order.escrowed = false;
        
        // Transfer funds
        payable(order.farmer).transfer(farmerPayout);
        payable(platformOwner).transfer(platformFee);
        
        emit OrderCompleted(_orderId, farmerPayout, platformFee);
        emit PaymentReleased(_orderId, order.farmer, farmerPayout);
    }
    
    /**
     * @dev Cancel order and refund customer
     * @param _orderId Blockchain order ID
     */
    function cancelOrder(uint256 _orderId) external orderExists(_orderId) {
        Order storage order = orders[_orderId];
        
        require(
            msg.sender == order.customer || 
            msg.sender == order.farmer || 
            msg.sender == platformOwner,
            "Not authorized to cancel order"
        );
        require(order.status != OrderStatus.Completed, "Cannot cancel completed order");
        require(order.status != OrderStatus.Delivered, "Cannot cancel delivered order");
        require(order.escrowed, "Order not in escrow");
        
        uint256 refundAmount = order.totalAmount;
        
        // Update order status
        order.status = OrderStatus.Cancelled;
        order.escrowed = false;
        
        // Refund customer
        payable(order.customer).transfer(refundAmount);
        
        emit OrderCancelled(_orderId, refundAmount);
    }
    
    /**
     * @dev Get order details
     * @param _orderId Blockchain order ID
     */
    function getOrder(uint256 _orderId) external view orderExists(_orderId) returns (
        uint256 orderId,
        string memory mongoOrderId,
        address customer,
        address farmer,
        uint256 totalAmount,
        OrderStatus status,
        uint256 createdAt,
        bool escrowed
    ) {
        Order storage order = orders[_orderId];
        return (
            order.orderId,
            order.mongoOrderId,
            order.customer,
            order.farmer,
            order.totalAmount,
            order.status,
            order.createdAt,
            order.escrowed
        );
    }
    
    /**
     * @dev Get blockchain order ID from MongoDB order ID
     * @param _mongoOrderId MongoDB order ID
     */
    function getBlockchainOrderId(string memory _mongoOrderId) external view returns (uint256) {
        return mongoToBlockchainId[_mongoOrderId];
    }
    
    /**
     * @dev Update platform fee percentage
     * @param _newFeePercent New fee percentage
     */
    function updatePlatformFee(uint256 _newFeePercent) external onlyPlatformOwner {
        require(_newFeePercent <= 10, "Fee cannot exceed 10%");
        platformFeePercent = _newFeePercent;
    }
    
    /**
     * @dev Get total orders count
     */
    function getTotalOrders() external view returns (uint256) {
        return orderCounter;
    }
}
