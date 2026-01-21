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
      <div className=\"min-h-screen bg-gray-50 py-12\">
        <div className=\"container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl\">
          {/* Header */}
          <div className=\"mb-8\">
            <div className=\"flex items-center justify-between flex-wrap gap-4\">
              <div>
                <h1 className=\"text-3xl font-bold\" style={{ color: '#2389a3' }}>Minha Conta</h1>
                <p className=\"text-gray-600 mt-1\">Bem-vindo, {customer?.name}!</p>
              </div>
              <Button onClick={handleLogout} variant=\"outline\">\n                <LogOut className=\"h-4 w-4 mr-2\" />\n                Sair\n              </Button>
            </div>
          </div>

          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6 mb-8\">
            {/* User Info */}
            <Card className=\"md:col-span-1\">\n              <CardHeader>\n                <CardTitle className=\"flex items-center space-x-2\">\n                  <User className=\"h-5 w-5\" style={{ color: '#2389a3' }} />\n                  <span>Minhas Informa\u00e7\u00f5es</span>\n                </CardTitle>\n              </CardHeader>\n              <CardContent className=\"space-y-3\">\n                <div>\n                  <p className=\"text-sm text-gray-500\">Nome</p>\n                  <p className=\"font-semibold\">{customer?.name}</p>\n                </div>\n                <div>\n                  <p className=\"text-sm text-gray-500\">Email</p>\n                  <p className=\"font-semibold\">{customer?.email}</p>\n                </div>\n                <div>\n                  <p className=\"text-sm text-gray-500\">Telefone</p>\n                  <p className=\"font-semibold\">{customer?.phone}</p>\n                </div>\n                <div>\n                  <p className=\"text-sm text-gray-500\">CPF</p>\n                  <p className=\"font-semibold\">{customer?.document}</p>\n                </div>\n              </CardContent>\n            </Card>

            {/* Stats */}
            <Card className=\"md:col-span-2\">\n              <CardHeader>\n                <CardTitle>Resumo</CardTitle>\n              </CardHeader>\n              <CardContent>\n                <div className=\"grid grid-cols-2 gap-4\">\n                  <div className=\"p-4 bg-gray-50 rounded-lg\">\n                    <p className=\"text-sm text-gray-600 mb-1\">Total de Pedidos</p>\n                    <p className=\"text-2xl font-bold\" style={{ color: '#2389a3' }}>{orders.length}</p>\n                  </div>\n                  <div className=\"p-4 bg-gray-50 rounded-lg\">\n                    <p className=\"text-sm text-gray-600 mb-1\">Pedidos Aprovados</p>\n                    <p className=\"text-2xl font-bold text-green-600\">\n                      {orders.filter(o => o.payment_status === 'approved').length}\n                    </p>\n                  </div>\n                </div>\n              </CardContent>\n            </Card>\n          </div>

          {/* Orders */}
          <Card>\n            <CardHeader>\n              <CardTitle className=\"flex items-center space-x-2\">\n                <Ticket className=\"h-5 w-5\" style={{ color: '#2389a3' }} />\n                <span>Meus Ingressos</span>\n              </CardTitle>\n            </CardHeader>\n            <CardContent>\n              {loading ? (\n                <div className=\"text-center py-8\">Carregando...</div>\n              ) : orders.length === 0 ? (\n                <div className=\"text-center py-12\">\n                  <Ticket className=\"h-12 w-12 mx-auto mb-4 text-gray-400\" />\n                  <p className=\"text-gray-500 mb-4\">Voc\u00ea ainda n\u00e3o comprou nenhum ingresso</p>\n                  <Link to=\"/ingressos\">\n                    <Button style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }} className=\"text-white\">\n                      Comprar Ingressos\n                    </Button>\n                  </Link>\n                </div>\n              ) : (\n                <div className=\"space-y-4\">\n                  {orders.map((order) => (\n                    <div key={order._id} className=\"border rounded-lg p-6 hover:shadow-md transition-shadow\">\n                      <div className=\"flex items-start justify-between flex-wrap gap-4\">\n                        <div className=\"flex-1\">\n                          <div className=\"flex items-center space-x-3 mb-3\">\n                            <p className=\"font-bold text-lg\" style={{ color: '#2389a3' }}>\n                              Pedido #{order.order_id}\n                            </p>\n                            {getStatusBadge(order.payment_status)}\n                          </div>\n                          \n                          <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm\">\n                            <div className=\"flex items-center space-x-2\">\n                              <Calendar className=\"h-4 w-4 text-gray-400\" />\n                              <div>\n                                <p className=\"text-gray-500\">Data da Visita</p>\n                                <p className=\"font-semibold\">{new Date(order.visit_date).toLocaleDateString('pt-BR')}</p>\n                              </div>\n                            </div>\n                            <div className=\"flex items-center space-x-2\">\n                              <CreditCard className=\"h-4 w-4 text-gray-400\" />\n                              <div>\n                                <p className=\"text-gray-500\">Valor Total</p>\n                                <p className=\"font-semibold\">R$ {order.total_amount.toFixed(2)}</p>\n                              </div>\n                            </div>\n                          </div>\n\n                          <div className=\"mt-4 pt-4 border-t\">\n                            <p className=\"text-sm font-semibold mb-2\">Ingressos:</p>\n                            <ul className=\"space-y-1\">\n                              {order.items.map((item, idx) => (\n                                <li key={idx} className=\"text-sm text-gray-600\">\n                                  {item.quantity}x {item.ticketId === 'adult' ? 'Inteiro' : item.ticketId === 'child' ? 'Meia-Entrada' : 'Pacote Fam\u00edlia'} - R$ {(item.unitPrice * item.quantity).toFixed(2)}\n                                </li>\n                              ))}\n                            </ul>\n                          </div>\n                        </div>\n\n                        {order.payment_status === 'approved' && (\n                          <div className=\"text-right\">\n                            <Button variant=\"outline\" size=\"sm\">\n                              <Download className=\"h-4 w-4 mr-2\" />\n                              Baixar Ingresso\n                            </Button>\n                          </div>\n                        )}\n                      </div>\n\n                      <div className=\"mt-4 text-xs text-gray-500\">\n                        Pedido realizado em: {new Date(order.created_at).toLocaleDateString('pt-BR')} \u00e0s {new Date(order.created_at).toLocaleTimeString('pt-BR')}\n                      </div>\n                    </div>\n                  ))}\n                </div>\n              )}\n            </CardContent>\n          </Card>\n        </div>\n      </div>\n      <Footer />
    </>
  );
}
