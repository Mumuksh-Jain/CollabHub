import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ParticleBackground from './components/ParticleBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateProject from './pages/CreateProject';
import MyProjects from './pages/MyProjects';
import Profile from './pages/Profile';
import ProjectDetail from './pages/ProjectDetail';
import UserProfile from './pages/UserProfile';
import FAQ from './pages/FAQ';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <CustomCursor />
          <ParticleBackground />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/user/:id" element={<UserProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-project" element={
                <ProtectedRoute><CreateProject /></ProtectedRoute>
              } />
              <Route path="/my-projects" element={
                <ProtectedRoute><MyProjects /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              <Route path="/faq" element={<FAQ />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
