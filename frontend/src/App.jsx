import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext'; import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Blog from './pages/Blog';
import ArticleDetails from './pages/ArticleDetails';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';

// Dashboard pages
import AddProperty from './pages/dashboard/AddProperty';
import MyProperties from './pages/dashboard/MyProperties';
import Profile from './pages/dashboard/Profile';
import Inquiries from './pages/dashboard/Inquiries';
import Articles from './pages/dashboard/Articles';
import ArticleForm from './pages/dashboard/ArticleForm';
import EditProperty from './pages/dashboard/EditProperty';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:slug" element={<PropertyDetails />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<ArticleDetails />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Admin Dashboard Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/add-property" element={<AddProperty />} />
              <Route path="/dashboard/properties" element={<MyProperties />} />
              <Route path="/dashboard/properties/:slug/edit" element={<EditProperty />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/inquiries" element={<Inquiries />} />
              <Route path="/dashboard/articles" element={<Articles />} />
              <Route path="/dashboard/articles/new" element={<ArticleForm />} />
              <Route path="/dashboard/articles/:slug/edit" element={<ArticleForm />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;