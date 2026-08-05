import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { LockOutlined, Person, Visibility, VisibilityOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// ============================================================
// ESTILOS CORPORATIVOS
// ============================================================

const CorporatePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
  border: '1px solid #e8ecf1',
}));

const CorporateAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  backgroundColor: '#1a2b4c',
  marginBottom: theme.spacing(2),
}));

const CorporateButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '12px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '15px',
  backgroundColor: '#1a2b4c',
  color: 'white',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#0f1e3a',
  },
  '&:disabled': {
    backgroundColor: '#c0c7d2',
  },
}));

const CorporateInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1a2b4c',
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1a2b4c',
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: '#5a6a7e',
    '&.Mui-focused': {
      color: '#1a2b4c',
    },
  },
}));

const LinkButton = styled(Button)(({ theme }) => ({
  color: '#1a2b4c',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: 'transparent',
    color: '#0f1e3a',
  },
}));

// ============================================================
// COMPONENTE
// ============================================================

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
      }}
    >
      <Container maxWidth="sm">
        <CorporatePaper elevation={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CorporateAvatar>
              <LockOutlined sx={{ fontSize: 32 }} />
            </CorporateAvatar>

            <Typography variant="h5" fontWeight={700} color="#1a2b4c" gutterBottom>
              Finanzauto
            </Typography>
            <Typography variant="body2" color="#6b7a8f" sx={{ mb: 3 }}>
              Ingresa tus credenciales para continuar
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '8px' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <CorporateInput
                fullWidth
                label="Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#8a9aa8' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <CorporateInput
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: '#8a9aa8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff sx={{ color: '#8a9aa8' }} /> : <Visibility sx={{ color: '#8a9aa8' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <CorporateButton
                fullWidth
                type="submit"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </CorporateButton>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="#6b7a8f">
                  ¿No tienes cuenta?{' '}
                  <LinkButton onClick={() => navigate('/register')}>
                    Regístrate ahora
                  </LinkButton>
                </Typography>
              </Box>
            </form>
          </Box>
        </CorporatePaper>
      </Container>
    </Box>
  );
};

export default Login;