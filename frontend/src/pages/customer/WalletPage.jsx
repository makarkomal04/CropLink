import { useState, useEffect, useContext } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';
import AuthContext from '../../context/AuthContext';
import WalletInfo from '../../components/WalletInfo';
import { Wallet, AlertCircle, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { apiBaseUrl } from '../../services/api';

const WalletPage = () => {
    const {
        wallet,
        hasWallet,
        loading,
        createWallet
    } = useBlockchain();
    const { user } = useContext(AuthContext);

    const [showMnemonic, setShowMnemonic] = useState(false);
    const [mnemonic, setMnemonic] = useState('');
    const [mnemonicSaved, setMnemonicSaved] = useState(false);
    const [showQR, setShowQR] = useState(false);

    // Create wallet info URL for QR code - Use apiBaseUrl or current origin
    const baseUrl = apiBaseUrl || window.location.origin;
    const walletInfoUrl = user?._id ? `${baseUrl}/api/qr/wallet-info/${user._id}` : '';

    useEffect(() => {
        // Just used to re-render if wallet changes
    }, [hasWallet]);

    const handleCreateWallet = async () => {
        try {
            const result = await createWallet();
            setMnemonic(result.mnemonic);
            setShowMnemonic(true);
        } catch (error) {
            // Error already handled in context
        }
    };

    const handleDownloadMnemonic = () => {
        const element = document.createElement('a');
        const file = new Blob([mnemonic], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'croplink-wallet-recovery.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('Recovery phrase downloaded');
    };

    const handleConfirmSaved = () => {
        setMnemonicSaved(true);
        setShowMnemonic(false);
        toast.success('Wallet setup complete!');
    };

    // Mnemonic Modal
    if (showMnemonic && mnemonic) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Save Your Recovery Phrase
                        </h2>
                        <p className="text-gray-600">
                            This is the ONLY time you'll see this. Write it down and store it safely.
                        </p>
                    </div>

                    <div className="bg-gray-100 rounded-lg p-6 mb-6">
                        <div className="grid grid-cols-3 gap-3">
                            {mnemonic.split(' ').map((word, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded px-3 py-2 text-center"
                                >
                                    <span className="text-xs text-gray-500">{index + 1}.</span>{' '}
                                    <span className="font-medium">{word}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important:</h3>
                        <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Write this recovery phrase on paper</li>
                            <li>• Store it in a safe place</li>
                            <li>• Never share it with anyone</li>
                            <li>• Without it, you cannot recover your wallet</li>
                        </ul>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadMnemonic}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Download
                        </button>
                        <button
                            onClick={handleConfirmSaved}
                            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            I've Saved It Securely
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Create Wallet View
    if (!hasWallet && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Wallet className="w-10 h-10 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Create Your Digital Identity
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Create a secure blockchain identity to verify product authenticity and track your supply chain transparently.
                    </p>
                    <button
                        onClick={handleCreateWallet}
                        disabled={loading}
                        className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Wallet'}
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                        Your keys, your crypto. We never store your private keys.
                    </p>
                </div>
            </div>
        );
    }

    // Main Wallet View
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Blockchain Identity</h1>

                {/* Wallet Info Card */}
                <div className="mb-8">
                    <WalletInfo />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setShowQR(!showQR)}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <QrCode className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Show QR Code</h3>
                                <p className="text-sm text-gray-600">For product verification</p>
                            </div>
                        </div>
                    </button>

                    <div className="bg-white rounded-lg shadow p-6 text-left">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Authenticity Only</h3>
                                <p className="text-sm text-gray-600">This identity is used to sign and verify product updates.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR Code Modal */}
                {showQR && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center">
                        <h3 className="text-lg font-semibold mb-4">Blockchain Identity QR Code</h3>
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                <QRCodeSVG
                                    value={walletInfoUrl || wallet?.walletAddress || ''}
                                    size={200}
                                    level="H"
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-4 text-center max-w-sm">
                                Scan to view your blockchain identity, wallet address, and product authenticity verification
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default WalletPage;
