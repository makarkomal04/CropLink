const { ethers } = require('ethers');
const crypto = require('crypto');

/**
 * Blockchain Service for interacting with Polygon network
 * Handles wallet generation, smart contract interactions, and transaction monitoring
 */
class BlockchainService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.authenticityContract = null;
        this.isEnabled = process.env.BLOCKCHAIN_ENABLED === 'true';
        
        if (this.isEnabled) {
            this.initialize();
        } else {
            console.log('⚠️ Blockchain disabled. Running in DEMO MODE with mock data.');
        }
    }
    
    /**
     * Initialize blockchain connection
     */
    initialize() {
        try {
            // Connect to Polygon network
            const rpcUrl = process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com';
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            
            // Setup signer for contract interactions
            if (process.env.PRIVATE_KEY) {
                this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
                console.log('✅ Blockchain service initialized with signer:', this.signer.address);
            } else {
                console.warn('⚠️ No private key provided, read-only mode');
            }
            
            // Load Authenticity Contract
            if (process.env.CONTRACT_ADDRESS_AUTHENTICITY) {
                this.loadAuthenticityContract();
            }
        } catch (error) {
            console.error('❌ Blockchain initialization error:', error.message);
            this.isEnabled = false;
        }
    }
    
    /**
     * Generate a new wallet for a user
     * @returns {Object} { address, privateKey, mnemonic }
     */
    generateWallet() {
        try {
            const wallet = ethers.Wallet.createRandom();
            
            return {
                address: wallet.address,
                privateKey: wallet.privateKey,
                mnemonic: wallet.mnemonic.phrase
            };
        } catch (error) {
            console.error('Error generating wallet:', error);
            throw new Error('Failed to generate wallet');
        }
    }
    
    /**
     * Encrypt private key for storage
     * @param {string} privateKey 
     * @returns {string} encrypted private key
     */
    encryptPrivateKey(privateKey) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return iv.toString('hex') + ':' + encrypted;
    }
    
    /**
     * Decrypt private key
     * @param {string} encryptedKey 
     * @returns {string} decrypted private key
     */
    decryptPrivateKey(encryptedKey) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);
        
        const parts = encryptedKey.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    /**
     * Load the ProductAuthenticity Contract
     */
    loadAuthenticityContract() {
        // ABI for ProductAuthenticity (copy from compiled artifact or simplified version)
        const authenticityABI = [
            "function registerProduct(string memory _batchId, string memory _productDataHash) external",
            "function addTrackingUpdate(string memory _batchId, string memory _status, string memory _dataHash) external",
            "function getProduct(string memory _batchId) external view returns (string, string, address, tuple(uint256 timestamp, address handler, string status, string dataHash)[])",
            "function verifyProductHash(string memory _batchId, string memory _hashToVerify) external view returns (bool)",
            "event ProductRegistered(string indexed batchId, address indexed registrant, string productDataHash)",
            "event TrackingUpdate(string indexed batchId, string status, address indexed handler, string dataHash)"
        ];
        
        if (!process.env.CONTRACT_ADDRESS_AUTHENTICITY) {
            console.warn('⚠️ CONTRACT_ADDRESS_AUTHENTICITY not set in .env');
            return;
        }

        this.authenticityContract = new ethers.Contract(
            process.env.CONTRACT_ADDRESS_AUTHENTICITY,
            authenticityABI,
            this.signer || this.provider
        );
        
        console.log('✅ ProductAuthenticity Contract loaded at:', process.env.CONTRACT_ADDRESS_AUTHENTICITY);
    }

    /**
     * Register product on blockchain
     * @param {string} batchId 
     * @param {Object} productDetails - Object containing details to hash
     * @param {string} [privateKey] - Optional private key to sign with (overrides default signer)
     * @returns {Promise<Object>} transaction receipt
     */
    async registerProductOnBlockchain(batchId, productDetails, privateKey = null) {
        if (!this.isEnabled) {
            console.log("MOCK BLOCKCHAIN: Registering", batchId);
             return {
                txHash: "0xdemoAuth" + crypto.randomBytes(30).toString('hex'),
                blockNumber: 12345690,
                dataHash: "0x" + crypto.randomBytes(32).toString('hex')
            };
        }

        if (!this.authenticityContract) this.loadAuthenticityContract();
        if (!this.authenticityContract) throw new Error('Authenticity contract not loaded');

        try {
            // Create a deterministic hash of the product details
            // Sort keys to ensure consistent hashing
            const dataString = JSON.stringify(productDetails, Object.keys(productDetails).sort());
            const dataHash = crypto.createHash('sha256').update(dataString).digest('hex');
            const dataHashPrefixed = '0x' + dataHash;
            
            let contractToUse = this.authenticityContract;
            
            // If private key provided, use it to sign
            if (privateKey) {
                const wallet = new ethers.Wallet(privateKey, this.provider);
                contractToUse = this.authenticityContract.connect(wallet);
                console.log(`Signing transaction with user wallet: ${wallet.address}`);
            }

            const tx = await contractToUse.registerProduct(batchId, dataHashPrefixed);
            console.log(`Transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`Product ${batchId} registered on blockchain. Block: ${receipt.blockNumber}`);

            return {
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                dataHash: dataHashPrefixed
            };
        } catch (error) {
            console.error('Error registering product on blockchain:', error);
            // Don't throw if just a duplicate, maybe? 
            // require(!products[_batchId].exists, "Product already registered");
            if (error.message.includes("Product already registered")) {
                console.warn("Product was already registered on chain.");
                // Return dummy success or fetch existing?
                return { txHash: "EXISTING_ON_CHAIN", dataHash: "0x00" }; 
            }
            throw error;
        }
    }

    /**
     * Add tracking update to blockchain
     * @param {string} batchId 
     * @param {string} status 
     * @param {Object} stageData - Data to hash for this stage
     * @returns {Promise<Object>}
     */
    async addTrackingUpdateOnBlockchain(batchId, status, stageData) {
        if (!this.isEnabled) {
            return {
                txHash: "0xdemoUpdate" + crypto.randomBytes(30).toString('hex')
            };
        }

        if (!this.authenticityContract) this.loadAuthenticityContract();
        if (!this.authenticityContract) throw new Error('Authenticity contract not loaded');

        try {
            const dataString = JSON.stringify(stageData, Object.keys(stageData).sort());
            const dataHash = crypto.createHash('sha256').update(dataString).digest('hex');
            const dataHashPrefixed = '0x' + dataHash;

            const tx = await this.authenticityContract.addTrackingUpdate(batchId, status, dataHashPrefixed);
            const receipt = await tx.wait();

            return {
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                dataHash: dataHashPrefixed
            };
        } catch (error) {
            console.error('Error adding tracking update:', error);
            throw error;
        }
    }

    /**
     * Verify product authenticity
     * @param {string} batchId 
     * @param {Object} productDetails - Details to verify against on-chain hash
     */
    async verifyProductOnBlockchain(batchId, productDetails) {
        if (!this.isEnabled) {
            return { isValid: true, verified: true, demo: true };
        }

        if (!this.authenticityContract) this.loadAuthenticityContract();
        if (!this.authenticityContract) throw new Error('Authenticity contract not loaded');

        try {
            const dataString = JSON.stringify(productDetails, Object.keys(productDetails).sort());
            const dataHash = crypto.createHash('sha256').update(dataString).digest('hex');
            const dataHashPrefixed = '0x' + dataHash;

            const isValid = await this.authenticityContract.verifyProductHash(batchId, dataHashPrefixed);
            
            // Also fetch history
            const product = await this.authenticityContract.getProduct(batchId);
            
            // Format history
            const history = product[3].map(item => ({
                timestamp: Number(item.timestamp),
                handler: item.handler,
                status: item.status,
                dataHash: item.dataHash
            }));

            return {
                isValid: isValid,
                verified: isValid,
                registrant: product[2],
                onChainHash: product[1],
                history: history
            };

        } catch (error) {
            console.error('Error verifying product:', error);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new BlockchainService();
