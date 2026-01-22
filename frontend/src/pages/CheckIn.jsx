import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  QrCode, Search, CheckCircle2, XCircle, LogOut, User, 
  Calendar, CreditCard, Ticket, AlertTriangle, Camera
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CheckIn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [staff, setStaff] = useState(null);
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scanMode, setScanMode] = useState(false);

  useEffect(() => {
    // Check if staff is logged in
    const token = localStorage.getItem('staff_token');
    const staffInfo = localStorage.getItem('staff_info');
    
    if (!token || !staffInfo) {
      navigate('/funcionario/login');
      return;
    }
    
    setStaff(JSON.parse(staffInfo));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_info');
    navigate('/funcionario/login');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('staff_token');
    return { Authorization: `Bearer ${token}` };
  };

  const searchTicket = async () => {
    if (!ticketCode.trim()) {
      toast({ title: 'Atenção', description: 'Digite o código do ingresso', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.get(`${API}/staff/ticket-info/${ticketCode.trim()}`, {
        headers: getAuthHeaders()
      });
      setResult({ type: 'info', data: response.data });
    } catch (error) {
      if (error.response?.status === 404) {
        setResult({ type: 'error', message: 'Ingresso não encontrado' });
      } else if (error.response?.status === 401) {
        toast({ title: 'Sessão expirada', description: 'Faça login novamente', variant: 'destructive' });
        handleLogout();
      } else {
        setResult({ type: 'error', message: error.response?.data?.detail || 'Erro ao buscar ingresso' });
      }
    } finally {
      setLoading(false);
    }
  };

  const validateTicket = async () => {
    if (!ticketCode.trim()) return;

    setLoading(true);

    try {
      const response = await axios.post(`${API}/staff/validate-ticket`, {
        ticket_code: ticketCode.trim()
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.valid) {
        setResult({ 
          type: 'success', 
          message: 'Ingresso validado com sucesso!',
          data: response.data.order 
        });
        toast({ title: 'Sucesso', description: 'Ingresso validado!' });
      } else {
        setResult({ 
          type: 'warning', 
          message: response.data.message,
          data: response.data
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setResult({ type: 'error', message: 'Ingresso não encontrado' });
      } else {
        setResult({ type: 'error', message: error.response?.data?.detail || 'Erro ao validar ingresso' });
      }
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setTicketCode('');
    setResult(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchTicket();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="check-in-page">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="Acqua Park" className="h-10" />
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#2389a3' }}>Check-in de Ingressos</h1>
                <p className="text-sm text-gray-500">Sistema de validação</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{staff?.name}</p>
                <p className="text-xs text-gray-500">{staff?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} data-testid="staff-logout-btn">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" style={{ color: '#2389a3' }} />
              <span>Validar Ingresso</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Código do Ingresso</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    placeholder="Ex: TKT-ABC123DEF456"
                    className="flex-1 font-mono text-lg"
                    data-testid="ticket-code-input"
                  />
                  <Button
                    onClick={searchTicket}
                    disabled={loading}
                    style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                    className="text-white"
                    data-testid="search-ticket-btn"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Digite o código impresso no ingresso ou escaneie o QR Code
                </p>
              </div>

              {result && (
                <div className="mt-4" data-testid="ticket-result">
                  {/* Error */}
                  {result.type === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <XCircle className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="font-semibold text-red-700">Erro</p>
                          <p className="text-red-600">{result.message}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning (Already Used) */}
                  {result.type === 'warning' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                        <div>
                          <p className="font-semibold text-yellow-700">Atenção</p>
                          <p className="text-yellow-600">{result.message}</p>
                          {result.data?.validated_at && (
                            <p className="text-sm text-yellow-600 mt-1">
                              Validado em: {new Date(result.data.validated_at).toLocaleString('pt-BR')}
                              {result.data.validated_by_name && ` por ${result.data.validated_by_name}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success */}
                  {result.type === 'success' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="font-semibold text-green-700">{result.message}</p>
                        </div>
                      </div>
                      {result.data && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <TicketInfo data={result.data} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info (Ticket Found) */}
                  {result.type === 'info' && (
                    <div className={`p-4 rounded-lg border ${
                      result.data.validated 
                        ? 'bg-gray-50 border-gray-200' 
                        : result.data.payment_status === 'approved'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <TicketInfo data={result.data} />
                      
                      {!result.data.validated && result.data.payment_status === 'approved' && (
                        <div className="mt-4 pt-4 border-t">
                          <Button
                            onClick={validateTicket}
                            disabled={loading}
                            className="w-full text-white"
                            style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                            data-testid="validate-ticket-btn"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Validar Ingresso
                          </Button>
                        </div>
                      )}

                      {result.data.validated && (
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Ingresso já utilizado</strong>
                          </p>
                          <p className="text-xs text-gray-500">
                            Validado em: {new Date(result.data.validated_at).toLocaleString('pt-BR')}
                            {result.data.validated_by_name && ` por ${result.data.validated_by_name}`}
                          </p>
                        </div>
                      )}

                      {result.data.payment_status !== 'approved' && (
                        <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            <strong>Pagamento não aprovado</strong>
                          </p>
                          <p className="text-xs text-yellow-600">
                            Status: {result.data.payment_status}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={clearSearch}
                    variant="outline"
                    className="w-full mt-4"
                    data-testid="clear-search-btn"
                  >
                    Nova Busca
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como usar</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold">1</span>
                <span>Peça ao cliente o código do ingresso (impresso ou no celular)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold">2</span>
                <span>Digite o código ou escaneie o QR Code</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold">3</span>
                <span>Verifique as informações do ingresso e clique em "Validar"</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold">4</span>
                <span>Confirme a entrada do cliente</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Ticket Info Component
function TicketInfo({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Ticket className="h-5 w-5 text-gray-500" />
          <span className="font-mono font-bold">{data.ticket_code || data.order_id}</span>
        </div>
        <StatusBadge status={data.payment_status} validated={data.validated} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Cliente</p>
            <p className="font-medium">{data.customer_name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Data da Visita</p>
            <p className="font-medium">{new Date(data.visit_date).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <CreditCard className="h-4 w-4 text-gray-400" />
        <div>
          <p className="text-gray-500 text-sm">Valor Total</p>
          <p className="font-medium">R$ {data.total_amount?.toFixed(2)}</p>
        </div>
      </div>

      {data.items && data.items.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-500 mb-2">Ingressos:</p>
          <ul className="space-y-1">
            {data.items.map((item, idx) => (
              <li key={idx} className="text-sm flex justify-between">
                <span>{item.quantity}x {item.ticketId === 'adult' ? 'Inteiro' : item.ticketId === 'child' ? 'Meia-Entrada' : 'Pacote Família'}</span>
                <span className="text-gray-600">R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, validated }) {
  if (validated) {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
        Já utilizado
      </span>
    );
  }

  const statusMap = {
    'approved': { label: 'Aprovado', color: 'bg-green-100 text-green-700' },
    'pending': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
    'rejected': { label: 'Rejeitado', color: 'bg-red-100 text-red-700' }
  };

  const info = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${info.color}`}>
      {info.label}
    </span>
  );
}
