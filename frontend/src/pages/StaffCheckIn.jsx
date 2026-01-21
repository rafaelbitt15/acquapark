import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { QrCode, CheckCircle2, XCircle, LogOut, Search, User, Calendar, Ticket, AlertTriangle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StaffCheckIn() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [staffInfo, setStaffInfo] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [ticketCode, setTicketCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('staffToken');
    if (token) {
      try {
        const response = await axios.get(`${API}/staff/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStaffInfo(response.data);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('staffToken');
      }
    }
    setCheckingAuth(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/staff/login`, loginData);
      localStorage.setItem('staffToken', response.data.access_token);
      setStaffInfo(response.data.staff);
      setIsLoggedIn(true);
      toast({ title: 'Bem-vindo!', description: `Olá, ${response.data.staff.name}` });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error.response?.data?.detail || 'Credenciais inválidas', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    setIsLoggedIn(false);
    setStaffInfo(null);
    setValidationResult(null);
    setTicketCode('');
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    
    setLoading(true);
    setValidationResult(null);
    
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.post(
        `${API}/staff/validate-ticket`,
        { ticket_code: ticketCode.trim().toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setValidationResult(response.data);
      
      if (response.data.valid) {
        toast({ title: 'Sucesso!', description: 'Ingresso validado com sucesso!' });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setValidationResult({ valid: false, message: 'Ingresso não encontrado' });
      } else {
        toast({ 
          title: 'Erro', 
          description: error.response?.data?.detail || 'Erro ao validar ingresso', 
          variant: 'destructive' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTicket = async () => {
    if (!ticketCode.trim()) return;
    
    setLoading(true);
    setValidationResult(null);
    
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get(
        `${API}/staff/ticket-info/${ticketCode.trim().toUpperCase()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setValidationResult({ 
        ...response.data, 
        infoOnly: true,
        valid: !response.data.validated && response.data.payment_status === 'approved'
      });
    } catch (error) {
      if (error.response?.status === 404) {
        setValidationResult({ valid: false, message: 'Ingresso não encontrado', infoOnly: true });
      } else {
        toast({ title: 'Erro', description: 'Erro ao buscar ingresso', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setValidationResult(null);
    setTicketCode('');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center mb-4">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl" style={{ color: '#2389a3' }}>
              Check-In de Ingressos
            </CardTitle>
            <p className="text-gray-600">Acesso para funcionários</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div>
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full text-white"
                style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  // Check-In Screen
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
              {staffInfo?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#2389a3' }}>{staffInfo?.name}</p>
              <p className="text-xs text-gray-500">Funcionário</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-gray-600">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Validation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#2389a3' }}>
              <QrCode className="h-5 w-5" />
              Validar Ingresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <Label>Código do Ingresso</Label>
                <div className="flex gap-2">
                  <Input
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                    placeholder="Ex: TKT-A1B2C3D4E5F6"
                    className="font-mono text-lg"
                    data-testid="ticket-code-input"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleSearchTicket}
                    disabled={loading || !ticketCode.trim()}
                    data-testid="search-ticket-btn"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full text-white text-lg py-6"
                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                disabled={loading || !ticketCode.trim()}
                data-testid="validate-ticket-btn"
              >
                {loading ? 'Validando...' : 'Validar e Liberar Entrada'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Validation Result */}
        {validationResult && (
          <Card className={`border-2 ${validationResult.valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                {validationResult.valid ? (
                  <CheckCircle2 className="h-12 w-12 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${validationResult.valid ? 'text-green-700' : 'text-red-700'}`}>
                    {validationResult.valid 
                      ? (validationResult.infoOnly ? 'Ingresso Válido' : 'Entrada Liberada!') 
                      : 'Entrada Negada'}
                  </h3>
                  <p className={`${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                    {validationResult.message}
                  </p>

                  {/* Order Details */}
                  {(validationResult.order || validationResult.order_id) && (
                    <div className="mt-4 space-y-2 text-gray-700">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {validationResult.order?.customer_name || validationResult.customer_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Data: {validationResult.order?.visit_date || validationResult.visit_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        <span>Pedido: {validationResult.order?.order_id || validationResult.order_id}</span>
                      </div>
                      {(validationResult.order?.items || validationResult.items) && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <p className="text-sm font-medium mb-1">Itens:</p>
                          {(validationResult.order?.items || validationResult.items).map((item, idx) => (
                            <p key={idx} className="text-sm">
                              {item.quantity}x {item.ticketName || item.name || `Ingresso`}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Already Validated Warning */}
                  {validationResult.validated && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Já validado anteriormente</p>
                        <p className="text-xs text-yellow-700">
                          Por: {validationResult.validated_by_name} em {new Date(validationResult.validated_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={clearResult}
                  >
                    Limpar e Validar Outro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Toaster />
    </div>
  );
}
