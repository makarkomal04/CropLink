// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProductAuthenticity
 * @dev Smart contract for product authenticity and supply chain tracking
 */
contract ProductAuthenticity {
    
    struct TrackingStage {
        uint256 timestamp;
        address handler;
        string status;      // e.g., "Harvested", "In Transit", "Stored", "Sold"
        string dataHash;    // Hash of stage specific data (location, temp, etc.)
    }

    struct Product {
        string batchId;
        string productDataHash; // Hash of static product details (Farmer, Crop, Certs)
        address registrant;
        TrackingStage[] history;
        bool exists;
    }

    // Mapping from BatchID to Product
    mapping(string => Product) private products;
    
    // Events
    event ProductRegistered(string indexed batchId, address indexed registrant, string productDataHash);
    event TrackingUpdate(string indexed batchId, string status, address indexed handler, string dataHash);

    // Modifiers
    modifier productExists(string memory _batchId) {
        require(products[_batchId].exists, "Product does not exist");
        _;
    }

    modifier onlyRegistrant(string memory _batchId) {
         require(msg.sender == products[_batchId].registrant, "Only registrant can perform this action");
        _;
    }

    /**
     * @dev Register a new product batch
     * @param _batchId Unique Batch ID
     * @param _productDataHash Hash of the product details
     */
    function registerProduct(string memory _batchId, string memory _productDataHash) external {
        require(!products[_batchId].exists, "Product already registered");
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        
        Product storage newProduct = products[_batchId];
        newProduct.batchId = _batchId;
        newProduct.productDataHash = _productDataHash;
        newProduct.registrant = msg.sender;
        newProduct.exists = true;

        // Add initial "Registered" stage
        newProduct.history.push(TrackingStage({
            timestamp: block.timestamp,
            handler: msg.sender,
            status: "Registered",
            dataHash: _productDataHash
        }));

        emit ProductRegistered(_batchId, msg.sender, _productDataHash);
    }

    /**
     * @dev Add a new tracking update (e.g., Transit, Storage)
     * @param _batchId Unique Batch ID
     * @param _status Status string
     * @param _dataHash Hash of the update tracking data
     */
    function addTrackingUpdate(string memory _batchId, string memory _status, string memory _dataHash) external productExists(_batchId) {
        Product storage product = products[_batchId];
        
        // Anyone can update? Or should we restrict? 
        // For now, let's assume any authorized handler in the system can update.
        // In a real open system, we might whitelist handlers. 
        // For this MVP, we allow open updates but log the msg.sender (handler).

        product.history.push(TrackingStage({
            timestamp: block.timestamp,
            handler: msg.sender,
            status: _status,
            dataHash: _dataHash
        }));

        emit TrackingUpdate(_batchId, _status, msg.sender, _dataHash);
    }

    /**
     * @dev Get product details
     * @param _batchId Unique Batch ID
     * @return batchId The unique batch ID
     * @return productDataHash The hash of the product details
     * @return registrant The address of the registrant
     * @return history The tracking history of the product
     */
    function getProduct(string memory _batchId) external view productExists(_batchId) returns (
        string memory batchId,
        string memory productDataHash,
        address registrant,
        TrackingStage[] memory history
    ) {
        Product storage product = products[_batchId];
        return (
            product.batchId,
            product.productDataHash,
            product.registrant,
            product.history
        );
    }

    /**
     * @dev Verify if a product hash matches the stored hash
     * @param _batchId Unique Batch ID
     * @param _hashToVerify Hash to check
     * @return bool match
     */
    function verifyProductHash(string memory _batchId, string memory _hashToVerify) external view productExists(_batchId) returns (bool) {
         return keccak256(abi.encodePacked(products[_batchId].productDataHash)) == keccak256(abi.encodePacked(_hashToVerify));
    }
}
