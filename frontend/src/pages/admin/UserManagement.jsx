import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { Users, CheckCircle, XCircle, Shield } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, farmer, customer

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
            setLoading(false);
        }
    };

    const handleVerify = async (userId) => {
        if (window.confirm('Approve this farmer?')) {
            try {
                await adminService.verifyFarmer(userId);
                toast.success('Farmer verified successfully!');
                fetchUsers();
            } catch (error) {
                toast.error('Error verifying farmer');
            }
        }
    };

    const handleDeactivate = async (userId) => {
        if (window.confirm('Are you sure you want to deactivate this user? This action cannot be undone.')) {
            try {
                await adminService.deactivateUser(userId);
                toast.success('User deactivated successfully');
                fetchUsers();
            } catch (error) {
                toast.error('Error deactivating user');
            }
        }
    };

    const filteredUsers = filter === 'all'
        ? users
        : users.filter(u => u.role === filter);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all' ? 'bg-farmer-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All ({users.length})
                    </button>
                    <button
                        onClick={() => setFilter('farmer')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'farmer' ? 'bg-farmer-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Farmers ({users.filter(u => u.role === 'farmer').length})
                    </button>
                    <button
                        onClick={() => setFilter('customer')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'customer' ? 'bg-farmer-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Customers ({users.filter(u => u.role === 'customer').length})
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading users...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                            {user.farmLocation && (
                                                <p className="text-xs text-gray-400 mt-1">📍 {user.farmLocation}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'farmer' ? 'bg-green-100 text-green-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === 'farmer' && (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {user.isVerified ? (
                                                    <><CheckCircle className="w-3 h-3 mr-1" /> Verified</>
                                                ) : (
                                                    <>⏳ Pending</>
                                                )}
                                            </span>
                                        )}
                                        {user.role !== 'farmer' && <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.walletCreated && user.walletAddress ? (
                                            <div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Wallet Created
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1 font-mono truncate max-w-[150px]" title={user.walletAddress}>
                                                    {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                <XCircle className="w-3 h-3 mr-1" /> No Wallet
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.role === 'farmer' && !user.isVerified && (
                                                <button
                                                    onClick={() => handleVerify(user._id)}
                                                    className="text-green-600 hover:text-green-800 font-medium text-sm"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDeactivate(user._id)}
                                                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
