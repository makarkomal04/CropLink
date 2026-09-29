import { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { formatAddress, copyToClipboard, getAddressUrl } from '../services/blockchainService';
import { Wallet, Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const WalletInfo = () => {
    const { wallet, hasWallet } = useBlockchain();
    const [copied, setCopied] = useState(false);

    const handleCopyAddress = async () => {
        if (!wallet?.walletAddress) return;

        const success = await copyToClipboard(wallet.walletAddress);
        if (success) {
            setCopied(true);
            toast.success('Address copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.error('Failed to copy address');
        }
    };

    if (!hasWallet) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">Your Digital Identity</h3>
                </div>
            </div>

            {/* Wallet Address */}
            <div>
                <p className="text-sm text-white/80 mb-1">Blockchain Address</p>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                    <code className="flex-1 text-sm font-mono">
                        {formatAddress(wallet?.walletAddress)}
                    </code>
                    <button
                        onClick={handleCopyAddress}
                        className="p-2 hover:bg-white/20 rounded transition-colors"
                        title="Copy address"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                        href={getAddressUrl(wallet?.walletAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/20 rounded transition-colors"
                        title="View on Polygonscan"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
                <p className="text-xs text-white/60 mt-2">
                    This address is used to verify product authenticity and track supply chain updates.
                </p>
            </div>
        </div>
    );
};

export default WalletInfo;
