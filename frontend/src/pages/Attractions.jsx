import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Attractions() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const response = await axios.get(`${API}/attractions`);
      setAttractions(response.data);
    } catch (error) {
      console.error('Error fetching attractions:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'Radical', label: 'Radical' },
    { value: 'Família', label: 'Família' },
    { value: 'Infantil', label: 'Infantil' }
  ];

  const filteredAttractions = selectedCategory === 'all' 
    ? attractions 
    : attractions.filter(a => a.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando atrações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section 
        className="relative h-[400px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(35, 137, 163, 0.8), rgba(70, 191, 236, 0.7)), url(https://images.pexels.com/photos/12049186/pexels-photo-12049186.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Nossas Atrações
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Descubra as melhores atrações aquáticas da região! De toboáguas radicais a piscinas relaxantes.
          </p>
        </div>
      </section>

      {/* Attractions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="mb-12">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
                {categories.map((cat) => (
                  <TabsTrigger key={cat.value} value={cat.value}>
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Attractions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAttractions.map((attraction) => (
              <Card 
                key={attraction.id} 
                className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2 group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={attraction.image} 
                    alt={attraction.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge 
                    className="absolute top-4 right-4 text-white border-0" 
                    style={{ 
                      backgroundColor: attraction.category === 'Radical' ? '#f2ad28' : attraction.category === 'Infantil' ? '#46bfec' : '#2389a3' 
                    }}
                  >
                    {attraction.category}
                  </Badge>
                  <h3 className="absolute bottom-4 left-4 right-4 text-2xl font-bold text-white">
                    {attraction.name}
                  </h3>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6">{attraction.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">Altura Mínima:</span>
                      <span className="font-semibold" style={{ color: '#2389a3' }}>{attraction.minHeight}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">Idade:</span>
                      <span className="font-semibold" style={{ color: '#2389a3' }}>{attraction.ageRestriction}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAttractions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhuma atração encontrada nesta categoria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Safety Info */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2" style={{ borderColor: '#46bfec' }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#2389a3' }}>
                Informações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#2389a3' }}>Regras Gerais</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Respeite as restrições de altura e idade de cada atração</li>
                    <li>• Siga as instruções dos salva-vidas e monitores</li>
                    <li>• Crianças devem estar sempre acompanhadas de um adulto</li>
                    <li>• Não use óculos de grau ou joias nas atrações</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#2389a3' }}>Itens Proibidos</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Alimentos e bebidas de fora</li>
                    <li>• Objetos de vidro</li>
                    <li>• Animais de estimação (exceto cães-guia)</li>
                    <li>• Equipamentos fotográficos profissionais sem autorização</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}