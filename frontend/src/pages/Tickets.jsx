import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Check, ShoppingCart, CalendarDays, CreditCard, LogIn, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useCustomerAuth } from '../stores/customerAuthStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Tickets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { customer, token, checkAuth, getAuthHeaders } = useCustomerAuth();
  
  const [tickets, setTickets] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [cart, setCart] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load tickets
      const ticketsRes = await axios.get(`${API}/tickets`);
      setTickets(ticketsRes.data);
      
      // Load available dates
      const datesRes = await axios.get(`${API}/available-dates`);
      setAvailableDates(datesRes.data);
      
      // Check authentication
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar dados', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (ticketId) => {
    setCart(prev => ({
      ...prev,
      [ticketId]: (prev[ticketId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (ticketId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[ticketId] > 1) {
        newCart[ticketId]--;
      } else {
        delete newCart[ticketId];
      }
      return newCart;
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [ticketId, quantity]) => {
      const ticket = tickets.find(t => t.ticket_id === ticketId);
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  const handleProceedToCheckout = async () => {
    // Check if user is logged in
    const isAuth = await checkAuth();
    if (!isAuth) {
      toast({
        title: 'Login Necessário',
        description: 'Você precisa fazer login para comprar ingressos',
        variant: 'destructive'
      });
      navigate('/login?redirect=/ingressos');
      return;
    }
    setIsAuthenticated(true);
    setShowCheckout(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast({
        title: 'Erro',
        description: 'Você deve aceitar os termos e condições',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: 'Erro',
        description: 'Selecione uma data para a visita',
        variant: 'destructive'
      });
      return;
    }

    // Check availability for selected date
    const totalQuantity = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    try {
      const availabilityRes = await axios.get(`${API}/check-availability/${selectedDate}?quantity=${totalQuantity}`);
      if (!availabilityRes.data.available) {
        toast({
          title: 'Erro',
          description: availabilityRes.data.message || 'Data não disponível',
          variant: 'destructive'
        });
        return;
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao verificar disponibilidade',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order items
      const items = Object.entries(cart).map(([ticketId, quantity]) => {
        const ticket = tickets.find(t => t.ticket_id === ticketId);
        return {
          ticketId,
          quantity,
          unitPrice: ticket.price
        };
      });

      // Create payment preference
      const response = await axios.post(`${API}/create-payment-preference`, {
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          document: customer.document
        },
        items,
        total_amount: calculateTotal(),
        visit_date: selectedDate
      }, { headers: getAuthHeaders() });

      // Redirect to Mercado Pago
      if (response.data.sandbox_init_point) {
        window.location.href = response.data.sandbox_init_point;
      } else if (response.data.init_point) {
        window.location.href = response.data.init_point;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.detail || 'Erro ao processar compra. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const total = calculateTotal();

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getTicketIcon = (ticketId) => {
    if (ticketId === 'adult') return '👨‍👩‍👧‍👦';
    if (ticketId === 'child') return '👧';
    if (ticketId === 'family') return '👨‍👩‍👧‍👦';
    return '🎫';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" data-testid="tickets-page">
      {/* Hero Section */}
      <section 
        className="relative h-[400px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(242, 173, 40, 0.8), rgba(230, 149, 0, 0.7)), url(https://images.pexels.com/photos/3209053/pexels-photo-3209053.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Ingressos
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Escolha o melhor ingresso para você e sua família. Aproveite nossas promoções!
          </p>
        </div>
      </section>

      {/* Tickets Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Available Dates Notice */}
          {availableDates.length === 0 && (
            <Card className="mb-8 border-yellow-300 bg-yellow-50">
              <CardContent className="py-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-yellow-800">
                    Não há datas disponíveis para compra no momento. Entre em contato conosco para mais informações.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!showCheckout ? (
            <>
              {/* Tickets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {tickets.map((ticket) => (
                  <Card 
                    key={ticket.ticket_id} 
                    className={`relative hover:shadow-xl transition-all ${
                      ticket.ticket_id === 'family' ? 'border-2' : ''
                    }`}
                    style={ticket.ticket_id === 'family' ? { borderColor: '#f2ad28' } : {}}
                    data-testid={`ticket-card-${ticket.ticket_id}`}
                  >
                    {ticket.ticket_id === 'family' && (
                      <Badge 
                        className="absolute -top-3 left-1/2 -translate-x-1/2 text-white"
                        style={{ backgroundColor: '#f2ad28' }}
                      >
                        Melhor Oferta
                      </Badge>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="text-5xl mb-4">{getTicketIcon(ticket.ticket_id)}</div>
                      <CardTitle className="text-2xl" style={{ color: '#2389a3' }}>
                        {ticket.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-2">{ticket.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <span className="text-4xl font-bold" style={{ color: '#2389a3' }}>
                          R$ {ticket.price.toFixed(2)}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">por pessoa</p>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {ticket.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <Check className="h-5 w-5 flex-shrink-0" style={{ color: '#46bfec' }} />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="space-y-3">
                        {cart[ticket.ticket_id] > 0 && (
                          <div className="flex items-center justify-center space-x-4 mb-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFromCart(ticket.ticket_id)}
                              className="px-3"
                              data-testid={`remove-${ticket.ticket_id}`}
                            >
                              −
                            </Button>
                            <span className="font-semibold">{cart[ticket.ticket_id]}</span>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToCart(ticket.ticket_id)}
                              className="px-3"
                              data-testid={`add-more-${ticket.ticket_id}`}
                            >
                              +
                            </Button>
                          </div>
                        )}
                        <Button
                          onClick={() => handleAddToCart(ticket.ticket_id)}
                          className="w-full text-white font-semibold"
                          style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                          disabled={availableDates.length === 0}
                          data-testid={`add-to-cart-${ticket.ticket_id}`}
                        >
                          {cart[ticket.ticket_id] ? 'Adicionar Mais' : 'Adicionar ao Carrinho'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cart Summary */}
              {cartItemCount > 0 && (
                <Card className="max-w-md mx-auto border-2" style={{ borderColor: '#46bfec' }} data-testid="cart-summary">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5" />
                      <span>Resumo do Carrinho</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {Object.entries(cart).map(([ticketId, quantity]) => {
                        const ticket = tickets.find(t => t.ticket_id === ticketId);
                        return ticket ? (
                          <div key={ticketId} className="flex justify-between items-center">
                            <span className="text-gray-700">
                              {ticket.name} x{quantity}
                            </span>
                            <span className="font-semibold">
                              R$ {(ticket.price * quantity).toFixed(2)}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <div className="border-t pt-3 mb-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span style={{ color: '#2389a3' }}>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {!isAuthenticated && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-700">
                          <LogIn className="h-4 w-4" />
                          <span className="text-sm">Faça login para continuar a compra</span>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={handleProceedToCheckout}
                      className="w-full text-white font-semibold text-lg py-6"
                      style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
                      data-testid="proceed-checkout-btn"
                    >
                      {isAuthenticated ? 'Finalizar Compra' : 'Fazer Login e Comprar'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* Checkout Form */
            <Card className="max-w-2xl mx-auto" data-testid="checkout-form">
              <CardHeader>
                <CardTitle className="text-2xl" style={{ color: '#2389a3' }}>
                  Finalizar Compra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Info (Read-only) */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Seus Dados</h3>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <p><strong>Nome:</strong> {customer?.name}</p>
                      <p><strong>Email:</strong> {customer?.email}</p>
                      <p><strong>Telefone:</strong> {customer?.phone}</p>
                      <p><strong>CPF:</strong> {customer?.document}</p>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center space-x-2">
                      <CalendarDays className="h-5 w-5" style={{ color: '#2389a3' }} />
                      <span>Selecione a Data da Visita</span>
                    </h3>
                    
                    {availableDates.length > 0 ? (
                      <Select value={selectedDate} onValueChange={setSelectedDate}>
                        <SelectTrigger data-testid="date-select">
                          <SelectValue placeholder="Escolha uma data disponível" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDates.map((item) => (
                            <SelectItem key={item.date} value={item.date}>
                              {formatDate(item.date)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">Não há datas disponíveis para compra.</p>
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4">Resumo do Pedido</h3>
                    <div className="space-y-2 mb-4">
                      {Object.entries(cart).map(([ticketId, quantity]) => {
                        const ticket = tickets.find(t => t.ticket_id === ticketId);
                        return ticket ? (
                          <div key={ticketId} className="flex justify-between text-sm">
                            <span>{ticket.name} x{quantity}</span>
                            <span>R$ {(ticket.price * quantity).toFixed(2)}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span style={{ color: '#2389a3' }}>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked)}
                      data-testid="accept-terms"
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      Aceito os{' '}
                      <Link to="/termos-de-uso" className="text-cyan-600 hover:underline" target="_blank">
                        termos e condições
                      </Link>{' '}
                      e{' '}
                      <Link to="/politica-privacidade" className="text-cyan-600 hover:underline" target="_blank">
                        política de privacidade
                      </Link>
                    </Label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCheckout(false)}
                      className="flex-1"
                      disabled={isProcessing}
                      data-testid="back-btn"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing || availableDates.length === 0 || !selectedDate}
                      className="flex-1 text-white font-semibold"
                      style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
                      data-testid="pay-btn"
                    >
                      {isProcessing ? (
                        'Processando...'
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <CreditCard className="h-5 w-5" />
                          <span>Pagar R$ {total.toFixed(2)}</span>
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
