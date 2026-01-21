import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Save, CreditCard, Key, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MercadoPagoConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    access_token: '',
    public_key: '',
    webhook_secret: ''
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API}/admin/mercadopago-config`);
      setConfig(response.data);
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.post(`${API}/admin/mercadopago-config`, config);
      toast({
        title: 'Sucesso!',
        description: 'Configuração do Mercado Pago salva com sucesso!'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>
          Configuração do Mercado Pago
        </h2>
        <p className="text-gray-600">
          Configure suas credenciais do Mercado Pago para aceitar pagamentos online
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Você precisa de uma conta Mercado Pago para aceitar pagamentos.
          <br />
          <a 
            href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-configuration/credentials" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Clique aqui para obter suas credenciais →
          </a>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" style={{ color: '#2389a3' }} />
            <CardTitle>Credenciais do Mercado Pago</CardTitle>
          </div>
          <CardDescription>
            Insira suas credenciais de produção ou teste abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="access_token" className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Access Token *</span>
                </Label>
                <Input
                  id="access_token"
                  type="password"
                  value={config.access_token}
                  onChange={(e) => setConfig({ ...config, access_token: e.target.value })}
                  placeholder="APP_USR-..."
                  required
                  className="mt-2 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Token privado usado no backend para processar pagamentos
                </p>
              </div>

              <div>
                <Label htmlFor="public_key" className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Public Key *</span>
                </Label>
                <Input
                  id="public_key"
                  value={config.public_key}
                  onChange={(e) => setConfig({ ...config, public_key: e.target.value })}
                  placeholder="APP_USR-..."
                  required
                  className="mt-2 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Chave pública usada no frontend
                </p>
              </div>

              <div>
                <Label htmlFor="webhook_secret">Webhook Secret (Opcional)</Label>
                <Input
                  id="webhook_secret"
                  type="password"
                  value={config.webhook_secret}
                  onChange={(e) => setConfig({ ...config, webhook_secret: e.target.value })}
                  placeholder="..."
                  className="mt-2 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usado para validar notificações do Mercado Pago
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Como Obter suas Credenciais</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Acesse o <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Painel do Desenvolvedor</a></li>
                <li>Vá em "Suas integrações" → "Credenciais"</li>
                <li>Escolha entre "Credenciais de produção" ou "Credenciais de teste"</li>
                <li>Copie o Access Token e Public Key</li>
                <li>Cole aqui e salve</li>
              </ol>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={saving}
                className="text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Configuração'}
              </Button>
              
              {config.access_token && config.public_key && (
                <div className="flex items-center text-green-600 text-sm">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Configurado
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook URL</CardTitle>
          <CardDescription>
            Configure esta URL no painel do Mercado Pago para receber notificações de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <code className="text-sm break-all">
              {BACKEND_URL}/api/webhooks/mercadopago
            </code>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Copie esta URL e configure em: Suas integrações → Webhooks → Adicionar URL
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
