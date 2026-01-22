import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Waves, Sun, Users, Shield, Sparkles, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default slide if none configured
const defaultSlide = {
  image_url: 'https://images.pexels.com/photos/8681434/pexels-photo-8681434.jpeg',
  title: '',
  subtitle: '',
  button_text: 'Comprar Ingressos',
  button_link: '/ingressos'
};

export default function Home() {
  const [slides, setSlides] = useState([defaultSlide]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [parkInfo, setParkInfo] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [slides.length]);

  const loadData = async () => {
    try {
      const [slidesRes, parkRes, attractionsRes, testimonialsRes] = await Promise.all([
        axios.get(`${API}/hero-slides`).catch(() => ({ data: [] })),
        axios.get(`${API}/park-info`).catch(() => ({ data: null })),
        axios.get(`${API}/attractions`).catch(() => ({ data: [] })),
        axios.get(`${API}/testimonials`).catch(() => ({ data: [] }))
      ]);

      if (slidesRes.data.length > 0) {
        setSlides(slidesRes.data);
      }
      setParkInfo(parkRes.data);
      setAttractions(attractionsRes.data.slice(0, 3));
      setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const getImageUrl = (url) => {
    if (!url) return defaultSlide.image_url;
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
  };

  const currentSlideData = slides[currentSlide] || defaultSlide;

  return (
    <div className="flex flex-col" data-testid="home-page">
      {/* Hero Section with Carousel */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide._id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(35, 137, 163, 0.7), rgba(70, 191, 236, 0.6)), url(${getImageUrl(slide.image_url)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-20 h-full flex items-center justify-center text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/30 transition-all">
              Diversão para toda família
            </Badge>
            
            {currentSlideData.title ? (
              <>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in">
                  {currentSlideData.title}
                </h1>
                {currentSlideData.subtitle && (
                  <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/95">
                    {currentSlideData.subtitle}
                  </p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
                  Acqua Park<br />Prazeres da Serra
                </h1>
                <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/95">
                  {parkInfo?.tagline || 'O melhor parque aquático da região!'}
                </p>
              </>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={currentSlideData.button_link || '/ingressos'}>
                <Button 
                  size="lg" 
                  className="text-white font-semibold shadow-xl hover:shadow-2xl transition-all text-lg px-8 py-6"
                  style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
                >
                  {currentSlideData.button_text || 'Comprar Ingressos'}
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
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
              aria-label="Próximo slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-white w-8' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#2389a3' }}>
              Bem-vindo ao Paraíso Aquático
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {parkInfo?.description || 'Venha viver momentos inesquecíveis com sua família no melhor parque aquático da região!'}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {(parkInfo?.highlights || ['Diversão garantida', 'Segurança total', 'Estrutura completa']).map((highlight, index) => (
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Waves className="w-8 h-8" style={{ color: '#46bfec' }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: '#2389a3' }}>15+</p>
              <p className="text-gray-600">Atrações</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Sun className="w-8 h-8" style={{ color: '#f2ad28' }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: '#2389a3' }}>365</p>
              <p className="text-gray-600">Dias de Sol</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="w-8 h-8" style={{ color: '#46bfec' }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: '#2389a3' }}>50k+</p>
              <p className="text-gray-600">Visitantes/ano</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Shield className="w-8 h-8" style={{ color: '#22c55e' }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: '#2389a3' }}>100%</p>
              <p className="text-gray-600">Segurança</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Attractions */}
      {attractions.length > 0 && (
        <section className="py-20" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Nossas Atrações
              </h2>
              <p className="text-xl text-white/90">
                Diversão garantida para todas as idades
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {attractions.map((attraction) => (
                <Card key={attraction._id} className="overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={attraction.image_url || 'https://images.pexels.com/photos/1093800/pexels-photo-1093800.jpeg'}
                      alt={attraction.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <Badge className="mb-2 text-white" style={{ backgroundColor: '#f2ad28' }}>
                      {attraction.category || 'Atração'}
                    </Badge>
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#2389a3' }}>{attraction.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{attraction.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link to="/atracoes">
                <Button 
                  size="lg"
                  className="text-white font-semibold shadow-xl hover:shadow-2xl transition-all px-8 py-6"
                  style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
                >
                  Ver Todas as Atrações
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#2389a3' }}>
                O Que Dizem Nossos Visitantes
              </h2>
              <p className="text-xl text-gray-600">
                Milhares de famílias felizes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((testimonial) => (
                <Card key={testimonial._id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" style={{ color: '#f2ad28' }} />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                    <p className="font-semibold" style={{ color: '#2389a3' }}>{testimonial.author}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section 
        className="py-20 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Pronto para se Divertir?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Compre seus ingressos agora e garanta momentos inesquecíveis!
          </p>
          <Link to="/ingressos">
            <Button 
              size="lg"
              className="font-semibold shadow-xl hover:shadow-2xl transition-all text-lg px-8 py-6"
              style={{ background: '#2389a3', color: 'white' }}
            >
              Comprar Ingressos
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
