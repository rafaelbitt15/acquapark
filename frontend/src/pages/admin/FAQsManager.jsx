import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FAQsManager() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await axios.get(`${API}/faqs`);
      setFaqs(response.data);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar FAQs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingFaq) {
        await axios.put(`${API}/admin/faqs/${editingFaq._id}`, formData);
        toast({ title: 'Sucesso', description: 'FAQ atualizada!' });
      } else {
        await axios.post(`${API}/admin/faqs`, formData);
        toast({ title: 'Sucesso', description: 'FAQ criada!' });
      }
      setDialogOpen(false);
      resetForm();
      fetchFaqs();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar FAQ', variant: 'destructive' });
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order: faq.order || 0
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta FAQ?')) return;

    try {
      await axios.delete(`${API}/admin/faqs/${id}`);
      toast({ title: 'Sucesso', description: 'FAQ removida!' });
      fetchFaqs();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao remover FAQ', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      order: 0
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2389a3' }}>Perguntas Frequentes (FAQs)</h2>
          <p className="text-gray-600">Gerencie as perguntas mais comuns dos visitantes</p>
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
              Nova FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'Editar' : 'Nova'} FAQ</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Pergunta *</Label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Qual a pergunta?"
                  required
                />
              </div>

              <div>
                <Label>Resposta *</Label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={4}
                  placeholder="Qual a resposta?"
                  required
                />
              </div>

              <div>
                <Label>Ordem (opcional)</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Menor número aparece primeiro</p>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 text-white" style={{ background: 'linear-gradient(135deg, #46bfec 0%, #2389a3 100%)' }}>
                  {editingFaq ? 'Atualizar' : 'Criar'} FAQ
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={faq._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <h3 className="font-semibold text-lg" style={{ color: '#2389a3' }}>
                      {faq.question}
                    </h3>
                  </div>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleEdit(faq)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(faq._id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {faqs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Nenhuma FAQ cadastrada</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira FAQ
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}