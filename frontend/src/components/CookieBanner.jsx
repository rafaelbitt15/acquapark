import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { X, Cookie, Settings } from 'lucide-react';
import { useCookieConsent } from '../stores/cookieConsentStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const { hasConsent, preferences, acceptAll, acceptNecessary, setPreferences } = useCookieConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customPrefs, setCustomPrefs] = useState({
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Show banner after 1 second if no consent
    if (!hasConsent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasConsent]);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    acceptNecessary();
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    setPreferences(customPrefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2 pointer-events-auto" style={{ borderColor: '#2389a3' }}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                <Cookie className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: '#2389a3' }}>Este site utiliza cookies</h3>
                <p className="text-sm text-gray-600">Em conformidade com a LGPD</p>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-gray-700 mb-6">
            Utilizamos cookies para melhorar sua experiência de navegação, personalizar conteúdo e analisar nosso tráfego. 
            Ao clicar em "Aceitar Todos", você concorda com o uso de todos os cookies. 
            Você pode gerenciar suas preferências clicando em "Configurar".
            {' '}
            <Link to="/politica-privacidade" className="underline" style={{ color: '#2389a3' }}>
              Saiba mais
            </Link>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAcceptAll}
              className="flex-1 text-white font-semibold"
              style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
            >
              Aceitar Todos
            </Button>
            
            <Button
              onClick={handleAcceptNecessary}
              variant="outline"
              className="flex-1"
            >
              Apenas Necessários
            </Button>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Configurações de Cookies</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Cookies Necessários</h4>
                        <p className="text-sm text-gray-600">
                          Essenciais para o funcionamento básico do site. Não podem ser desativados.
                        </p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 mr-4">
                        <h4 className="font-semibold mb-1">Cookies de Análise</h4>
                        <p className="text-sm text-gray-600">
                          Nos ajudam a entender como os visitantes interagem com o site.
                        </p>
                      </div>
                      <Switch
                        checked={customPrefs.analytics}
                        onCheckedChange={(checked) => setCustomPrefs({ ...customPrefs, analytics: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 mr-4">
                        <h4 className="font-semibold mb-1">Cookies de Marketing</h4>
                        <p className="text-sm text-gray-600">
                          Usados para personalizar anúncios e medir a eficácia de campanhas.
                        </p>
                      </div>
                      <Switch
                        checked={customPrefs.marketing}
                        onCheckedChange={(checked) => setCustomPrefs({ ...customPrefs, marketing: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSavePreferences}
                      className="flex-1 text-white"
                      style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                    >
                      Salvar Preferências
                    </Button>
                    <Button
                      onClick={() => setShowSettings(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}