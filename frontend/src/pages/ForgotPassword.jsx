import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { KeyRound, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  
  const [step, setStep] = useState(resetToken ? 'reset' : 'request');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/customers/forgot-password`, { email });
      setSuccess(true);
      toast({ title: 'Email enviado!', description: 'Verifique sua caixa de entrada' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error.response?.data?.detail || 'Erro ao enviar email', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: 'Erro', description: 'A senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/customers/reset-password`, {
        token: resetToken,
        new_password: newPassword
      });
      toast({ title: 'Sucesso!', description: 'Senha alterada com sucesso' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error.response?.data?.detail || 'Erro ao redefinir senha', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Toaster />
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center" data-testid="forgot-password-page">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" 
                style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl" style={{ color: '#2389a3' }}>
                {step === 'request' ? 'Esqueci Minha Senha' : 'Nova Senha'}
              </CardTitle>
              <p className="text-gray-500 text-sm mt-2">
                {step === 'request' 
                  ? 'Digite seu email para receber instruções de recuperação'
                  : 'Digite sua nova senha'}
              </p>
            </CardHeader>
            <CardContent>
              {success && step === 'request' ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Email Enviado!</h3>
                  <p className="text-gray-600 mb-6">
                    Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.
                  </p>
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar ao Login
                    </Button>
                  </Link>
                </div>
              ) : step === 'request' ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="pl-10"
                        required
                        data-testid="forgot-email-input"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full text-white"
                    style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                    disabled={loading}
                    data-testid="forgot-submit-btn"
                  >
                    {loading ? 'Enviando...' : 'Enviar Instruções'}
                  </Button>
                  <div className="text-center">
                    <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
                      <ArrowLeft className="h-4 w-4 inline mr-1" />
                      Voltar ao Login
                    </Link>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <Label>Nova Senha</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      data-testid="reset-password-input"
                    />
                  </div>
                  <div>
                    <Label>Confirmar Senha</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite a senha novamente"
                      required
                      data-testid="reset-confirm-input"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full text-white"
                    style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                    disabled={loading}
                    data-testid="reset-submit-btn"
                  >
                    {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
