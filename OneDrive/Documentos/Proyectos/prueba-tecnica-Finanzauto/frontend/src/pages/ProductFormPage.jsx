import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Skeleton,
  Chip,
  InputAdornment,
  Avatar,
  Fade,
  Zoom,
  Card,
  CardContent,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Dialog,
  DialogContent,
  DialogActions,
  Backdrop,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Delete,
  Cancel,
  Category,
  AttachMoney,
  Inventory,
  Code,
  Image,
  Description,
  ShoppingBag,
  CheckCircle,
  Error,
  Edit as EditIcon,
  PhotoCamera,
  AddCircle,
  ExpandMore,
  ExpandLess,
  Close,
  Star,
  Rocket,
  Celebration,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// ============================================================
// ANIMACIONES PREMIUM
// ============================================================

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const popIn = keyframes`
  0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.05) rotate(2deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

const confettiFall = keyframes`
  0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(26,43,76,0.05); }
  50% { box-shadow: 0 0 60px rgba(26,43,76,0.15); }
`;

const floatBg = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 30px) scale(0.95); }
`;

// ============================================================
// ESTILOS ULTRA PREMIUM
// ============================================================

const BackgroundBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(4),
  background: 'linear-gradient(145deg, #f0f2f5 0%, #e6e9ef 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-15%',
    left: '-5%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(26,43,76,0.02) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: `${floatBg} 20s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-15%',
    right: '-5%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(44,62,107,0.02) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: `${floatBg} 25s ease-in-out infinite reverse`,
  },
}));

const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: '28px',
  background: 'rgba(255, 255, 255, 0.75)',
  backdropFilter: 'blur(30px)',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.04), 0 10px 30px rgba(0, 0, 0, 0.02)',
  overflow: 'hidden',
  animation: `${fadeInUp} 0.6s ease-out`,
}));

const GlassHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3.5),
  paddingBottom: theme.spacing(2.5),
  background: 'linear-gradient(145deg, rgba(26,43,76,0.02), rgba(44,62,107,0.02))',
  borderBottom: '1px solid rgba(255,255,255,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const PremiumInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    backgroundColor: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderColor: 'rgba(26,43,76,0.15)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#1a2b4c',
      boxShadow: '0 0 0 4px rgba(26,43,76,0.06), 0 8px 25px rgba(0,0,0,0.04)',
      transform: 'translateY(-2px)',
    },
    '&.Mui-error': {
      borderColor: '#dc3545',
      boxShadow: '0 0 0 4px rgba(220,53,69,0.06)',
    },
    '& fieldset': { border: 'none' },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    color: '#5a6a7e',
    '&.Mui-focused': { color: '#1a2b4c', fontWeight: 700 },
    '&.Mui-error': { color: '#dc3545' },
  },
}));

const PremiumSelect = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    backgroundColor: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderColor: 'rgba(26,43,76,0.15)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#1a2b4c',
      boxShadow: '0 0 0 4px rgba(26,43,76,0.06)',
    },
    '& fieldset': { border: 'none' },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    color: '#5a6a7e',
    '&.Mui-focused': { color: '#1a2b4c', fontWeight: 700 },
  },
}));

const GlowButton = styled(Button)(({ theme }) => ({
  borderRadius: '14px',
  padding: '14px 48px',
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '16px',
  background: 'linear-gradient(135deg, #1a2b4c, #2c3e6b)',
  color: 'white',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 30px rgba(26, 43, 76, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: '0 8px 45px rgba(26, 43, 76, 0.35)',
  },
  '&:active': { transform: 'scale(0.97)' },
  '&:disabled': { background: 'linear-gradient(135deg, #c0c7d2, #a0a7b2)', boxShadow: 'none' },
}));

const StyledSectionCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
  backgroundColor: 'rgba(255,255,255,0.4)',
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  mb: 2,
  transition: 'all 0.3s ease',
  '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.04)' },
}));

// ============================================================
// POPUP DE ÉXITO ELEGANTE
// ============================================================

const SuccessDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '28px',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 40px 100px rgba(0,0,0,0.12)',
    maxWidth: '480px',
    width: '100%',
    padding: theme.spacing(4),
    animation: `${popIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #1a2b4c, #2c3e6b, #1a2b4c)',
      backgroundSize: '200% auto',
    },
  },
}));

const SuccessIconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const SuccessCheck = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #1a2b4c, #2c3e6b)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 40px rgba(26,43,76,0.25)',
  animation: `${glowPulse} 2s ease-in-out infinite`,
  '& .MuiSvgIcon-root': { fontSize: 44, color: 'white' },
}));

const ConfettiPiece = styled(Box)(({ color, delay, left }) => ({
  position: 'absolute',
  width: '8px',
  height: '8px',
  borderRadius: '2px',
  backgroundColor: color,
  top: '-20px',
  left: left || '50%',
  animation: `${confettiFall} ${2 + Math.random() * 2}s ease-in forwards`,
  animationDelay: `${delay || 0}s`,
  transform: `rotate(${Math.random() * 360}deg)`,
  opacity: 0.8,
}));

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    sku: '',
    imageUrl: '',
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    price: false,
    category: false,
    image: false,
  });

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [productName, setProductName] = useState('');

  const calculateProgress = () => {
    let completed = 0;
    const total = 4;
    if (formData.name) completed++;
    if (formData.price && formData.stock) completed++;
    if (formData.categoryId) completed++;
    if (formData.imageUrl) completed++;
    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    loadCategories();
    if (isEdit) loadProduct();
  }, [id]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      setCategoriesError('');
      const data = await categoryService.getAllCategories();
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setCategories(list);
      if (list.length === 0) {
        setCategoriesError('No hay categorías disponibles. Crea una categoría primero.');
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setCategoriesError('No se pudieron cargar las categorías');
      toast.error('❌ Error al cargar categorías');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await productService.getProductById(id);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? '',
        stock: product.stock ?? '',
        categoryId: product.categoryId != null ? String(product.categoryId) : '',
        sku: product.sku || '',
        imageUrl: product.imageUrl || '',
      });
    } catch (err) {
      setError('Error al cargar el producto');
      toast.error('❌ Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'El precio debe ser mayor a 0';
    if (!formData.stock || parseInt(formData.stock) < 0) errors.stock = 'El stock no puede ser negativo';
    if (!formData.categoryId) errors.categoryId = 'La categoría es requerida';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      toast.warning('⚠️ Por favor corrige los errores del formulario');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        categoryId: parseInt(formData.categoryId, 10),
      };

      if (isEdit) {
        await productService.updateProduct(id, productData);
        setSuccessMessage('✅ Producto actualizado exitosamente');
        setProductName(formData.name);
        setSuccessDialogOpen(true);
        toast.success('✅ Producto actualizado exitosamente');
        setTimeout(() => navigate('/products'), 2000);
      } else {
        await productService.createProduct(productData);
        setSuccessMessage('🎉 Producto creado exitosamente');
        setProductName(formData.name);
        setSuccessDialogOpen(true);
        toast.success('🎉 Producto creado exitosamente');
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          categoryId: '',
          sku: '',
          imageUrl: '',
        });
        setFormErrors({});
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar el producto';
      setError(msg);
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar "${formData.name}"?`)) return;

    try {
      setSaving(true);
      await productService.deleteProduct(id);
      setSuccessMessage('🗑️ Producto eliminado exitosamente');
      setProductName(formData.name);
      setSuccessDialogOpen(true);
      toast.success('🗑️ Producto eliminado exitosamente');
      setTimeout(() => navigate('/products'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar el producto';
      setError(msg);
      toast.error(`❌ ${msg}`);
      setSaving(false);
    }
  };

  const handleDialogClose = () => {
    setSuccessDialogOpen(false);
    if (!isEdit) {
      navigate('/products');
    }
  };

  if (loading) {
    return (
      <BackgroundBox>
        <Container maxWidth="lg">
          <GlassCard>
            <CardContent sx={{ p: 4 }}>
              <Skeleton variant="text" width="40%" height={40} />
              <Skeleton variant="text" width="20%" height={24} sx={{ mb: 3 }} />
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Skeleton variant="rectangular" width={120} height={48} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" width={160} height={48} sx={{ borderRadius: 2 }} />
              </Box>
            </CardContent>
          </GlassCard>
        </Container>
      </BackgroundBox>
    );
  }

  return (
    <BackgroundBox>
      <Container maxWidth="lg">
        <Fade in timeout={500}>
          <GlassCard>
            {/* HEADER */}
            <GlassHeader>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Avatar sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  background: 'linear-gradient(145deg, #1a2b4c, #2c3e6b)',
                  boxShadow: '0 8px 25px rgba(26,43,76,0.15)',
                }}>
                  {isEdit ? <EditIcon sx={{ color: 'white', fontSize: 28 }} /> : <ShoppingBag sx={{ color: 'white', fontSize: 28 }} />}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="#1a2b4c" letterSpacing="-0.5px">
                    {isEdit ? '✏️ Editar Producto' : '✨ Nuevo Producto'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                    <Typography variant="body2" color="#6b7a8f">
                      {isEdit ? 'Modifica los datos del producto' : 'Completa los datos del nuevo producto'}
                    </Typography>
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: 14 }} />}
                      label={`${progress}% completado`}
                      size="small"
                      sx={{
                        backgroundColor: progress === 100 ? '#e8f5e9' : 'rgba(26,43,76,0.04)',
                        color: progress === 100 ? '#2e7d32' : '#5a6a7e',
                        fontWeight: 700,
                        borderRadius: '8px',
                        height: 24,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                {isEdit && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDelete}
                    disabled={saving}
                    size="medium"
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: 'rgba(220,53,69,0.2)',
                      '&:hover': {
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220,53,69,0.04)',
                      },
                    }}
                  >
                    Eliminar
                  </Button>
                )}
              </Box>
            </GlassHeader>

            {/* BARRA DE PROGRESO */}
            <Box sx={{ px: 3.5, pt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 4,
                  backgroundColor: 'rgba(26,43,76,0.06)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #1a2b4c, #2c3e6b)',
                    transition: 'width 0.6s ease',
                  },
                }}
              />
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mx: 3, mt: 2, borderRadius: '12px' }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {/* FORMULARIO */}
            <Box sx={{ p: 3.5, pt: 2 }}>
              {/* SECCIÓN 1 */}
              <StyledSectionCard>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    pl: 3,
                    pr: 2,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(26,43,76,0.02)' },
                  }}
                  onClick={() => toggleSection('basic')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '10px',
                      bgcolor: expandedSections.basic ? '#1a2b4c' : 'rgba(26,43,76,0.06)',
                      color: expandedSections.basic ? 'white' : '#1a2b4c',
                    }}>
                      <Description sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="#1a2b4c">
                        Información Básica
                      </Typography>
                      <Typography variant="caption" color="#6b7a8f">
                        {formData.name ? '✅ Completado' : 'Nombre y descripción del producto'}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small">
                    {expandedSections.basic ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                <Collapse in={expandedSections.basic}>
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <PremiumInput
                          fullWidth
                          label="Nombre del producto *"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          error={!!formErrors.name}
                          helperText={formErrors.name}
                          placeholder="Ej: Servidor Dell PowerEdge"
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><ShoppingBag sx={{ color: '#8a9aa8' }} /></InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <PremiumInput
                          fullWidth
                          label="Descripción"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          multiline
                          rows={2}
                          placeholder="Describe las características del producto..."
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><Description sx={{ color: '#8a9aa8' }} /></InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </StyledSectionCard>

              {/* SECCIÓN 2 */}
              <StyledSectionCard>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    pl: 3,
                    pr: 2,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(26,43,76,0.02)' },
                  }}
                  onClick={() => toggleSection('price')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '10px',
                      bgcolor: expandedSections.price ? '#1a2b4c' : 'rgba(26,43,76,0.06)',
                      color: expandedSections.price ? 'white' : '#1a2b4c',
                    }}>
                      <AttachMoney sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="#1a2b4c">
                        Precio y Stock
                      </Typography>
                      <Typography variant="caption" color="#6b7a8f">
                        {formData.price && formData.stock ? '✅ Completado' : 'Define el valor y disponibilidad'}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small">
                    {expandedSections.price ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                <Collapse in={expandedSections.price}>
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <PremiumInput
                          fullWidth
                          label="Precio *"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          error={!!formErrors.price}
                          helperText={formErrors.price}
                          placeholder="0.00"
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><AttachMoney sx={{ color: '#8a9aa8' }} /></InputAdornment>,
                            inputProps: { min: 0, step: 0.01 },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <PremiumInput
                          fullWidth
                          label="Stock *"
                          name="stock"
                          type="number"
                          value={formData.stock}
                          onChange={handleChange}
                          required
                          error={!!formErrors.stock}
                          helperText={formErrors.stock}
                          placeholder="0"
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><Inventory sx={{ color: '#8a9aa8' }} /></InputAdornment>,
                            inputProps: { min: 0 },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </StyledSectionCard>

              {/* SECCIÓN 3 */}
              <StyledSectionCard>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    pl: 3,
                    pr: 2,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(26,43,76,0.02)' },
                  }}
                  onClick={() => toggleSection('category')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '10px',
                      bgcolor: expandedSections.category ? '#1a2b4c' : 'rgba(26,43,76,0.06)',
                      color: expandedSections.category ? 'white' : '#1a2b4c',
                    }}>
                      <Category sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="#1a2b4c">
                        Categoría y SKU
                      </Typography>
                      <Typography variant="caption" color="#6b7a8f">
                        {formData.categoryId ? '✅ Completado' : 'Clasifica tu producto'}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small">
                    {expandedSections.category ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                <Collapse in={expandedSections.category}>
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={!!formErrors.categoryId || !!categoriesError}>
                          <InputLabel id="category-label">Categoría *</InputLabel>
                          <Select
                            labelId="category-label"
                            label="Categoría"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            startAdornment={<Category sx={{ ml: 1.5, mr: 1, color: '#8a9aa8' }} />}
                            disabled={loadingCategories || categories.length === 0}
                            endAdornment={
                              <Button
                                size="small"
                                onClick={() => navigate('/categories/create')}
                                startIcon={<AddCircle sx={{ fontSize: 14 }} />}
                                sx={{
                                  mr: 1,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  color: '#1a2b4c',
                                  borderRadius: '8px',
                                  '&:hover': { backgroundColor: 'rgba(26,43,76,0.04)' },
                                }}
                              >
                                Nueva
                              </Button>
                            }
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '14px',
                                backgroundColor: 'rgba(255,255,255,0.6)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.85)' },
                                '&.Mui-focused': {
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                  boxShadow: '0 0 0 4px rgba(26,43,76,0.06)',
                                },
                              },
                            }}
                          >
                            {loadingCategories ? (
                              <MenuItem disabled>Cargando categorías...</MenuItem>
                            ) : categories.length === 0 ? (
                              <MenuItem disabled>No hay categorías disponibles</MenuItem>
                            ) : (
                              categories.map((category) => (
                                <MenuItem key={category.id} value={String(category.id)}>
                                  {category.name}
                                </MenuItem>
                              ))
                            )}
                          </Select>
                          {formErrors.categoryId && (
                            <FormHelperText sx={{ color: '#dc3545' }}>{formErrors.categoryId}</FormHelperText>
                          )}
                          {categoriesError && (
                            <FormHelperText sx={{ color: '#dc3545' }}>{categoriesError}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <PremiumInput
                          fullWidth
                          label="SKU (código único)"
                          name="sku"
                          value={formData.sku}
                          onChange={handleChange}
                          placeholder="SKU-001"
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><Code sx={{ color: '#8a9aa8' }} /></InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </StyledSectionCard>

              {/* SECCIÓN 4 */}
              <StyledSectionCard>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    pl: 3,
                    pr: 2,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(26,43,76,0.02)' },
                  }}
                  onClick={() => toggleSection('image')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '10px',
                      bgcolor: expandedSections.image ? '#1a2b4c' : 'rgba(26,43,76,0.06)',
                      color: expandedSections.image ? 'white' : '#1a2b4c',
                    }}>
                      <Image sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="#1a2b4c">
                        Imagen del Producto
                      </Typography>
                      <Typography variant="caption" color="#6b7a8f">
                        {formData.imageUrl ? '✅ Imagen cargada' : 'Agrega una imagen (opcional)'}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small">
                    {expandedSections.image ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                <Collapse in={expandedSections.image}>
                  <Box sx={{ p: 3, pt: 0 }}>
                    <PremiumInput
                      fullWidth
                      label="URL de la imagen"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Image sx={{ color: '#8a9aa8' }} /></InputAdornment>,
                      }}
                    />
                    {formData.imageUrl && (
                      <Box
                        sx={{
                          mt: 2,
                          borderRadius: '14px',
                          overflow: 'hidden',
                          border: '2px solid rgba(255,255,255,0.3)',
                          background: 'rgba(255,255,255,0.4)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Box
                          component="img"
                          src={formData.imageUrl}
                          alt="Vista previa"
                          sx={{
                            width: '100%',
                            maxHeight: 200,
                            objectFit: 'contain',
                            p: 2,
                          }}
                          onError={(e) => {
                            e.target.src = '';
                            e.target.alt = 'Error al cargar la imagen';
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </StyledSectionCard>
            </Box>

            {/* BOTONES */}
            <Divider sx={{ mx: 3.5 }} />

            <Box sx={{ p: 3.5, display: 'flex', gap: 2.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/products')}
                startIcon={<Cancel />}
                disabled={saving}
                sx={{
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  px: 4,
                  py: 1.5,
                  borderColor: 'rgba(0,0,0,0.08)',
                  color: '#5a6a7e',
                  '&:hover': {
                    borderColor: '#1a2b4c',
                    color: '#1a2b4c',
                    backgroundColor: 'rgba(26,43,76,0.02)',
                  },
                }}
              >
                Cancelar
              </Button>
              <GlowButton
                type="submit"
                startIcon={saving ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : <Save />}
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving ? 'Guardando...' : isEdit ? 'Actualizar Producto' : 'Crear Producto'}
              </GlowButton>
            </Box>
          </GlassCard>
        </Fade>
      </Container>

      {/* ============================================================
          POPUP DE ÉXITO ELEGANTE
          ============================================================ */}
      <SuccessDialog
        open={successDialogOpen}
        onClose={handleDialogClose}
        BackdropComponent={Backdrop}
        BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' } }}
      >
        <ConfettiPiece color="#1a2b4c" delay="0" left="10%" />
        <ConfettiPiece color="#2c3e6b" delay="0.3" left="25%" />
        <ConfettiPiece color="#667eea" delay="0.6" left="40%" />
        <ConfettiPiece color="#764ba2" delay="0.2" left="55%" />
        <ConfettiPiece color="#f093fb" delay="0.5" left="70%" />
        <ConfettiPiece color="#f5576c" delay="0.8" left="85%" />
        <ConfettiPiece color="#1a2b4c" delay="0.4" left="15%" />
        <ConfettiPiece color="#2c3e6b" delay="0.7" left="45%" />
        <ConfettiPiece color="#667eea" delay="0.1" left="75%" />

        <SuccessIconContainer>
          <SuccessCheck>
            <CheckCircle />
          </SuccessCheck>
        </SuccessIconContainer>

        <DialogContent sx={{ textAlign: 'center', p: 0 }}>
          <Typography variant="h5" fontWeight={800} color="#1a2b4c" sx={{ mb: 1 }}>
            {isEdit ? '✅ Producto Actualizado' : '🎉 Producto Creado'}
          </Typography>
          <Typography variant="body1" color="#5a6a7e" sx={{ mb: 0.5 }}>
            {isEdit ? 'Los cambios se han guardado correctamente' : 'El producto ha sido guardado exitosamente'}
          </Typography>
          {productName && (
            <Chip
              icon={<Star sx={{ fontSize: 16 }} />}
              label={`"${productName}"`}
              sx={{
                mt: 1,
                backgroundColor: 'rgba(26,43,76,0.06)',
                color: '#1a2b4c',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', p: 2, pt: 3 }}>
          <Button
            variant="contained"
            onClick={handleDialogClose}
            startIcon={<Rocket />}
            sx={{
              borderRadius: '14px',
              padding: '12px 40px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '15px',
              background: 'linear-gradient(135deg, #1a2b4c, #2c3e6b)',
              color: 'white',
              boxShadow: '0 4px 25px rgba(26,43,76,0.2)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 35px rgba(26,43,76,0.3)',
              },
            }}
          >
            Ver Productos
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSuccessDialogOpen(false);
              if (!isEdit) {
                navigate('/products/create');
              }
            }}
            sx={{
              borderRadius: '14px',
              padding: '12px 30px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '15px',
              borderColor: '#d0d7e2',
              color: '#5a6a7e',
              '&:hover': {
                borderColor: '#1a2b4c',
                color: '#1a2b4c',
              },
            }}
          >
            {isEdit ? 'Seguir Editando' : 'Crear Otro'}
          </Button>
        </DialogActions>
      </SuccessDialog>
    </BackgroundBox>
  );
};

export default ProductFormPage;