import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { BarChart3, Save, Plus, Trash2, Waves, Sun, Users, Shield, Star, Heart, ThumbsUp, Award } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../stores/authStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Available icons
const iconOptions = [
  { value: 'waves', label: 'Ondas', icon: Waves },
  { value: 'sun', label: 'Sol', icon: Sun },
  { value: 'users', label: 'Pessoas', icon: Users },
  { value: 'shield', label: 'Escudo', icon: Shield },
  { value: 'star', label: 'Estrela', icon: Star },
  { value: 'heart', label: 'Coração', icon: Heart },
  { value: 'thumbsup', label: 'Positivo', icon: ThumbsUp },
  { value: 'award', label: 'Prêmio', icon: Award },
];

const getIconComponent = (iconName) => {
  const found = iconOptions.find(opt => opt.value === iconName);
  return found?.icon || Waves;
};

export default function SiteStatsManager() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/site-stats`, {
        headers: getAuthHeaders()
      });
      setStats(response.data.stats || []);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar estatísticas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/site-stats`, { stats }, {
        headers: getAuthHeaders()
      });
      toast({ title: 'Sucesso', description: 'Estatísticas salvas com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar estatísticas', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateStat = (index, field, value) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };

  const addStat = () => {
    setStats([...stats, { icon: 'star', value: '0', label: 'Nova Estatística' }]);
  };

  const removeStat = (index) => {
    if (stats.length <= 1) {
      toast({ title: 'Atenção', description: 'Deve haver pelo menos uma estatística', variant: 'destructive' });
      return;
    }
    setStats(stats.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6" data-testid="site-stats-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>Estatísticas do Site</h2>
          <p className="text-gray-600">Edite os números exibidos na página inicial</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={addStat}
            variant="outline"
            data-testid="add-stat-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="text-white"
            style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
            data-testid="save-stats-btn"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Prévia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = getIconComponent(stat.icon);
              const iconColors = {
                waves: '#46bfec',
                sun: '#f2ad28',
                users: '#46bfec',
                shield: '#22c55e',
                star: '#f2ad28',
                heart: '#ef4444',
                thumbsup: '#22c55e',
                award: '#f2ad28'
              };
              return (
                <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-center mb-2">
                    <IconComponent className="w-8 h-8" style={{ color: iconColors[stat.icon] || '#46bfec' }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: '#2389a3' }}>{stat.value}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} data-testid={`stat-card-${index}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Estatística {index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeStat(index)}
                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                  data-testid={`remove-stat-${index}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Ícone</Label>
                  <Select
                    value={stat.icon}
                    onValueChange={(value) => updateStat(index, 'icon', value)}
                  >
                    <SelectTrigger data-testid={`stat-icon-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => {
                        const IconComp = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <IconComp className="h-4 w-4" />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Valor</Label>
                  <Input
                    value={stat.value}
                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                    placeholder="Ex: 15+, 100%, 50k+"
                    data-testid={`stat-value-${index}`}
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={stat.label}
                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                    placeholder="Ex: Atrações, Visitantes/ano"
                    data-testid={`stat-label-${index}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
