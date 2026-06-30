import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match — ensure both fields are identical');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;
  const passwordsDontMatch = form.confirmPassword && form.password !== form.confirmPassword;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Layers className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold text-primary">PrintShop</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">Create an account</h1>
          <p className="text-gray-500 mt-1">Join PrintShop today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={form.name} onChange={update('name')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={update('email')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={update('phone')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none" placeholder="9876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={update('password')}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required minLength={6}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none ${
                  passwordsDontMatch ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordsDontMatch && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
            {passwordsMatch && (
              <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
            )}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-accent text-white py-2.5 rounded-lg font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <div className="text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
          </div>
        </form>

        {/* Demo accounts */}
        <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Demo Accounts</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, email: 'admin@printshop.com', password: 'admin123', confirmPassword: 'admin123' }))}
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
              onClick={() => setForm(prev => ({ ...prev, email: 'customer1@printshop.com', password: 'cust123', confirmPassword: 'cust123' }))}
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
