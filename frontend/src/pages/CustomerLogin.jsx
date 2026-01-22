import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Waves, Lock, Mail } from 'lucide-react';
import { useCustomerAuth } from '../stores/customerAuthStore';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/minha-conta';
  const { login } = useCustomerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #2389a3 0%, #46bfec 100%)' }} data-testid="customer-login-page">
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
            <CardTitle className="text-2xl font-bold" style={{ color: '#2389a3' }}>Minha Conta</CardTitle>
            <CardDescription className="mt-2">Faça login para ver seus ingressos</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="flex items-center space-x-2 mb-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required disabled={isLoading} data-testid="login-email" />
            </div>

            <div>
              <Label htmlFor="password" className="flex items-center space-x-2 mb-2">
                <Lock className="h-4 w-4" />
                <span>Senha</span>
              </Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required disabled={isLoading} data-testid="login-password" />
            </div>

            <div className="text-right">
              <Link to="/esqueci-senha" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <Button type="submit" disabled={isLoading} className="w-full text-white font-semibold" style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }} data-testid="login-submit">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Não tem uma conta? </span>
              <Link to="/cadastro" className="font-semibold hover:underline" style={{ color: '#2389a3' }}>Criar conta</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}