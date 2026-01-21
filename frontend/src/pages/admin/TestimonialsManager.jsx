import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Star, MessageSquare } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TestimonialsManager() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: '',
    date: new Date().toLocaleDateString('pt-BR')
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get(`${API}/testimonials`);
      setTestimonials(response.data);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar depoimentos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTestimonial) {
        await axios.put(`${API}/admin/testimonials/${editingTestimonial._id}`, formData);
        toast({ title: 'Sucesso', description: 'Depoimento atualizado!' });
      } else {
        await axios.post(`${API}/admin/testimonials`, formData);
        toast({ title: 'Sucesso', description: 'Depoimento criado!' });
      }
      setDialogOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar depoimento', variant: 'destructive' });
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      rating: testimonial.rating,
      comment: testimonial.comment,
      date: testimonial.date
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este depoimento?')) return;

    try {
      await axios.delete(`${API}/admin/testimonials/${id}`);
      toast({ title: 'Sucesso', description: 'Depoimento removido!' });
      fetchTestimonials();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao remover depoimento', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingTestimonial(null);
    setFormData({
      name: '',
      rating: 5,
      comment: '',
      date: new Date().toLocaleDateString('pt-BR')
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>Depoimentos</h2>
          <p className="text-gray-600">Gerencie os depoimentos dos visitantes</p>
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
              Novo Depoimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? 'Editar' : 'Novo'} Depoimento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome do Cliente *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Avaliação *</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`h-8 w-8 ${
                          rating <= formData.rating ? 'fill-current text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Comentário *</Label>
                <Textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Data</Label>
                <Input
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="15/01/2025"
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 text-white" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                  {editingTestimonial ? 'Atualizar' : 'Criar'} Depoimento
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="font-semibold">{testimonial.name}</span>
                <span className="text-gray-500">{testimonial.date}</span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleEdit(testimonial)}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  onClick={() => handleDelete(testimonial._id)}
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

      {testimonials.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Nenhum depoimento cadastrado</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Depoimento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}