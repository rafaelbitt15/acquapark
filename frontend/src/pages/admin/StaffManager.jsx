import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { UserPlus, Trash2, User, Mail, Shield } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StaffManager() {
  const { toast } = useToast();
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
      const response = await axios.get(`${API}/admin/staff`);
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
      await axios.post(`${API}/admin/staff`, formData);
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

  const handleDelete = async (staffId) => {
    if (!window.confirm('Tem certeza que deseja remover este funcionário?')) return;
    try {
      await axios.delete(`${API}/admin/staff/${staffId}`);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>
            Gerenciar Funcionários
          </h2>
          <p className="text-gray-600">Funcionários podem validar ingressos na entrada do parque</p>
        </div>
        <Button
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="text-white"
          style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Acesso de Funcionários</p>
              <p className="text-sm text-blue-600">
                Funcionários acessam a página de check-in em <code className="bg-blue-100 px-1 rounded">/check-in</code> para validar ingressos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum funcionário cadastrado</p>
              <p className="text-sm">Clique em "Novo Funcionário" para adicionar</p>
            </CardContent>
          </Card>
        ) : (
          staffList.map((staff) => (
            <Card key={staff._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold">
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-lg">{staff.name}</span>
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(staff._id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {staff.email}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${staff.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {staff.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                    {staff.role || 'staff'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
                placeholder="Nome do funcionário"
                required
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            <div>
              <Label>Senha *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Senha de acesso"
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 text-white"
                style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
              >
                Criar Funcionário
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
