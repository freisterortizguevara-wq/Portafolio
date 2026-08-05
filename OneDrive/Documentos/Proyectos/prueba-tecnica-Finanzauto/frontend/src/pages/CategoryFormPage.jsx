import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../services/category.service';
import { toast } from 'react-toastify';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Save, Cancel, Category, Description, ArrowBack } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const GradientPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06)',
  border: '1px solid #eef1f5',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #1a2b4c, #2c3e6b)',
  },
}));

const GlassInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.25s ease',
    '&:hover': { backgroundColor: '#ffffff' },
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
    '&.Mui-focused': { color: '#1a2b4c' },
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  padding: '11px 36px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '14px',
  background: 'linear-gradient(135deg, #1a2b4c, #2c3e6b)',
  color: 'white',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(26, 43, 76, 0.15)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(26, 43, 76, 0.25)',
  },
  '&:disabled': { background: '#c0c7d2', boxShadow: 'none' },
}));

const OutlineButton = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  padding: '11px 36px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '14px',
  borderColor: '#d0d7e2',
  color: '#5a6a7e',
  transition: 'all 0.25s ease',
  '&:hover': {
    borderColor: '#1a2b4c',
    color: '#1a2b4c',
    backgroundColor: 'rgba(26, 43, 76, 0.02)',
  },
}));

const CategoryFormPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await categoryService.createCategory(formData);
      setSuccess('✅ Categoría creada exitosamente');
      toast.success('🎉 Categoría creada');
      setTimeout(() => navigate('/products/create'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear categoría';
      setError(msg);
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <GradientPaper elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button onClick={() => navigate(-1)} startIcon={<ArrowBack />} sx={{ textTransform: 'none', color: '#5a6a7e' }}>
            Volver
          </Button>
          <Typography variant="h5" fontWeight={700} color="#1a2b4c">
            📂 Nueva Categoría
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <GlassInput
                fullWidth
                label="Nombre de la categoría *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: SERVIDORES, CLOUD, SOFTWARE"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Category sx={{ color: '#8a9aa8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <GlassInput
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Descripción de la categoría..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description sx={{ color: '#8a9aa8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <GlassInput
                fullWidth
                label="URL de imagen (opcional)"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://ejemplo.com/categoria.jpg"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <OutlineButton onClick={() => navigate('/products/create')} startIcon={<Cancel />}>
              Cancelar
            </OutlineButton>
            <PrimaryButton type="submit" startIcon={<Save />} disabled={loading}>
              {loading ? 'Creando...' : 'Crear Categoría'}
            </PrimaryButton>
          </Box>
        </form>
      </GradientPaper>
    </Container>
  );
};

export default CategoryFormPage;