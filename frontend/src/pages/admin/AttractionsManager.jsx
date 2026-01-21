import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AttractionsManager() {
  const { toast } = useToast();
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAttraction, setEditingAttraction] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    category: 'Família',
    min_height: '',
    age_restriction: ''
  });

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const response = await axios.get(`${API}/attractions`);
      setAttractions(response.data);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar atrações', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await axios.post(`${API}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image: response.data.url }));
      toast({ title: 'Sucesso', description: 'Imagem enviada com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao fazer upload da imagem', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAttraction) {
        await axios.put(`${API}/admin/attractions/${editingAttraction._id}`, formData);
        toast({ title: 'Sucesso', description: 'Atração atualizada!' });
      } else {
        await axios.post(`${API}/admin/attractions`, formData);
        toast({ title: 'Sucesso', description: 'Atração criada!' });
      }
      setDialogOpen(false);
      resetForm();
      fetchAttractions();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar atração', variant: 'destructive' });
    }
  };

  const handleEdit = (attraction) => {
    setEditingAttraction(attraction);
    setFormData({
      name: attraction.name,
      description: attraction.description,
      image: attraction.image,
      category: attraction.category,
      min_height: attraction.min_height,
      age_restriction: attraction.age_restriction
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta atração?')) return;

    try {
      await axios.delete(`${API}/admin/attractions/${id}`);
      toast({ title: 'Sucesso', description: 'Atração removida!' });
      fetchAttractions();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao remover atração', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingAttraction(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      category: 'Família',
      min_height: '',
      age_restriction: ''
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>Gerenciar Atrações</h2>
          <p className="text-gray-600">Adicione, edite ou remova atrações do parque</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button 
              className="text-white font-semibold"
              style={{ background: 'linear-gradient(135deg, #f2ad28 0%, #e69500 100%)' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Atração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAttraction ? 'Editar' : 'Nova'} Atração</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome da Atração *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Descrição *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label>Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Radical">Radical</SelectItem>
                    <SelectItem value="Família">Família</SelectItem>
                    <SelectItem value="Infantil">Infantil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Altura Mínima</Label>
                  <Input
                    value={formData.min_height}
                    onChange={(e) => setFormData({ ...formData, min_height: e.target.value })}
                    placeholder="1.40m"
                  />
                </div>
                <div>
                  <Label>Restrição de Idade</Label>
                  <Input
                    value={formData.age_restriction}
                    onChange={(e) => setFormData({ ...formData, age_restriction: e.target.value })}
                    placeholder="Acima de 12 anos"
                  />
                </div>
              </div>

              <div>
                <Label>Imagem *</Label>
                <div className="space-y-2">
                  {formData.image && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="flex-1"
                    />
                    <Button type="button" disabled={uploading} variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Enviando...' : 'Upload'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Ou cole uma URL de imagem:</p>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 text-white" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                  {editingAttraction ? 'Atualizar' : 'Criar'} Atração
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Attractions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attractions.map((attraction) => (
          <Card key={attraction._id} className="hover:shadow-lg transition-shadow">
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img 
                src={attraction.image} 
                alt={attraction.name}
                className="w-full h-full object-cover"
              />
              <Badge 
                className="absolute top-3 right-3" 
                style={{ backgroundColor: attraction.category === 'Radical' ? '#f2ad28' : attraction.category === 'Infantil' ? '#46bfec' : '#2389a3' }}
              >
                {attraction.category}
              </Badge>
            </div>
            <CardContent className="pt-4">
              <h3 className="font-bold text-lg mb-2" style={{ color: '#2389a3' }}>{attraction.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{attraction.description}</p>
              <div className="space-y-1 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Altura:</span>
                  <span className="font-semibold">{attraction.min_height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Idade:</span>
                  <span className="font-semibold">{attraction.age_restriction}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleEdit(attraction)}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  onClick={() => handleDelete(attraction._id)}
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {attractions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Nenhuma atração cadastrada</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Atração
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}