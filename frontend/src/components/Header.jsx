import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Waves, User } from 'lucide-react';
import { Button } from './ui/button';
import { useCustomerAuth } from '../stores/customerAuthStore';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { customer } = useCustomerAuth();

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Atrações', href: '/atracoes' },
    { name: 'Ingressos', href: '/ingressos' },
    { name: 'Contato', href: '/contato' }
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
              <Waves className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold" style={{ color: '#2389a3' }}>Acqua Park</span>
              <span className="text-xs text-gray-500">Prazeres da Serra</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive(item.href) ? { backgroundColor: '#2389a3' } : {}}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA & User */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {customer ? (
              <Link to="/minha-conta">
                <Button 
                  variant="outline"
                  className="font-semibold"
                  style={{ borderColor: '#2389a3', color: '#2389a3' }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Minha Conta
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button 
                  variant="outline"
                  className="font-semibold"
                  style={{ borderColor: '#2389a3', color: '#2389a3' }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            )}
            
            <Link to="/ingressos">
              <Button 
                className="text-white font-semibold shadow-md hover:shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
              >
                Comprar Ingressos
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Abrir menu</span>
            {isMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-md text-base font-medium transition-all ${
                    isActive(item.href)
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={isActive(item.href) ? { backgroundColor: '#2389a3' } : {}}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="px-4 pt-2 space-y-2">
                {customer ? (
                  <Link to="/minha-conta" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant="outline"
                      className="w-full font-semibold"
                      style={{ borderColor: '#2389a3', color: '#2389a3' }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Minha Conta
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant="outline"
                      className="w-full font-semibold"
                      style={{ borderColor: '#2389a3', color: '#2389a3' }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Entrar
                    </Button>
                  </Link>
                )}
                
                <Link to="/ingressos" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    className="w-full text-white font-semibold shadow-md"
                    style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
                  >
                    Comprar Ingressos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}