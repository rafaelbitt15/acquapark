import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { 
  Image, Plus, Trash2, Edit2, GripVertical, Upload, Eye, EyeOff,
  ChevronUp, ChevronDown, Loader2
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../stores/authStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HeroSlidesManager() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAuth();
  const fileInputRef = useRef(null);
  
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    subtitle: '',
    button_text: 'Comprar Ingressos',
    button_link: '/ingressos',
    is_active: true
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await axios.get(`${API}/admin/hero-slides`, {
        headers: getAuthHeaders()
      });
      setSlides(response.data);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar slides', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erro', description: 'Por favor, selecione uma imagem', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Erro', description: 'A imagem deve ter no máximo 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await axios.post(`${API}/admin/upload-image`, formDataUpload, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData({ ...formData, image_url: response.data.url });
      toast({ title: 'Sucesso', description: 'Imagem enviada com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao enviar imagem', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image_url) {
      toast({ title: 'Erro', description: 'Por favor, adicione uma imagem', variant: 'destructive' });
      return;
    }

    try {
      if (editingSlide) {
        await axios.put(`${API}/admin/hero-slides/${editingSlide._id}`, formData, {
          headers: getAuthHeaders()
        });
        toast({ title: 'Sucesso', description: 'Slide atualizado!' });
      } else {
        await axios.post(`${API}/admin/hero-slides`, formData, {
          headers: getAuthHeaders()
        });
        toast({ title: 'Sucesso', description: 'Slide criado!' });
      }
      setDialogOpen(false);
      resetForm();
      fetchSlides();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar slide', variant: 'destructive' });
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      image_url: slide.image_url,
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      button_text: slide.button_text || 'Comprar Ingressos',
      button_link: slide.button_link || '/ingressos',
      is_active: slide.is_active
    });
    setDialogOpen(true);
  };

  const handleDelete = async (slideId) => {
    if (!window.confirm('Tem certeza que deseja remover este slide?')) return;

    try {
      await axios.delete(`${API}/admin/hero-slides/${slideId}`, {
        headers: getAuthHeaders()
      });
      toast({ title: 'Sucesso', description: 'Slide removido!' });
      fetchSlides();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao remover slide', variant: 'destructive' });
    }
  };

  const toggleActive = async (slide) => {
    try {
      await axios.put(`${API}/admin/hero-slides/${slide._id}`, {
        is_active: !slide.is_active
      }, { headers: getAuthHeaders() });
      fetchSlides();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao atualizar slide', variant: 'destructive' });
    }
  };

  const moveSlide = async (slideId, direction) => {
    const index = slides.findIndex(s => s._id === slideId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    // Swap positions
    const newSlides = [...slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    
    // Update positions
    const positions = newSlides.map((slide, idx) => ({
      id: slide._id,
      position: idx
    }));

    try {
      await axios.put(`${API}/admin/hero-slides/reorder`, { positions }, {
        headers: getAuthHeaders()
      });
      fetchSlides();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao reordenar slides', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingSlide(null);
    setFormData({
      image_url: '',
      title: '',
      subtitle: '',
      button_text: 'Comprar Ingressos',
      button_link: '/ingressos',
      is_active: true
    });
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6" data-testid="hero-slides-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>Banner Principal</h2>
          <p className="text-gray-600">Gerencie as imagens do carrossel na página inicial</p>
        </div>
        <Button 
          onClick={openNewDialog}
          className="text-white"
          style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
          data-testid="add-slide-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Slide
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start space-x-3">
            <Image className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Sobre o Banner</p>
              <p className="text-sm text-blue-700">
                Adicione imagens que serão exibidas como um carrossel na página inicial. 
                Recomendamos imagens de pelo menos 1920x600 pixels para melhor qualidade.
                Use os botões de seta para reordenar os slides.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {slides.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Nenhum slide configurado</p>
            <Button 
              onClick={openNewDialog}
              style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
              className="text-white"
            >
              Adicionar Primeiro Slide
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <Card 
              key={slide._id} 
              className={`overflow-hidden ${!slide.is_active ? 'opacity-60' : ''}`}
              data-testid={`slide-card-${slide._id}`}
            >
              <div className="flex">
                {/* Image Preview */}
                <div className="w-64 h-40 flex-shrink-0 relative">
                  <img
                    src={getImageUrl(slide.image_url)}
                    alt={slide.title || 'Slide'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/256x160?text=Imagem';
                    }}
                  />
                  {!slide.is_active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Inativo</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: '#2389a3' }}>
                        {slide.title || `Slide ${index + 1}`}
                      </h3>
                      {slide.subtitle && (
                        <p className="text-gray-600 text-sm mt-1">{slide.subtitle}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Botão: {slide.button_text}</span>
                        <span>Link: {slide.button_link}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {/* Reorder buttons */}
                      <div className="flex flex-col">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveSlide(slide._id, 'up')}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveSlide(slide._id, 'down')}
                          disabled={index === slides.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Toggle active */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActive(slide)}
                        title={slide.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {slide.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>

                      {/* Edit */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(slide)}
                        data-testid={`edit-slide-${slide._id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(slide._id)}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`delete-slide-${slide._id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSlide ? 'Editar Slide' : 'Novo Slide'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <Label>Imagem do Banner *</Label>
              <div className="mt-2">
                {formData.image_url ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(formData.image_url)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2"
                    >
                      Trocar Imagem
                    </Button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-500 transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    )}
                    <p className="text-gray-500">
                      {uploading ? 'Enviando...' : 'Clique para enviar uma imagem'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="hidden"
                  data-testid="slide-image-input"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Ou cole uma URL de imagem:</p>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
                className="mt-1"
                data-testid="slide-url-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Título (opcional)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Verão 2026"
                  data-testid="slide-title-input"
                />
              </div>
              <div>
                <Label>Subtítulo (opcional)</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Ex: Diversão para toda família"
                  data-testid="slide-subtitle-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Texto do Botão</Label>
                <Input
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="Comprar Ingressos"
                  data-testid="slide-button-text-input"
                />
              </div>
              <div>
                <Label>Link do Botão</Label>
                <Input
                  value={formData.button_link}
                  onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                  placeholder="/ingressos"
                  data-testid="slide-button-link-input"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                data-testid="slide-active-switch"
              />
              <Label>Slide ativo</Label>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1 text-white"
                style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}
                data-testid="save-slide-btn"
              >
                {editingSlide ? 'Atualizar' : 'Criar Slide'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
