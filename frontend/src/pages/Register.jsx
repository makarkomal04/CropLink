import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Sprout } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        farmLocation: '',
        address: ''
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await register(formData);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'farmer') navigate('/farmer');
            else navigate('/shop');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-farmer-yellow/20 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-farmer-green">
                <div className="flex justify-center mb-6">
                    <div className="bg-farmer-green/10 p-3 rounded-full">
                        <Sprout className="w-10 h-10 text-farmer-green" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-farmer-brown mb-6">Create Account</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmer-green focus:border-transparent outline-none transition"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmer-green focus:border-transparent outline-none transition"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmer-green focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">I am a...</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmer-green focus:border-transparent outline-none transition bg-white"
                        >
                            <option value="customer">Customer (Buyer)</option>
                            <option value="farmer">Farmer (Seller)</option>
                        </select>
                    </div>

                    {formData.role === 'farmer' && (
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Farm Location</label>
                            <input
                                type="text"
                                name="farmLocation"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmer-green focus:border-transparent outline-none transition"
                                placeholder="Village/City Name"
                                value={formData.farmLocation}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Shipping/Delivery Address</label>
                        <input
                            type="text"
                            name="address"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmer-green focus:border-transparent outline-none transition"
                            placeholder="Full Address (e.g., Street, City, ZIP)"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    <button
                        type="submit"
                        className="w-full bg-farmer-green text-white py-2 rounded-lg font-medium hover:bg-green-800 transition shadow-md hover:shadow-lg"
                    >
                        Register
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-farmer-green font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
