import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Clock, Waves } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default data while loading
const defaultParkInfo = {
  tagline: 'Diversão para toda família',
  hours: [
    { day: 'Segunda a Sexta', hours: '9h às 17h' },
    { day: 'Sábado e Domingo', hours: '8h às 18h' }
  ],
  contact: {
    address: 'Carregando...',
    phone: '',
    email: '',
    instagram: ''
  }
};

export default function Footer() {
  const [parkInfo, setParkInfo] = useState(defaultParkInfo);

  useEffect(() => {
    const fetchParkInfo = async () => {
      try {
        const response = await axios.get(`${API}/park-info`);
        if (response.data) {
          setParkInfo(response.data);
        }
      } catch (error) {
        console.error('Error fetching park info:', error);
      }
    };
    fetchParkInfo();
  }, []);

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="Acqua Park Prazeres da Serra" 
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-600">
              {parkInfo.tagline}
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-[#2389a3] transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/atracoes" className="text-sm text-gray-600 hover:text-[#2389a3] transition-colors">
                  Atrações
                </Link>
              </li>
              <li>
                <Link to="/ingressos" className="text-sm text-gray-600 hover:text-[#2389a3] transition-colors">
                  Ingressos
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-sm text-gray-600 hover:text-[#2389a3] transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Horários */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Horário de Funcionamento</h3>
            <ul className="space-y-3">
              {parkInfo.hours && parkInfo.hours.map((schedule, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-[#2389a3] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{schedule.day}</p>
                    <p className="text-gray-600">{schedule.hours}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contato</h3>
            <ul className="space-y-3">
              {parkInfo.contact?.address && (
                <li className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-[#2389a3] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{parkInfo.contact.address}</span>
                </li>
              )}
              {parkInfo.contact?.phone && (
                <li className="flex items-start space-x-2">
                  <Phone className="h-4 w-4 text-[#2389a3] mt-0.5 flex-shrink-0" />
                  <a href={`tel:${parkInfo.contact.phone}`} className="text-sm text-gray-600 hover:text-[#2389a3] transition-colors">
                    {parkInfo.contact.phone}
                  </a>
                </li>
              )}
              {parkInfo.contact?.email && (
                <li className="flex items-start space-x-2">
                  <Mail className="h-4 w-4 text-[#2389a3] mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${parkInfo.contact.email}`} className="text-sm text-gray-600 hover:text-[#2389a3] transition-colors">
                    {parkInfo.contact.email}
                  </a>
                </li>
              )}
              {parkInfo.contact?.instagram && (
                <li className="flex items-start space-x-2">
                  <Instagram className="h-4 w-4 text-[#2389a3] mt-0.5 flex-shrink-0" />
                  <a href={parkInfo.contact.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-[#2389a3] transition-colors">
                    @acqua_park01
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Acqua Park Prazeres da Serra. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <Link to="/politica-privacidade" className="text-sm text-gray-600 hover:text-[#2389a3] transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/termos-de-uso" className="text-sm text-gray-600 hover:text-[#2389a3] transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
