import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { 
  LayoutDashboard, Image, Ticket, Info, MessageSquare, 
  HelpCircle, ShoppingCart, LogOut, Menu, X, Waves,
  Calendar, Users, ImageIcon
} from 'lucide-react';
import { useAuth } from '../../stores/authStore';
import { useState } from 'react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/hero-slides', label: 'Banner Principal', icon: ImageIcon },
    { path: '/admin/attractions', label: 'Atrações', icon: Image },
    { path: '/admin/tickets', label: 'Ingressos', icon: Ticket },
    { path: '/admin/availability', label: 'Disponibilidade', icon: Calendar },
    { path: '/admin/staff', label: 'Funcionários', icon: Users },
    { path: '/admin/park-info', label: 'Info do Parque', icon: Info },
    { path: '/admin/testimonials', label: 'Depoimentos', icon: MessageSquare },
    { path: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
    { path: '/admin/mercadopago', label: 'Mercado Pago', icon: ShoppingCart },
    { path: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
    { path: '/admin/contacts', label: 'Mensagens', icon: MessageSquare },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64" style={{ backgroundColor: '#2389a3' }}>
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-white/10">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Acqua Park Admin" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white text-sm truncate">
                {user?.email}
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-white border-white/20 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 w-64 shadow-xl"
            style={{ backgroundColor: '#2389a3' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Waves className="h-6 w-6 text-white" />
                <span className="text-white font-bold">Admin Panel</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="px-4 py-6 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full text-white border-white/20 hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center h-16 px-6 bg-white border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Admin'}
          </h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}