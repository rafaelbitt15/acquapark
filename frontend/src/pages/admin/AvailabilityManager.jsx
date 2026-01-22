import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar, Plus, Trash2, Edit2, Package } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useAuth } from '../../stores/authStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AvailabilityManager() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAuth();
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    total_tickets: 100
  });

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      const response = await axios.get(`${API}/admin/ticket-availability`, {
        headers: getAuthHeaders()
      });
      setAvailabilities(response.data);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar disponibilidades', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await axios.put(`${API}/admin/ticket-availability/${editingItem.date}`, {
          total_tickets: formData.total_tickets
        }, { headers: getAuthHeaders() });
        toast({ title: 'Sucesso', description: 'Disponibilidade atualizada!' });
      } else {
        await axios.post(`${API}/admin/ticket-availability`, formData, {
          headers: getAuthHeaders()
        });
        toast({ title: 'Sucesso', description: 'Disponibilidade criada!' });
      }
      setDialogOpen(false);
      resetForm();
      fetchAvailabilities();
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error.response?.data?.detail || 'Erro ao salvar disponibilidade', 
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (date) => {
    if (!window.confirm('Tem certeza que deseja remover esta disponibilidade?')) return;
    
    try {
      await axios.delete(`${API}/admin/ticket-availability/${date}`, {
        headers: getAuthHeaders()
      });
      toast({ title: 'Sucesso', description: 'Disponibilidade removida!' });
      fetchAvailabilities();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao remover disponibilidade', variant: 'destructive' });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      date: item.date,
      total_tickets: item.total_tickets
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ date: '', total_tickets: 100 });
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getAvailableCount = (item) => {
    return item.total_tickets - (item.tickets_sold || 0);
  };

  const getProgressColor = (item) => {
    const available = getAvailableCount(item);
    const percentage = (available / item.total_tickets) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6" data-testid="availability-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>Disponibilidade de Ingressos</h2>
          <p className="text-gray-600">Gerencie a quantidade de ingressos disponíveis por dia</p>
        </div>
        <Button 
          onClick={openNewDialog}
          className="text-white"
          style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
          data-testid="add-availability-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Disponibilidade
        </Button>
      </div>

      {availabilities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Nenhuma disponibilidade configurada</p>
            <Button 
              onClick={openNewDialog}
              style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
              className="text-white"
            >
              Configurar Primeira Data
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availabilities.map((item) => (
            <Card key={item._id} className="hover:shadow-lg transition-shadow" data-testid={`availability-card-${item.date}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2" style={{ color: '#2389a3' }} />
                    {formatDate(item.date)}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                      data-testid={`edit-availability-${item.date}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.date)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`delete-availability-${item.date}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total de ingressos:</span>
                    <span className="font-semibold">{item.total_tickets}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vendidos:</span>
                    <span className="font-semibold text-orange-600">{item.tickets_sold || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Disponíveis:</span>
                    <span className="font-semibold text-green-600">{getAvailableCount(item)}</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(item)}`}
                      style={{ width: `${((item.tickets_sold || 0) / item.total_tickets) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {Math.round(((item.tickets_sold || 0) / item.total_tickets) * 100)}% vendido
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Disponibilidade' : 'Nova Disponibilidade'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Data *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                disabled={!!editingItem}
                min={new Date().toISOString().split('T')[0]}
                data-testid="availability-date-input"
              />
            </div>
            <div>
              <Label>Quantidade Total de Ingressos *</Label>
              <Input
                type="number"
                min="1"
                value={formData.total_tickets}
                onChange={(e) => setFormData({ ...formData, total_tickets: parseInt(e.target.value) })}
                required
                data-testid="availability-quantity-input"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                className="flex-1 text-white"
                style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                data-testid="save-availability-btn"
              >
                {editingItem ? 'Atualizar' : 'Criar'}
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
