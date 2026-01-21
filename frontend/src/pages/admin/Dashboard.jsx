import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Image, Ticket, ShoppingCart, MessageSquare, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard-stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  const statCards = [
    {
      title: 'Atrações',
      value: stats?.total_attractions || 0,
      icon: Image,
      color: '#46bfec'
    },
    {
      title: 'Tipos de Ingressos',
      value: stats?.total_tickets || 0,
      icon: Ticket,
      color: '#f2ad28'
    },
    {
      title: 'Pedidos',
      value: stats?.total_orders || 0,
      icon: ShoppingCart,
      color: '#2389a3'
    },
    {
      title: 'Mensagens',
      value: stats?.total_contacts || 0,
      icon: MessageSquare,
      color: '#46bfec',
      badge: stats?.new_contacts > 0 ? stats.new_contacts : null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-3xl font-bold" style={{ color: '#2389a3' }}>Bem-vindo ao Painel Admin!</h2>
        <p className="text-gray-600 mt-1">Gerencie todo o conteúdo do site Acqua Park</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </p>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                </div>
                {stat.badge && (
                  <div className="mt-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-semibold">
                      {stat.badge} novas
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" style={{ color: '#2389a3' }} />
            <span>Pedidos Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_orders && stats.recent_orders.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{order.customer.name}</p>
                    <p className="text-sm text-gray-600">{order.customer.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: '#2389a3' }}>
                      R$ {order.total_amount.toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.payment_status === 'approved' ? 'bg-green-100 text-green-600' :
                      order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum pedido ainda</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/attractions'}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#46bfec20' }}>
                <Image className="h-6 w-6" style={{ color: '#46bfec' }} />
              </div>
              <div>
                <p className="font-semibold">Gerenciar Atrações</p>
                <p className="text-sm text-gray-600">Adicionar, editar ou remover</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/tickets'}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f2ad2820' }}>
                <Ticket className="h-6 w-6" style={{ color: '#f2ad28' }} />
              </div>
              <div>
                <p className="font-semibold">Gerenciar Ingressos</p>
                <p className="text-sm text-gray-600">Atualizar preços e info</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/contacts'}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2389a320' }}>
                <MessageSquare className="h-6 w-6" style={{ color: '#2389a3' }} />
              </div>
              <div>
                <p className="font-semibold">Ver Mensagens</p>
                <p className="text-sm text-gray-600">Responder contatos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}