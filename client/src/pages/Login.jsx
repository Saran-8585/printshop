import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Layers className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold text-primary">PrintShop</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-accent text-white py-2.5 rounded-lg font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="text-accent font-medium hover:underline">Register</Link>
          </div>
        </form>

        {/* Seed credentials */}
        <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Demo Accounts</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => { setEmail('admin@printshop.com'); setPassword('admin123'); }}
              className="w-full flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-left"
            >
              <div>
                <span className="font-medium text-gray-700">Admin</span>
                <span className="text-gray-500 ml-2">admin@printshop.com</span>
              </div>
              <span className="text-gray-400 font-mono text-xs">admin123</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('customer1@printshop.com'); setPassword('cust123'); }}
              className="w-full flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-left"
            >
              <div>
                <span className="font-medium text-gray-700">Customer</span>
                <span className="text-gray-500 ml-2">customer1@printshop.com</span>
              </div>
              <span className="text-gray-400 font-mono text-xs">cust123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
