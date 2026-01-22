import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Users, Plus, Trash2, UserCheck, Mail } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useAuth } from '../../stores/authStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StaffManager() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${API}/admin/staff`, {
        headers: getAuthHeaders()
      });
      setStaffList(response.data);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar funcionários', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API}/admin/staff`, formData, {
        headers: getAuthHeaders()
      });
      toast({ title: 'Sucesso', description: 'Funcionário criado com sucesso!' });
      setDialogOpen(false);
      resetForm();
      fetchStaff();
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error.response?.data?.detail || 'Erro ao criar funcionário', 
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este funcionário?')) return;
    
    try {
      await axios.delete(`${API}/admin/staff/${id}`, {
        headers: getAuthHeaders()
      });
      toast({ title: 'Sucesso', description: 'Funcionário removido!' });
      fetchStaff();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao remover funcionário', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6" data-testid="staff-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>Gerenciar Funcionários</h2>
          <p className="text-gray-600">Cadastre funcionários para validar ingressos no parque</p>
        </div>
        <Button 
          onClick={() => setDialogOpen(true)}
          className="text-white"
          style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
          data-testid="add-staff-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start space-x-3">
            <UserCheck className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Sobre o acesso de funcionários</p>
              <p className="text-sm text-blue-700">
                Funcionários podem acessar a página de check-in em <strong>/check-in</strong> para 
                validar ingressos dos clientes usando o código ou QR Code.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {staffList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Nenhum funcionário cadastrado</p>
            <Button 
              onClick={() => setDialogOpen(true)}
              style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
              className="text-white"
            >
              Cadastrar Primeiro Funcionário
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((staff) => (
            <Card key={staff._id} className="hover:shadow-lg transition-shadow" data-testid={`staff-card-${staff._id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#2389a3' }}>{staff.name}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-3 w-3 mr-1" />
                        {staff.email}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                        {staff.role === 'staff' ? 'Funcionário' : staff.role}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(staff._id)}
                    className="text-red-600 hover:text-red-700"
                    data-testid={`delete-staff-${staff._id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for Add Staff */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Funcionário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome Completo *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: João Silva"
                required
                data-testid="staff-name-input"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="joao@acquapark.com"
                required
                data-testid="staff-email-input"
              />
            </div>
            <div>
              <Label>Senha *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
                data-testid="staff-password-input"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                className="flex-1 text-white"
                style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                data-testid="save-staff-btn"
              >
                Cadastrar
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
