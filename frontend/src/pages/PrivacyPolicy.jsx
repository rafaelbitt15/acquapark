import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold" style={{ color: '#2389a3' }}>Política de Privacidade</h1>
            <p className="text-gray-600 mt-2">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>1. Introdução</h2>
                <p>
                  O Acqua Park Prazeres da Serra ("nós", "nosso" ou "Acqua Park") está comprometido em proteger sua privacidade. 
                  Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações pessoais 
                  em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>2. Dados que Coletamos</h2>
                <h3 className="font-semibold mb-2">2.1. Dados Fornecidos por Você:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Cadastro:</strong> Nome completo, e-mail, telefone, CPF</li>
                  <li><strong>Compra de Ingressos:</strong> Informações de pagamento processadas via Mercado Pago</li>
                  <li><strong>Contato:</strong> Nome, e-mail, telefone, mensagem</li>
                </ul>

                <h3 className="font-semibold mb-2 mt-4">2.2. Dados Coletados Automaticamente:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Cookies:</strong> Informações sobre navegação e preferências</li>
                  <li><strong>Logs:</strong> Endereço IP, navegador, páginas visitadas</li>
                  <li><strong>Dispositivo:</strong> Tipo de dispositivo, sistema operacional</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>3. Como Usamos seus Dados</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Processar compras e emitir ingressos</li>
                  <li>Gerenciar sua conta e autenticação</li>
                  <li>Responder suas mensagens e solicitações</li>
                  <li>Enviar confirmações de pedidos e atualizações</li>
                  <li>Melhorar nossos serviços e experiência do usuário</li>
                  <li>Cumprir obrigações legais e fiscais</li>
                  <li>Prevenir fraudes e garantir segurança</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>4. Base Legal para Processamento</h2>
                <p>Processamos seus dados pessoais com base em:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Consentimento:</strong> Ao aceitar nossos termos e política</li>
                  <li><strong>Execução de Contrato:</strong> Para processar compras</li>
                  <li><strong>Obrigação Legal:</strong> Para cumprir leis fiscais e regulatórias</li>
                  <li><strong>Interesses Legítimos:</strong> Para melhorar nossos serviços</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>5. Compartilhamento de Dados</h2>
                <p>Compartilhamos seus dados apenas com:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Mercado Pago:</strong> Para processamento de pagamentos</li>
                  <li><strong>Provedores de Hospedagem:</strong> Para armazenamento seguro</li>
                  <li><strong>Autoridades:</strong> Quando exigido por lei</li>
                </ul>
                <p className="mt-2">Nunca vendemos seus dados pessoais a terceiros.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>6. Cookies</h2>
                <p>
                  Utilizamos cookies para melhorar sua experiência. Você pode gerenciar suas preferências de cookies 
                  através do banner de cookies ou configurações do navegador.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Necessários:</strong> Essenciais para o funcionamento do site</li>
                  <li><strong>Análise:</strong> Para entender como você usa o site</li>
                  <li><strong>Marketing:</strong> Para personalizar conteúdo</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>7. Seus Direitos (LGPD)</h2>
                <p>Você tem direito a:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Confirmação:</strong> Saber se processamos seus dados</li>
                  <li><strong>Acesso:</strong> Solicitar cópia dos seus dados</li>
                  <li><strong>Correção:</strong> Atualizar dados incompletos ou incorretos</li>
                  <li><strong>Exclusão:</strong> Solicitar remoção dos seus dados</li>
                  <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                  <li><strong>Revogação:</strong> Retirar seu consentimento a qualquer momento</li>
                  <li><strong>Oposição:</strong> Opor-se ao processamento em certas situações</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>8. Segurança</h2>
                <p>
                  Implementamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, 
                  perda, alteração ou divulgação. Isso inclui criptografia, controle de acesso e monitoramento contínuo.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>9. Retenção de Dados</h2>
                <p>
                  Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, 
                  ou conforme exigido por lei (mínimo de 5 anos para dados fiscais).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>10. Menores de Idade</h2>
                <p>
                  Nosso site não é direcionado a menores de 18 anos. Não coletamos intencionalmente dados de menores. 
                  Compras para menores devem ser feitas por responsáveis legais.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>11. Alterações nesta Política</h2>
                <p>
                  Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através do site 
                  ou e-mail. A data da última atualização estará sempre no topo desta página.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>12. Contato</h2>
                <p>Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:</p>
                <div className="bg-gray-50 p-4 rounded-lg mt-3">
                  <p><strong>E-mail:</strong> contato@acquaparkps.com.br</p>
                  <p><strong>Telefone:</strong> +55 75 98138-7765</p>
                  <p><strong>Endereço:</strong> Fazenda Boqueirão, 987 – Jiquiriçá BA</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}