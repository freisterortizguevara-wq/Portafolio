import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import Navbar from './components/common/Navbar';
import { Container, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import CategoryFormPage from './pages/CategoryFormPage';

// Componente para alternar tema
const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1a2b4c' },
      secondary: { main: '#dc3545' },
      background: {
        default: darkMode ? '#121212' : '#f0f2f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  return {
    theme,
    darkMode,
    toggleTheme: () => setDarkMode(!darkMode),
  };
};

function App() {
  const { theme, darkMode, toggleTheme } = ThemeToggle();

  const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar toggleTheme={toggleTheme} darkMode={darkMode} />
          <Container sx={{ mt: 4 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={
                <PrivateRoute>
                  <ProductsPage />
                </PrivateRoute>
              } />
              <Route path="/products/create" element={
                <PrivateRoute>
                  <ProductFormPage />
                </PrivateRoute>
              } />
              <Route path="/products/edit/:id" element={
                <PrivateRoute>
                  <ProductFormPage />
                </PrivateRoute>
              } />
              <Route path="/" element={<Navigate to="/products" />} />
              <Route
             path="/categories/create"
                        element={
              <PrivateRoute>
               <CategoryFormPage />
               </PrivateRoute>
  }
/>
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;