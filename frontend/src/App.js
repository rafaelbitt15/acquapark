import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Attractions from './pages/Attractions';
import Tickets from './pages/Tickets';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AttractionsManager from './pages/admin/AttractionsManager';
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

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="attractions" element={<AttractionsManager />} />
            <Route path="tickets" element={<div className="text-center py-12">Página em desenvolvimento...</div>} />
            <Route path="park-info" element={<div className="text-center py-12">Página em desenvolvimento...</div>} />
            <Route path="testimonials" element={<div className="text-center py-12">Página em desenvolvimento...</div>} />
            <Route path="faqs" element={<div className="text-center py-12">Página em desenvolvimento...</div>} />
            <Route path="orders" element={<div className="text-center py-12">Página em desenvolvimento...</div>} />
            <Route path="contacts" element={<div className="text-center py-12">Página em desenvolvimento...</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;