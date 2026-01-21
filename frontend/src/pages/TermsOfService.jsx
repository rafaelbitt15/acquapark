import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent } from '../components/ui/card';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold" style={{ color: '#2389a3' }}>Termos de Uso</h1>
            <p className="text-gray-600 mt-2">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>1. Aceitação dos Termos</h2>
                <p>
                  Ao acessar e usar o site do Acqua Park Prazeres da Serra ("Site"), você concorda em cumprir e estar 
                  vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve 
                  usar nosso Site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>2. Uso do Site</h2>
                <h3 className="font-semibold mb-2">2.1. Licença de Uso:</h3>
                <p>
                  Concedemos a você uma licença limitada, não exclusiva e não transferível para acessar e usar o Site 
                  para fins pessoais e não comerciais.
                </p>

                <h3 className="font-semibold mb-2 mt-4">2.2. Restrições:</h3>
                <p>Você concorda em não:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Usar o Site para qualquer finalidade ilegal ou não autorizada</li>
                  <li>Tentar obter acesso não autorizado ao Site ou sistemas relacionados</li>
                  <li>Copiar, modificar ou distribuir conteúdo do Site sem autorização</li>
                  <li>Usar bots, scrapers ou outras ferramentas automatizadas</li>
                  <li>Interferir no funcionamento adequado do Site</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>3. Cadastro e Conta</h2>
                <h3 className="font-semibold mb-2">3.1. Informações Precisas:</h3>
                <p>
                  Ao criar uma conta, você concorda em fornecer informações precisas, atuais e completas. Você é 
                  responsável por manter a confidencialidade de sua senha.
                </p>

                <h3 className="font-semibold mb-2 mt-4">3.2. Responsabilidade:</h3>
                <p>
                  Você é responsável por todas as atividades que ocorrem em sua conta. Notifique-nos imediatamente 
                  sobre qualquer uso não autorizado.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>4. Compra de Ingressos</h2>
                <h3 className="font-semibold mb-2">4.1. Preços e Disponibilidade:</h3>
                <p>
                  Todos os preços estão em Reais (BRL) e estão sujeitos a alterações sem aviso prévio. Reservamo-nos 
                  o direito de modificar ou descontinuar qualquer produto ou serviço.
                </p>

                <h3 className="font-semibold mb-2 mt-4">4.2. Pagamento:</h3>
                <p>
                  Os pagamentos são processados através do Mercado Pago. Ao fazer uma compra, você concorda com os 
                  termos de serviço do Mercado Pago.
                </p>

                <h3 className="font-semibold mb-2 mt-4">4.3. Confirmação:</h3>
                <p>
                  Você receberá uma confirmação por e-mail após a compra bem-sucedida. O ingresso é válido apenas 
                  para a data especificada no momento da compra.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>5. Política de Cancelamento e Reembolso</h2>
                <h3 className="font-semibold mb-2">5.1. Cancelamento pelo Cliente:</h3>
                <p>
                  Cancelamentos devem ser solicitados com pelo menos 48 horas de antecedência da data da visita. 
                  Cancelamentos dentro deste prazo terão direito a reembolso de 80% do valor pago.
                </p>

                <h3 className="font-semibold mb-2 mt-4">5.2. Cancelamento pelo Parque:</h3>
                <p>
                  Reservamo-nos o direito de cancelar visitas devido a condições climáticas extremas, manutenção 
                  emergencial ou outras circunstâncias imprevistas. Nesses casos, ofereceremos reembolso total ou 
                  remarcação.
                </p>

                <h3 className="font-semibold mb-2 mt-4">5.3. Não Comparecimento:</h3>
                <p>
                  Em caso de não comparecimento (no-show), não haverá reembolso.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>6. Regras do Parque</h2>
                <h3 className="font-semibold mb-2">6.1. Segurança:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Todas as instruções de segurança devem ser seguidas</li>
                  <li>Crianças devem estar sempre acompanhadas de adultos responsáveis</li>
                  <li>Restrições de altura e idade devem ser respeitadas</li>
                  <li>Pessoas sob influência de álcool ou drogas serão impedidas de usar as atrações</li>
                </ul>

                <h3 className="font-semibold mb-2 mt-4">6.2. Itens Proibidos:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Alimentos e bebidas de fora</li>
                  <li>Objetos de vidro</li>
                  <li>Armas ou objetos perigosos</li>
                  <li>Animais (exceto cães-guia)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>7. Limitação de Responsabilidade</h2>
                <p>
                  O Acqua Park não se responsabiliza por:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Lesões resultantes do não cumprimento das regras de segurança</li>
                  <li>Perda ou roubo de pertences pessoais</li>
                  <li>Danos indiretos, incidentais ou consequenciais</li>
                  <li>Interrupções de serviço por causas fora de nosso controle</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>8. Propriedade Intelectual</h2>
                <p>
                  Todo o conteúdo do Site, incluindo textos, gráficos, logos, imagens e software, é propriedade do 
                  Acqua Park ou de seus licenciadores e está protegido por leis de direitos autorais e marcas registradas.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>9. Privacidade</h2>
                <p>
                  Seu uso do Site também é regido por nossa Política de Privacidade. Por favor, revise nossa 
                  Política de Privacidade para entender nossas práticas de coleta e uso de dados.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>10. Modificações dos Termos</h2>
                <p>
                  Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão 
                  em vigor imediatamente após a publicação no Site. Seu uso contínuo do Site após tais alterações 
                  constitui sua aceitação dos novos termos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>11. Lei Aplicável</h2>
                <p>
                  Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa 
                  relacionada a estes termos será submetida à jurisdição exclusiva dos tribunais da Comarca de 
                  Jiquiriçá, Bahia.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2389a3' }}>12. Contato</h2>
                <p>Para dúvidas sobre estes Termos de Uso, entre em contato:</p>
                <div className="bg-gray-50 p-4 rounded-lg mt-3">
                  <p><strong>E-mail:</strong> contato@acquaparkps.com.br</p>
                  <p><strong>Telefone:</strong> +55 75 98138-7765</p>
                  <p><strong>Endereço:</strong> Fazenda Boqueirão, 987 – Jiquiriçá BA</p>
                </div>
              </section>

              <section className="border-t pt-6 mt-6">
                <p className="text-sm text-gray-600">
                  Ao usar o Site do Acqua Park Prazeres da Serra, você reconhece que leu, compreendeu e concorda 
                  em estar vinculado a estes Termos de Uso.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
