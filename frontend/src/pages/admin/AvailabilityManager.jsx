import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Calendar, Plus, Trash2, Edit, TicketCheck } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AvailabilityManager() {
  const { toast } = useToast();
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
      const response = await axios.get(`${API}/admin/ticket-availability`);
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
          total_tickets: formData.total_tickets,
          is_active: true
        });
        toast({ title: 'Sucesso', description: 'Disponibilidade atualizada!' });
      } else {
        await axios.post(`${API}/admin/ticket-availability`, formData);
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
      await axios.delete(`${API}/admin/ticket-availability/${date}`);
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

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>
            Disponibilidade de Ingressos
          </h2>
          <p className="text-gray-600">Configure a quantidade de ingressos disponíveis por dia</p>
        </div>
        <Button
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="text-white"
          style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availabilities.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma disponibilidade configurada</p>
              <p className="text-sm">Clique em "Nova Data" para adicionar</p>
            </CardContent>
          </Card>
        ) : (
          availabilities.map((item) => {
            const available = item.total_tickets - item.tickets_sold;
            const percentage = (item.tickets_sold / item.total_tickets) * 100;
            
            return (
              <Card key={item._id} className={`hover:shadow-lg transition-shadow ${!item.is_active ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" style={{ color: '#2389a3' }} />
                      {formatDate(item.date)}
                    </span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(item.date)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Vendidos</span>
                      <span className="font-semibold">{item.tickets_sold} / {item.total_tickets}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: percentage > 80 ? '#ef4444' : percentage > 50 ? '#f59e0b' : '#22c55e'
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${available === 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {available === 0 ? 'Esgotado' : `${available} disponíveis`}
                      </span>
                      {!item.is_active && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">Inativo</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

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
                disabled={!!editingItem}
                required
                min={new Date().toISOString().split('T')[0]}
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
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 text-white"
                style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
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
