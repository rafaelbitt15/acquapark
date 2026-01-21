import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Check, ShoppingCart, CalendarDays, CreditCard } from 'lucide-react';
import { tickets, mockPurchaseTicket } from '../mock';
import { useToast } from '../hooks/use-toast';

export default function Tickets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    visitDate: '',
    acceptTerms: false
  });

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
      const ticket = tickets.find(t => t.id === ticketId);
      return total + (ticket.price * quantity);
    }, 0);
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

    setIsProcessing(true);

    try {
      const result = await mockPurchaseTicket({
        ...formData,
        tickets: cart,
        total: calculateTotal()
      });

      toast({
        title: 'Sucesso!',
        description: result.message
      });

      // Reset form
      setCart({});
      setFormData({
        name: '',
        email: '',
        phone: '',
        document: '',
        visitDate: '',
        acceptTerms: false
      });
      setShowCheckout(false);

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao processar compra. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const total = calculateTotal();

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
          {!showCheckout ? (
            <>
              {/* Tickets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {tickets.map((ticket) => (
                  <Card 
                    key={ticket.id} 
                    className={`relative hover:shadow-xl transition-all ${
                      ticket.id === 'family' ? 'border-2' : ''
                    }`}
                    style={ticket.id === 'family' ? { borderColor: '#f2ad28' } : {}}
                  >
                    {ticket.id === 'family' && (
                      <Badge 
                        className="absolute -top-3 left-1/2 -translate-x-1/2 text-white"
                        style={{ backgroundColor: '#f2ad28' }}
                      >
                        Melhor Oferta
                      </Badge>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="text-5xl mb-4">{ticket.icon}</div>
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
                        {cart[ticket.id] > 0 && (
                          <div className="flex items-center justify-center space-x-4 mb-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFromCart(ticket.id)}
                              className="px-3"
                            >
                              −
                            </Button>
                            <span className="font-semibold">{cart[ticket.id]}</span>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToCart(ticket.id)}
                              className="px-3"
                            >
                              +
                            </Button>
                          </div>
                        )}
                        <Button
                          onClick={() => handleAddToCart(ticket.id)}
                          className="w-full text-white font-semibold"
                          style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                        >
                          {cart[ticket.id] ? 'Adicionar Mais' : 'Adicionar ao Carrinho'}
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
                        const ticket = tickets.find(t => t.id === ticketId);
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div>
                        <Label htmlFor="visitDate" className="flex items-center space-x-1">
                          <CalendarDays className="h-4 w-4" />
                          <span>Data da Visita *</span>
                        </Label>
                        <Input
                          id="visitDate"
                          type="date"
                          value={formData.visitDate}
                          onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                          required
                          className="mt-1"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4">Resumo do Pedido</h3>
                    <div className="space-y-2 mb-4">
                      {Object.entries(cart).map(([ticketId, quantity]) => {
                        const ticket = tickets.find(t => t.id === ticketId);
                        return (
                          <div key={ticketId} className="flex justify-between text-sm">
                            <span>{ticket.name} x{quantity}</span>
                            <span>R$ {(ticket.price * quantity).toFixed(2)}</span>
                          </div>
                        );
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
                      disabled={isProcessing}
                      className="flex-1 text-white font-semibold"
                      style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
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