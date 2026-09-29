import { createContext, useContext, useState, useEffect } from 'react';
import {
    createWallet,
    getWalletInfo,
    verifyProduct
} from '../services/blockchainService';
import toast from 'react-hot-toast';

const BlockchainContext = createContext();

export const useBlockchain = () => {
    const context = useContext(BlockchainContext);
    if (!context) {
        throw new Error('useBlockchain must be used within BlockchainProvider');
    }
    return context;
};

export const BlockchainProvider = ({ children }) => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load wallet info on mount
    useEffect(() => {
        loadWalletInfo();
    }, []);

    /**
     * Load wallet information
     */
    const loadWalletInfo = async () => {
        try {
            const walletData = await getWalletInfo();
            setWallet(walletData);
        } catch (error) {
            // Wallet doesn't exist yet, that's okay
            console.log('No wallet found');
        }
    };

    /**
     * Create a new wallet
     */
    const handleCreateWallet = async () => {
        setLoading(true);
        try {
            const result = await createWallet();

            // Show mnemonic to user (IMPORTANT - only shown once)
            toast.success('Wallet created successfully!');

            // Return mnemonic for user to save
            await loadWalletInfo();

            return result;
        } catch (error) {
            toast.error(error || 'Failed to create wallet');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyProduct = async (batchId, details) => {
        if (!details) return { verified: false, message: 'No details provided' };

        // Need to recreate the detail object structure as expected by backend hashing
        const cleanDetails = {
            productId: batchId,
            name: details.name,
            category: details.category,
            quantity: details.quantity,
            farmerId: details.farmer?._id || details.farmer,
            harvestDate: details.harvestDate ? new Date(details.harvestDate).toISOString() : '',
            batchNumber: details.batchNumber || ''
        };
        return await verifyProduct(batchId, cleanDetails);
    };

    const value = {
        wallet,
        loading,
        hasWallet: !!wallet,
        createWallet: handleCreateWallet,
        reloadWallet: loadWalletInfo,
        verifyProduct: handleVerifyProduct
    };

    return (
        <BlockchainContext.Provider value={value}>
            {children}
        </BlockchainContext.Provider>
    );
};

export default BlockchainContext;
