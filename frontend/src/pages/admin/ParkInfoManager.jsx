import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Save, Plus, X } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ParkInfoManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    highlights: [],
    history: '',
    mission: '',
    contact: {
      address: '',
      phone: '',
      email: '',
      instagram: '',
      whatsapp: ''
    },
    hours: []
  });
  const [newHighlight, setNewHighlight] = useState('');
  const [newHour, setNewHour] = useState({ day: '', hours: '' });

  useEffect(() => {
    fetchParkInfo();
  }, []);

  const fetchParkInfo = async () => {
    try {
      const response = await axios.get(`${API}/park-info`);
      setFormData(response.data);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar informações', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API}/admin/park-info`, formData);
      toast({ title: 'Sucesso', description: 'Informações atualizadas com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar informações', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData({
        ...formData,
        highlights: [...formData.highlights, newHighlight.trim()]
      });
      setNewHighlight('');
    }
  };

  const removeHighlight = (index) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((_, i) => i !== index)
    });
  };

  const addHour = () => {
    if (newHour.day.trim() && newHour.hours.trim()) {
      setFormData({
        ...formData,
        hours: [...formData.hours, { ...newHour }]
      });
      setNewHour({ day: '', hours: '' });
    }
  };

  const removeHour = (index) => {
    setFormData({
      ...formData,
      hours: formData.hours.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>Informações do Parque</h2>
          <p className="text-gray-600">Atualize informações gerais, contato e horários</p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="text-white font-semibold"
          style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#2389a3' }}>Informações Básicas</h3>
            
            <div>
              <Label>Nome do Parque</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Slogan</Label>
              <Input
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div>
              <Label>História</Label>
              <Textarea
                value={formData.history}
                onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Missão</Label>
              <Textarea
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#2389a3' }}>Destaques</h3>
            
            <div className="space-y-2">
              {formData.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Input value={highlight} disabled className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeHighlight(idx)}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <Input
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  placeholder="Novo destaque"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  className="flex-1"
                />
                <Button type="button" onClick={addHighlight} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#2389a3' }}>Informações de Contato</h3>
            
            <div>
              <Label>Endereço</Label>
              <Input
                value={formData.contact.address}
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, address: e.target.value }})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.contact.phone}
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value }})}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value }})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Instagram (URL)</Label>
                <Input
                  value={formData.contact.instagram}
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, instagram: e.target.value }})}
                />
              </div>
              <div>
                <Label>WhatsApp (URL)</Label>
                <Input
                  value={formData.contact.whatsapp}
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, whatsapp: e.target.value }})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#2389a3' }}>Horários de Funcionamento</h3>
            
            <div className="space-y-2">
              {formData.hours.map((hour, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Input value={hour.day} disabled className="flex-1" />
                  <Input value={hour.hours} disabled className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeHour(idx)}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <Input
                  value={newHour.day}
                  onChange={(e) => setNewHour({ ...newHour, day: e.target.value })}
                  placeholder="Ex: Segunda a Sexta"
                  className="flex-1"
                />
                <Input
                  value={newHour.hours}
                  onChange={(e) => setNewHour({ ...newHour, hours: e.target.value })}
                  placeholder="Ex: 10h às 17h"
                  className="flex-1"
                />
                <Button type="button" onClick={addHour} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}