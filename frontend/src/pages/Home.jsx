import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Waves, Sun, Users, Shield, Sparkles, Star } from 'lucide-react';
import { parkInfo, attractions, testimonials } from '../mock';

export default function Home() {
  const featuredAttractions = attractions.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section 
        className="relative h-[600px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(35, 137, 163, 0.7), rgba(70, 191, 236, 0.6)), url(https://images.pexels.com/photos/8681434/pexels-photo-8681434.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/30 transition-all">
            Diversão para toda família
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
            Acqua Park<br />Prazeres da Serra
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/95">
            {parkInfo.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ingressos">
              <Button 
                size="lg" 
                className="text-white font-semibold shadow-xl hover:shadow-2xl transition-all text-lg px-8 py-6"
                style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
              >
                Comprar Ingressos
              </Button>
            </Link>
            <Link to="/atracoes">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white border-white/40 hover:bg-white/20 transition-all text-lg px-8 py-6"
              >
                Conhecer Atrações
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#2389a3' }}>
              Bem-vindo ao Paraíso Aquático
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {parkInfo.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {parkInfo.highlights.map((highlight, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{highlight}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Attractions */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#2389a3' }}>
              Atrações em Destaque
            </h2>
            <p className="text-lg text-gray-600">Conheça algumas das nossas atrações mais populares</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {featuredAttractions.map((attraction) => (
              <Card key={attraction.id} className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={attraction.image} 
                    alt={attraction.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-3 right-3" style={{ backgroundColor: attraction.category === 'Radical' ? '#f2ad28' : '#2389a3' }}>
                    {attraction.category}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#2389a3' }}>{attraction.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{attraction.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Altura mínima: {attraction.minHeight}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/atracoes">
              <Button 
                size="lg"
                className="text-white font-semibold shadow-md hover:shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
              >
                Ver Todas as Atrações
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#2389a3' }}>
              Por Que Nos Escolher?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                  <Waves className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Atrações Modernas</h3>
                <p className="text-sm text-gray-600">Equipamentos de última geração e constantemente renovados</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}>
                  <Sun className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Clima Tropical</h3>
                <p className="text-sm text-gray-600">Sol o ano todo no coração da Bahia</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Para Toda Família</h3>
                <p className="text-sm text-gray-600">Atrações para todas as idades e gostos</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}>
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Segurança Garantida</h3>
                <p className="text-sm text-gray-600">Equipe treinada e salvavidas em todas as atrações</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#2389a3' }}>
              O Que Dizem Nossos Visitantes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="pt-6 pb-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" style={{ color: '#f2ad28' }} />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">{testimonial.name}</span>
                    <span className="text-gray-500">{testimonial.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 text-white relative"
        style={{
          background: 'linear-gradient(135deg, #2389a3 0%, #46bfec 100%)'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para a Aventura?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Garanta seu ingresso agora e aproveite um dia inesquecível de diversão!
          </p>
          <Link to="/ingressos">
            <Button 
              size="lg" 
              className="text-white font-semibold shadow-xl hover:shadow-2xl transition-all text-lg px-8 py-6"
              style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
            >
              Comprar Ingressos Agora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}