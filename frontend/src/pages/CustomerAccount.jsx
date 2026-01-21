import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, LogOut, Ticket, Calendar, CreditCard, Download } from 'lucide-react';
import { useCustomerAuth } from '../stores/customerAuthStore';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CustomerAccount() {
  const navigate = useNavigate();
  const { customer, logout, getAuthHeaders, checkAuth } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        navigate('/login');
        return;
      }
      fetchOrders();
    };
    verify();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/customers/my-orders`, {
        headers: getAuthHeaders()
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'approved': { label: 'Aprovado', color: 'bg-green-100 text-green-700' },
      'pending': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
      'rejected': { label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
      'cancelled': { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
      'refunded': { label: 'Reembolsado', color: 'bg-blue-100 text-blue-700' }
    };
    const info = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={info.color}>{info.label}</Badge>;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#2389a3' }}>Minha Conta</h1>
                <p className="text-gray-600 mt-1">Bem-vindo, {customer?.name}!</p>
              </div>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" style={{ color: '#2389a3' }} />
                  <span>Minhas Informações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-semibold">{customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{customer?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-semibold">{customer?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CPF</p>
                  <p className="font-semibold">{customer?.document}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total de Pedidos</p>
                    <p className="text-2xl font-bold" style={{ color: '#2389a3' }}>{orders.length}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Pedidos Aprovados</p>
                    <p className="text-2xl font-bold text-green-600">
                      {orders.filter(o => o.payment_status === 'approved').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ticket className="h-5 w-5" style={{ color: '#2389a3' }} />
                <span>Meus Ingressos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-4">Você ainda não comprou nenhum ingresso</p>
                  <Link to="/ingressos">
                    <Button style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }} className="text-white">
                      Comprar Ingressos
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <p className="font-bold text-lg" style={{ color: '#2389a3' }}>
                              Pedido #{order.order_id}
                            </p>
                            {getStatusBadge(order.payment_status)}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-gray-500">Data da Visita</p>
                                <p className="font-semibold">{new Date(order.visit_date).toLocaleDateString('pt-BR')}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-gray-500">Valor Total</p>
                                <p className="font-semibold">R$ {order.total_amount.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-semibold mb-2">Ingressos:</p>
                            <ul className="space-y-1">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-600">
                                  {item.quantity}x {item.ticketId === 'adult' ? 'Inteiro' : item.ticketId === 'child' ? 'Meia-Entrada' : 'Pacote Família'} - R$ {(item.unitPrice * item.quantity).toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {order.payment_status === 'approved' && (
                          <div className="text-right">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Baixar Ingresso
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 text-xs text-gray-500">
                        Pedido realizado em: {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
