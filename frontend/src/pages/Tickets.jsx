import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Check, ShoppingCart, CalendarDays, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Tickets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    visitDate: '',
    acceptTerms: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsRes, availabilityRes] = await Promise.all([
        axios.get(`${API}/tickets`),
        axios.get(`${API}/admin/ticket-availability`)
      ]);
      setTickets(ticketsRes.data);
      // Filter only active dates with available tickets
      const activeDates = availabilityRes.data.filter(d => 
        d.is_active && (d.total_tickets - d.tickets_sold) > 0
      );
      setAvailableDates(activeDates);
    } catch (error) {
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

  const getTotalQuantity = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleDateChange = async (date) => {
    setFormData({ ...formData, visitDate: date });
    setSelectedDateInfo(null);
    
    if (!date) return;
    
    setCheckingAvailability(true);
    try {
      const totalQty = getTotalQuantity();
      const response = await axios.get(`${API}/check-availability/${date}?quantity=${totalQty}`);
      setSelectedDateInfo(response.data);
      
      if (!response.data.available) {
        toast({
          title: 'Data indisponível',
          description: response.data.message || 'Não há ingressos suficientes para esta data',
          variant: 'destructive'
        });
      }
    } catch (error) {
      setSelectedDateInfo({ available: false, message: 'Erro ao verificar disponibilidade' });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast({
        title: 'Erro',
        description: 'Você deve aceitar os termos e condições',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedDateInfo?.available) {
      toast({
        title: 'Data indisponível',
        description: 'Por favor, selecione uma data com disponibilidade',
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
          ticketId: ticketId,
          ticketName: ticket.name,
          quantity: quantity,
          unitPrice: ticket.price
        };
      });

      // Create payment preference
      const response = await axios.post(`${API}/create-payment-preference`, {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          document: formData.document
        },
        items: items,
        total_amount: calculateTotal(),
        visit_date: formData.visitDate
      });

      if (response.data.init_point) {
        // Redirect to Mercado Pago
        toast({
          title: 'Redirecionando...',
          description: 'Você será redirecionado para o Mercado Pago'
        });
        window.location.href = response.data.init_point;
      } else {
        toast({
          title: 'Pedido criado!',
          description: `Pedido ${response.data.order_id} criado. Configure o Mercado Pago para pagamentos.`
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erro ao processar compra. Tente novamente.';
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const total = calculateTotal();

  const getTicketIcon = (ticketId) => {
    const icons = { 'adult': '👨‍👩‍👧‍👦', 'child': '👧', 'family': '👨‍👩‍👧‍👦', 'senior': '👴', 'vip': '⭐' };
    return icons[ticketId] || '🎟️';
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#2389a3' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
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
          {availableDates.length === 0 ? (
            <Card className="max-w-2xl mx-auto mb-12 border-yellow-400 bg-yellow-50">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">Vendas temporariamente indisponíveis</p>
                    <p className="text-sm text-yellow-700">
                      Não há datas disponíveis para compra no momento. Por favor, volte em breve!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto mb-12 border-green-400 bg-green-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Datas disponíveis para visita:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableDates.slice(0, 5).map(d => (
                        <Badge key={d.date} variant="secondary" className="bg-green-100 text-green-800">
                          {formatDate(d.date)}
                        </Badge>
                      ))}
                      {availableDates.length > 5 && (
                        <Badge variant="secondary" className="bg-gray-100">
                          +{availableDates.length - 5} datas
                        </Badge>
                      )}
                    </div>
                  </div>
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

                      {ticket.features && ticket.features.length > 0 && (
                        <ul className="space-y-3 mb-6">
                          {ticket.features.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <Check className="h-5 w-5 flex-shrink-0" style={{ color: '#46bfec' }} />
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="space-y-3">
                        {cart[ticket.ticket_id] > 0 && (
                          <div className="flex items-center justify-center space-x-4 mb-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFromCart(ticket.ticket_id)}
                              className="px-3"
                            >
                              −
                            </Button>
                            <span className="font-semibold">{cart[ticket.ticket_id]}</span>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToCart(ticket.ticket_id)}
                              className="px-3"
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
                <Card className="max-w-md mx-auto border-2" style={{ borderColor: '#46bfec' }}>
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
                        if (!ticket) return null;
                        return (
                          <div key={ticketId} className="flex justify-between items-center">
                            <span className="text-gray-700">
                              {ticket.name} x{quantity}
                            </span>
                            <span className="font-semibold">
                              R$ {(ticket.price * quantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t pt-3 mb-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span style={{ color: '#2389a3' }}>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowCheckout(true)}
                      className="w-full text-white font-semibold text-lg py-6"
                      style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
                    >
                      Finalizar Compra
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* Checkout Form */
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl" style={{ color: '#2389a3' }}>
                  Finalizar Compra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Date Selection - FIRST */}
                  <div className="p-4 rounded-lg border-2" style={{ borderColor: '#46bfec', backgroundColor: '#f0f9ff' }}>
                    <h3 className="font-semibold text-lg flex items-center space-x-2 mb-4">
                      <CalendarDays className="h-5 w-5" style={{ color: '#2389a3' }} />
                      <span>Selecione a Data da Visita</span>
                    </h3>
                    
                    <div>
                      <Label htmlFor="visitDate">Data *</Label>
                      <select
                        id="visitDate"
                        value={formData.visitDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        required
                        className="w-full mt-1 p-3 border rounded-md focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Selecione uma data disponível</option>
                        {availableDates.map(d => (
                            <option key={d.date} value={d.date}>
                              {formatDate(d.date)}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {checkingAvailability && (
                      <div className="mt-3 flex items-center gap-2 text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Verificando disponibilidade...</span>
                      </div>
                    )}

                    {selectedDateInfo && !checkingAvailability && (
                      <div className={`mt-3 p-3 rounded-md ${
                        selectedDateInfo.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedDateInfo.available ? (
                          <p className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Data disponível!
                          </p>
                        ) : (
                          <p className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Ingressos esgotados para esta data
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center space-x-2">
                      <span>Informações Pessoais</span>
                    </h3>

                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="João Silva"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="joao@example.com"
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(75) 98138-7765"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="document">CPF *</Label>
                      <Input
                        id="document"
                        value={formData.document}
                        onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                        placeholder="000.000.000-00"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4">Resumo do Pedido</h3>
                    <div className="space-y-2 mb-4">
                      {Object.entries(cart).map(([ticketId, quantity]) => {
                        const ticket = tickets.find(t => t.ticket_id === ticketId);
                        if (!ticket) return null;
                        return (
                          <div key={ticketId} className="flex justify-between text-sm">
                            <span>{ticket.name} x{quantity}</span>
                            <span>R$ {(ticket.price * quantity).toFixed(2)}</span>
                          </div>
                        );
                      })}
                      {formData.visitDate && (
                        <div className="flex justify-between text-sm text-gray-600 border-t pt-2">
                          <span>Data da visita:</span>
                          <span className="font-medium">{formatDate(formData.visitDate)}</span>
                        </div>
                      )}
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
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked })}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      Aceito os termos e condições e política de cancelamento
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
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing || !selectedDateInfo?.available}
                      className="flex-1 text-white font-semibold"
                      style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processando...
                        </span>
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
