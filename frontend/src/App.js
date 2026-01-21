import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Attractions from './pages/Attractions';
import Tickets from './pages/Tickets';
import Contact from './pages/Contact';
import CustomerRegister from './pages/CustomerRegister';
import CustomerLogin from './pages/CustomerLogin';
import CustomerAccount from './pages/CustomerAccount';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AttractionsManager from './pages/admin/AttractionsManager';
import TicketsManager from './pages/admin/TicketsManager';
import ParkInfoManager from './pages/admin/ParkInfoManager';
import TestimonialsManager from './pages/admin/TestimonialsManager';
import FAQsManager from './pages/admin/FAQsManager';
import MercadoPagoConfig from './pages/admin/MercadoPagoConfig';
import ProtectedRoute from './pages/admin/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <>
              <Header />
              <main className="min-h-screen">
                <Home />
              </main>
              <Footer />
              <Toaster />
            </>
          } />
          <Route path="/atracoes" element={
            <>
              <Header />
              <main className="min-h-screen">
                <Attractions />
              </main>
              <Footer />
              <Toaster />
            </>
          } />
          <Route path="/ingressos" element={
            <>
              <Header />
              <main className="min-h-screen">
                <Tickets />
              </main>
              <Footer />
              <Toaster />
            </>
          } />
          <Route path="/contato" element={
            <>
              <Header />
              <main className="min-h-screen">
                <Contact />
              </main>
              <Footer />
              <Toaster />
            </>
          } />

          {/* Customer Routes */}
          <Route path="/cadastro" element={<CustomerRegister />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/minha-conta" element={<CustomerAccount />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="attractions" element={<AttractionsManager />} />
            <Route path="tickets" element={<TicketsManager />} />
            <Route path="park-info" element={<ParkInfoManager />} />
            <Route path="testimonials" element={<TestimonialsManager />} />
            <Route path="faqs" element={<FAQsManager />} />
            <Route path="mercadopago" element={<MercadoPagoConfig />} />
            <Route path="orders" element={<div className="text-center py-12">Página de pedidos - Visualização apenas</div>} />
            <Route path="contacts" element={<div className="text-center py-12">Página de mensagens - Visualização apenas</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;