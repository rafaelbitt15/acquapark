import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { UserCheck, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StaffLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/staff/login`, formData);
      
      // Store token and staff info
      localStorage.setItem('staff_token', response.data.access_token);
      localStorage.setItem('staff_info', JSON.stringify(response.data.staff));
      
      toast({ title: 'Sucesso', description: 'Login realizado com sucesso!' });
      navigate('/check-in');
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error.response?.data?.detail || 'Email ou senha incorretos', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-4" data-testid="staff-login-page">
      <Toaster />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Acqua Park" className="h-16" />
          </div>
          <CardTitle className="text-2xl" style={{ color: '#2389a3' }}>
            Acesso Funcionário
          </CardTitle>
          <p className="text-gray-500 text-sm mt-2">
            Entre para acessar o sistema de validação de ingressos
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                required
                data-testid="staff-login-email"
              />
            </div>
            <div>
              <Label>Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  data-testid="staff-login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full text-white"
              style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
              disabled={loading}
              data-testid="staff-login-submit"
            >
              {loading ? 'Entrando...' : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              Voltar ao site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
