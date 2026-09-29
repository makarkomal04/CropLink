import { useState } from 'react';
import { CreditCard, Wallet, DollarSign, Building, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentGateway = ({ totalAmount, onPaymentComplete, hasWallet }) => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    const paymentMethods = [
        {
            id: 'cod',
            name: 'Cash on Delivery',
            icon: DollarSign,
            description: 'Pay when you receive the order',
            color: 'green'
        },
        {
            id: 'card',
            name: 'Credit/Debit Card',
            icon: CreditCard,
            description: 'Visa, Mastercard, RuPay',
            color: 'blue'
        },
        {
            id: 'upi',
            name: 'UPI Payment',
            icon: Wallet,
            description: 'PhonePe, GPay, Paytm',
            color: 'purple'
        },
        {
            id: 'netbanking',
            name: 'Net Banking',
            icon: Building,
            description: 'All major banks supported',
            color: 'orange'
        }
    ];

    const handleMethodSelect = (methodId) => {
        setSelectedMethod(methodId);
        setShowCardForm(methodId === 'card');
    };

    const handleCardInput = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
        } else if (name === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '').replace(/(.{2})/, '$1/').substr(0, 5);
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').substr(0, 3);
        }

        setCardDetails({ ...cardDetails, [name]: formattedValue });
    };

    const processPayment = async () => {
        if (!selectedMethod) {
            toast.error('Please select a payment method');
            return;
        }

        if (selectedMethod === 'card') {
            if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
                toast.error('Please fill all card details');
                return;
            }
        }

        setProcessing(true);



        // Simulate other payment processing
        setTimeout(() => {
            setProcessing(false);
            onPaymentComplete(selectedMethod);
        }, 2000);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Payment Method</h2>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    const isCryptoAndNoWallet = method.id === 'crypto' && !hasWallet;

                    return (
                        <div
                            key={method.id}
                            onClick={() => handleMethodSelect(method.id)}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${isSelected
                                ? `border-${method.color}-500 bg-${method.color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                                } ${isCryptoAndNoWallet ? 'opacity-60 bg-gray-50' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${isSelected ? `bg-${method.color}-500` : 'bg-gray-100'}`}>
                                    <Icon size={24} className={`${isSelected ? 'text-white' : 'text-gray-600'} ${isCryptoAndNoWallet ? 'text-gray-400' : ''}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-semibold ${isCryptoAndNoWallet ? 'text-gray-500' : 'text-gray-800'}`}>{method.name}</h3>
                                    <p className="text-sm text-gray-500">{method.description}</p>
                                    {isCryptoAndNoWallet && (
                                        <p className="text-xs text-red-500 mt-1 font-medium">Create wallet first</p>
                                    )}
                                </div>
                                {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Card Details Form */}
            {showCardForm && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
                    <h3 className="font-semibold text-gray-800 mb-4">Enter Card Details</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <input
                            type="text"
                            name="cardNumber"
                            value={cardDetails.cardNumber}
                            onChange={handleCardInput}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                        <input
                            type="text"
                            name="cardName"
                            value={cardDetails.cardName}
                            onChange={handleCardInput}
                            placeholder="John Doe"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                            <input
                                type="text"
                                name="expiryDate"
                                value={cardDetails.expiryDate}
                                onChange={handleCardInput}
                                placeholder="MM/YY"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                            <input
                                type="password"
                                name="cvv"
                                value={cardDetails.cvv}
                                onChange={handleCardInput}
                                placeholder="123"
                                maxLength="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-2xl font-bold text-farmer-green">₹{totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* Process Payment Button */}
            <button
                onClick={processPayment}
                disabled={!selectedMethod || processing}
                className="w-full bg-farmer-green text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader className="animate-spin h-5 w-5" />
                        Processing...
                    </span>
                ) : (
                    selectedMethod === 'crypto' ? (
                        <div className="flex flex-col items-center leading-tight">
                            <span>Pay ₹{totalAmount.toFixed(2)}</span>
                            <span className="text-sm font-normal opacity-90">
                                (≈ {(totalAmount / 80).toFixed(4)} MATIC)
                            </span>
                        </div>
                    ) : (
                        `Pay ₹${totalAmount.toFixed(2)}`
                    )
                )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
                🔒 This is a demo payment gateway. No real transactions will be processed.
            </p>
        </div>
    );
};

export default PaymentGateway;
