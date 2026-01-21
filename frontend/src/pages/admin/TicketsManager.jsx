import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Edit, Plus, Trash2, Check, DollarSign, Tag } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TicketsManager() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTicket, setEditingTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    ticket_id: '',
    name: '',
    price: 0,
    description: '',
    features: []
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API}/tickets`);
      setTickets(response.data);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar ingressos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setIsCreating(false);
    setFormData({
      ticket_id: ticket.ticket_id,
      name: ticket.name,
      price: ticket.price,
      description: ticket.description,
      features: ticket.features || []
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTicket(null);
    setIsCreating(true);
    setFormData({
      ticket_id: '',
      name: '',
      price: 0,
      description: '',
      features: []
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isCreating) {
        await axios.post(`${API}/admin/tickets`, formData);
        toast({ title: 'Sucesso', description: 'Ingresso criado com sucesso!' });
      } else {
        await axios.put(`${API}/admin/tickets/${editingTicket.ticket_id}`, {
          name: formData.name,
          price: formData.price,
          description: formData.description,
          features: formData.features
        });
        toast({ title: 'Sucesso', description: 'Ingresso atualizado com sucesso!' });
      }
      setDialogOpen(false);
      resetForm();
      fetchTickets();
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error.response?.data?.detail || 'Erro ao salvar ingresso', 
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Tem certeza que deseja remover este tipo de ingresso?')) return;
    
    try {
      await axios.delete(`${API}/admin/tickets/${ticketId}`);
      toast({ title: 'Sucesso', description: 'Ingresso removido com sucesso!' });
      fetchTickets();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao remover ingresso', variant: 'destructive' });
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setEditingTicket(null);
    setIsCreating(false);
    setFormData({
      ticket_id: '',
      name: '',
      price: 0,
      description: '',
      features: []
    });
    setFeatureInput('');
  };

  const getTicketIcon = (ticketId) => {
    const icons = {
      'adult': '👨‍👩‍👧‍👦',
      'child': '👧',
      'senior': '👴',
      'family': '👨‍👩‍👧‍👦',
      'vip': '⭐',
      'group': '👥'
    };
    return icons[ticketId] || '🎟️';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>Gerenciar Ingressos</h2>
          <p className="text-gray-600">Adicione, edite ou remova tipos de ingressos</p>
        </div>
        <Button
          onClick={handleCreate}
          className="text-white"
          style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
          data-testid="add-ticket-type-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Tipo de Ingresso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-gray-500">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum tipo de ingresso cadastrado</p>
              <p className="text-sm">Clique em "Novo Tipo de Ingresso" para adicionar</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="text-4xl mb-3">{getTicketIcon(ticket.ticket_id)}</div>
                <CardTitle style={{ color: '#2389a3' }}>{ticket.name}</CardTitle>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                  ID: {ticket.ticket_id}
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold" style={{ color: '#2389a3' }}>
                    R$ {ticket.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">por pessoa</p>
                </div>
                <p className="text-sm text-gray-600 mb-4">{ticket.description}</p>
                {ticket.features && ticket.features.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {ticket.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <Check className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: '#46bfec' }} />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(ticket)}
                    className="flex-1 text-white"
                    style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                    data-testid={`edit-ticket-${ticket.ticket_id}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(ticket.ticket_id)}
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    data-testid={`delete-ticket-${ticket.ticket_id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Novo Tipo de Ingresso' : 'Editar Ingresso'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isCreating && (
              <div>
                <Label>ID do Ingresso *</Label>
                <Input
                  value={formData.ticket_id}
                  onChange={(e) => setFormData({ ...formData, ticket_id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="ex: vip, promocional, grupo"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Identificador único (sem espaços, use underline)</p>
              </div>
            )}

            <div>
              <Label>Nome do Ingresso *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Ingresso VIP"
                required
              />
            </div>

            <div>
              <Label>Preço (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label>Descrição *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Descrição do ingresso..."
                required
              />
            </div>

            <div>
              <Label>Características / Benefícios</Label>
              <div className="space-y-2">
                {formData.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Input value={feature} disabled className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(idx)}
                      className="text-red-600"
                    >
                      Remover
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Nova característica"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addFeature} variant="outline" size="sm">
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                type="submit" 
                className="flex-1 text-white" 
                style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
              >
                {isCreating ? 'Criar Ingresso' : 'Salvar Alterações'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
