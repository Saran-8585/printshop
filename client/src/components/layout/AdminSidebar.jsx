import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, TicketPercent, Layers, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/coupons', icon: TicketPercent, label: 'Coupons' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-primary text-white min-h-screen flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <NavLink to="/admin" className="flex items-center gap-2 font-bold text-lg">
          <Layers className="w-6 h-6 text-accent" />
          PrintShop Admin
        </NavLink>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="text-sm text-gray-400 mb-2">{user?.name}</div>
        <NavLink to="/" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-2">
          <Layers className="w-4 h-4" /> View Store
        </NavLink>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 w-full"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}
