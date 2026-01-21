import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { MapPin, Phone, Mail, Clock, Send, Instagram, MessageCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parkInfo, setParkInfo] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchParkInfo(), fetchFaqs()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchParkInfo = async () => {
    try {
      const response = await axios.get(`${API}/park-info`);
      setParkInfo(response.data);
    } catch (error) {
      console.error('Error fetching park info:', error);
    }
  };

  const fetchFaqs = async () => {
    try {
      const response = await axios.get(`${API}/faqs`);
      setFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API}/contact`, formData);
      
      toast({
        title: 'Mensagem Enviada!',
        description: 'Recebemos sua mensagem. Responderemos em breve!'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section 
        className="relative h-[400px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(35, 137, 163, 0.8), rgba(70, 191, 236, 0.7)), url(https://images.pexels.com/photos/15322719/pexels-photo-15322719.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Entre em Contato
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Estamos aqui para ajudar! Tire suas dúvidas ou agende sua visita.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2389a3] mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando informações...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Contact Info & Form */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Information */}
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-6" style={{ color: '#2389a3' }}>
                      Informações de Contato
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Entre em contato conosco através dos canais abaixo ou preencha o formulário. Responderemos o mais breve possível!
                    </p>
                  </div>

                  <div className="space-y-6">
                    <Card className="hover:shadow-lg transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                            <MapPin className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-1">Endereço</h3>
                            <p className="text-gray-600">{parkInfo?.contact?.address}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}>
                            <Phone className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-1">Telefone</h3>
                            <a href={`tel:${parkInfo?.contact?.phone}`} className="text-gray-600 hover:text-[#2389a3] transition-colors">
                              {parkInfo?.contact?.phone}
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                            <Mail className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-1">Email</h3>
                            <a href={`mailto:${parkInfo?.contact?.email}`} className="text-gray-600 hover:text-[#2389a3] transition-colors">
                              {parkInfo?.contact?.email}
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}>
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Horário de Funcionamento</h3>
                            {parkInfo?.hours?.map((schedule, index) => (
                              <div key={index} className="text-gray-600 text-sm mb-1">
                                <span className="font-medium">{schedule.day}:</span> {schedule.hours}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-4">
                    <a 
                      href={parkInfo?.contact?.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
                      style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)' }}
                    >
                      <Instagram className="h-5 w-5" />
                      <span>Instagram</span>
                    </a>
                    <a 
                      href={parkInfo?.contact?.whatsapp} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 hover:shadow-lg transition-all"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

            {/* Contact Form */}
            <Card className="border-2" style={{ borderColor: '#46bfec' }}>
              <CardHeader>
                <CardTitle className="text-2xl" style={{ color: '#2389a3' }}>
                  Envie sua Mensagem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Assunto *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Sobre o que você quer falar?"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Digite sua mensagem aqui..."
                      required
                      rows={5}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-white font-semibold text-lg py-6"
                    style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
                  >
                    {isSubmitting ? (
                      'Enviando...'
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Send className="h-5 w-5" />
                        <span>Enviar Mensagem</span>
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#2389a3' }}>
                Perguntas Frequentes
              </h2>
              <p className="text-gray-600">Encontre respostas para as dúvidas mais comuns</p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-white border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#2389a3' }}>
              Como Chegar
            </h2>
            <p className="text-gray-600">Estamos localizados em Jiquiriçá, Bahia</p>
          </div>

          <div className="rounded-lg overflow-hidden shadow-xl border-4" style={{ borderColor: '#46bfec' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15634.123456789!2d-39.5667!3d-13.2667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDE2JzAwLjAiUyAzOcKwMzQnMDAuMCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização do Acqua Park"
            ></iframe>
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
}