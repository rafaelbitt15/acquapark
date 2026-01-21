import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Waves, User, Mail, Phone, CreditCard, Lock } from 'lucide-react';
import { useCustomerAuth } from '../stores/customerAuthStore';

export default function CustomerRegister() {
  const navigate = useNavigate();
  const { register } = useCustomerAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        document: formData.document,
        password: formData.password
      });
      navigate('/minha-conta');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #2389a3 0%, #46bfec 100%)' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="Acqua Park Prazeres da Serra" 
              className="h-16 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold" style={{ color: '#2389a3' }}>Criar Conta</CardTitle>
            <CardDescription className="mt-2">Cadastre-se para comprar ingressos</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4" />
                <span>Nome Completo</span>
              </Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="João Silva" required disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center space-x-2 mb-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="seu@email.com" required disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center space-x-2 mb-2">
                <Phone className="h-4 w-4" />
                <span>Telefone</span>
              </Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(75) 98138-7765" required disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="document" className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-4 w-4" />
                <span>CPF</span>
              </Label>
              <Input id="document" value={formData.document} onChange={(e) => setFormData({ ...formData, document: e.target.value })} placeholder="000.000.000-00" required disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="password" className="flex items-center space-x-2 mb-2">
                <Lock className="h-4 w-4" />
                <span>Senha</span>
              </Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Mínimo 6 caracteres" required disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="flex items-center space-x-2 mb-2">
                <Lock className="h-4 w-4" />
                <span>Confirmar Senha</span>
              </Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Digite a senha novamente" required disabled={isLoading} />
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <Button type="submit" disabled={isLoading} className="w-full text-white font-semibold" style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}>
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Já tem uma conta? </span>
              <Link to="/login" className="font-semibold hover:underline" style={{ color: '#2389a3' }}>Fazer login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}