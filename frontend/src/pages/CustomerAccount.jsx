import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { User, LogOut, Ticket, Calendar, CreditCard, QrCode, Copy, CheckCircle, Key, Eye, EyeOff } from 'lucide-react';
import { useCustomerAuth } from '../stores/customerAuthStore';
import { useToast } from '../hooks/use-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Toaster } from '../components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CustomerAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { customer, logout, getAuthHeaders, checkAuth } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({ title: 'Erro', description: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      toast({ title: 'Erro', description: 'A nova senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }
    
    setChangingPassword(true);
    
    try {
      await axios.post(`${API}/customers/change-password`, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      }, { headers: getAuthHeaders() });
      
      toast({ title: 'Sucesso!', description: 'Senha alterada com sucesso' });
      setPasswordDialogOpen(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error.response?.data?.detail || 'Erro ao alterar senha', 
        variant: 'destructive' 
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const openTicketQR = (order) => {
    setSelectedOrder(order);
    setQrDialogOpen(true);
    setCopied(false);
  };

  const copyTicketCode = async () => {
    if (selectedOrder?.ticket_code) {
      await navigator.clipboard.writeText(selectedOrder.ticket_code);
      setCopied(true);
      toast({ title: 'Copiado!', description: 'Código copiado para a área de transferência' });
      setTimeout(() => setCopied(false), 2000);
    }
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

  const getValidationBadge = (order) => {
    if (order.validated) {
      return <Badge className="bg-gray-200 text-gray-600">Utilizado</Badge>;
    }
    return null;
  };

  return (
    <>
      <Header />
      <Toaster />
      <div className="min-h-screen bg-gray-50 py-12" data-testid="customer-account-page">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#2389a3' }}>Minha Conta</h1>
                <p className="text-gray-600 mt-1">Bem-vindo, {customer?.name}!</p>
              </div>
              <Button onClick={handleLogout} variant="outline" data-testid="logout-btn">
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
                <div className="pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPasswordDialogOpen(true)}
                    className="w-full"
                    data-testid="change-password-btn"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </Button>
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
                    <div key={order._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow" data-testid={`order-card-${order.order_id}`}>
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3 flex-wrap gap-2">
                            <p className="font-bold text-lg" style={{ color: '#2389a3' }}>
                              Pedido #{order.order_id}
                            </p>
                            {getStatusBadge(order.payment_status)}
                            {getValidationBadge(order)}
                          </div>
                          
                          {/* Ticket Code Display */}
                          {order.ticket_code && order.payment_status === 'approved' && (
                            <div className="mb-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-cyan-600 font-medium">Código do Ingresso</p>
                                  <p className="font-mono font-bold text-lg" style={{ color: '#2389a3' }}>
                                    {order.ticket_code}
                                  </p>
                                </div>
                                {!order.validated && (
                                  <Button
                                    onClick={() => openTicketQR(order)}
                                    size="sm"
                                    className="text-white"
                                    style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                                    data-testid={`view-qr-${order.order_id}`}
                                  >
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Ver QR Code
                                  </Button>
                                )}
                              </div>
                              {order.validated && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Ingresso utilizado em {new Date(order.validated_at).toLocaleString('pt-BR')}
                                </p>
                              )}
                            </div>
                          )}
                          
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

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Seu Ingresso</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-dashed border-cyan-300 inline-block">
                <QRCodeSVG 
                  value={selectedOrder.ticket_code} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Código do Ingresso</p>
                <div className="flex items-center justify-center space-x-2">
                  <code className="font-mono text-lg font-bold px-3 py-1 bg-gray-100 rounded">
                    {selectedOrder.ticket_code}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyTicketCode}
                    data-testid="copy-ticket-code"
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Pedido:</strong> #{selectedOrder.order_id}</p>
                <p><strong>Data da Visita:</strong> {new Date(selectedOrder.visit_date).toLocaleDateString('pt-BR')}</p>
                <p><strong>Ingressos:</strong></p>
                <ul>
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx}>
                      {item.quantity}x {item.ticketId === 'adult' ? 'Inteiro' : item.ticketId === 'child' ? 'Meia-Entrada' : 'Pacote Família'}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Apresente este QR Code ou o código na entrada do parque
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={(open) => {
        setPasswordDialogOpen(open);
        if (!open) setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label>Senha Atual</Label>
              <div className="relative mt-1">
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  required
                  data-testid="current-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Nova Senha</Label>
              <div className="relative mt-1">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  data-testid="new-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirmar Nova Senha</Label>
              <div className="relative mt-1">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  required
                  data-testid="confirm-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex space-x-2 pt-2">
              <Button 
                type="submit" 
                className="flex-1 text-white"
                style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                disabled={changingPassword}
                data-testid="save-password-btn"
              >
                {changingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
