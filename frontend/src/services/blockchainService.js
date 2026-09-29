import axios from 'axios';
import { apiBaseUrl } from './api';

const API_URL = `${apiBaseUrl}/api/blockchain`;

// Get auth token from localStorage
const getAuthHeader = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const token = JSON.parse(user).token;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
    return {};
};

/**
 * Create wallet for current user
 */
export const createWallet = async () => {
    try {
        const response = await axios.post(
            `${API_URL}/wallet/create`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to create wallet';
    }
};

/**
 * Get wallet information
 * @param {string} userId - User ID or 'me' for current user
 */
export const getWalletInfo = async (userId = 'me') => {
    try {
        const response = await axios.get(
            `${API_URL}/wallet/${userId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to get wallet info';
    }
};

/**
 * Get wallet balance
 * @param {string} userId - User ID or 'me' for current user
 */
export const getWalletBalance = async (userId = 'me') => {
    try {
        const response = await axios.get(
            `${API_URL}/wallet/${userId}/balance`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to get balance';
    }
};

/**
 * Get transaction history
 * @param {string} userId - User ID or 'me' for current user
 * @param {number} limit - Number of transactions to fetch
 */
export const getTransactionHistory = async (userId = 'me', limit = 10) => {
    try {
        const response = await axios.get(
            `${API_URL}/transactions/${userId}?limit=${limit}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to get transaction history';
    }
};

/**
 * Get blockchain order details
 * @param {string} orderId - Blockchain order ID
 */
export const getBlockchainOrder = async (orderId) => {
    try {
        const response = await axios.get(
            `${API_URL}/orders/${orderId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to get blockchain order';
    }
};

/**
 * Format wallet address for display (shorten middle)
 * @param {string} address - Full wallet address
 * @returns {string} Shortened address
 */
export const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
};

/**
 * Get Polygonscan URL for transaction
 * @param {string} txHash - Transaction hash
 * @param {boolean} isTestnet - Whether using testnet
 * @returns {string} Polygonscan URL
 */
export const getPolygonscanUrl = (txHash, isTestnet = true) => {
    const baseUrl = isTestnet
        ? 'https://mumbai.polygonscan.com'
        : 'https://polygonscan.com';
    return `${baseUrl}/tx/${txHash}`;
};

/**
 * Send MATIC payment
 * @param {string} toAddress - Recipient address
 * @param {string} amount - Amount in MATIC
 */
export const sendPayment = async (toAddress, amount) => {
    try {
        const response = await axios.post(
            `${API_URL}/send`,
            { toAddress, amount },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to send payment';
    }
};

/**
 * Verify product authenticity
 * @param {string} batchId - Product ID / Batch ID
 * @param {Object} productDetails - Product details to verify
 */
export const verifyProduct = async (batchId, productDetails) => {
    try {
        const response = await axios.post(
            `${API_URL}/verify-product`,
            { batchId, productDetails },
            { headers: getAuthHeader() } // Optional depending on if we require auth for public verify? Route is public.
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to verify product';
    }
};

/**
 * Get Polygonscan URL for address
 * @param {string} address - Wallet address
 * @param {boolean} isTestnet - Whether using testnet
 * @returns {string} Polygonscan URL
 */
export const getAddressUrl = (address, isTestnet = true) => {
    const baseUrl = isTestnet
        ? 'https://mumbai.polygonscan.com'
        : 'https://polygonscan.com';
    return `${baseUrl}/address/${address}`;
};
