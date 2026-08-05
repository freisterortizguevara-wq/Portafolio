import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import {
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  TextField,
  Box,
  Alert,
  Pagination,
  Chip,
  Skeleton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Search,
  Add,
  UploadFile,
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Close,
  FileUpload,
  Description,
  TrendingUp,
  EmojiEvents,
  TableChart,
  FilePresent,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// ============================================================
// ESTILOS
// ============================================================

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  border: '1px solid #e8ecf1',
  overflow: 'hidden',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  borderBottom: '1px solid #e8ecf1',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const UploadZone = styled(Box)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? '#1a2b4c' : '#d0d7e2'}`,
  borderRadius: '16px',
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragActive ? 'rgba(26,43,76,0.04)' : '#fafbfc',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: '#1a2b4c',
    backgroundColor: 'rgba(26,43,76,0.02)',
  },
}));

const FileChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px',
  fontWeight: 600,
  '& .MuiChip-icon': {
    fontSize: 18,
  },
}));

// ============================================================
// DIALOGO DE CARGA MASIVA (100,000 PRODUCTOS)
// ============================================================

const BulkUploadDialog = ({ open, onClose, onUpload }) => {
  const [quantity, setQuantity] = useState(100000);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    console.log('🔴 INICIANDO CARGA MASIVA');
    console.log('📦 Cantidad:', quantity);
    console.log('📂 Categoría:', categoryId);
    
    setLoading(true);
    setProgress(0);
    setStatus('Iniciando carga masiva...');

    try {
      const result = await productService.bulkCreateProducts(quantity, categoryId || undefined);
      console.log('✅ Resultado:', result);
      
      setProgress(100);
      setStatus(`✅ ${result.processedCount} productos creados exitosamente`);
      toast.success(`🎉 ${result.processedCount} productos creados`);
      
      if (onUpload) onUpload();
      
      setTimeout(() => {
        onClose();
        setLoading(false);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error en bulk:', err);
      setStatus(`❌ ${err.response?.data?.message || 'Error al cargar productos'}`);
      toast.error(`❌ ${err.response?.data?.message || 'Error al cargar productos'}`);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#1a2b4c' }}>
        <CloudUpload sx={{ mr: 1, color: '#1a2b4c' }} />
        Carga Masiva de Productos
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="#6b7a8f" sx={{ mb: 3 }}>
          Genera y guarda hasta 100,000 productos aleatorios.
        </Typography>

        <TextField
          fullWidth
          label="Cantidad de productos"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          inputProps={{ min: 1, max: 100000 }}
          helperText="Máximo 100,000 productos"
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="ID de categoría (opcional)"
          type="number"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          helperText="Dejar vacío para asignar categorías aleatorias"
          sx={{ mb: 2 }}
        />

        {loading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #1a2b4c, #2c3e6b)',
                },
              }}
            />
            <Typography variant="caption" color="#6b7a8f" sx={{ mt: 1, display: 'block' }}>
              {status}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={loading || quantity < 1}
          sx={{
            background: 'linear-gradient(135deg, #1a2b4c, #2c3e6b)',
            color: 'white',
            '&:hover': { background: 'linear-gradient(135deg, #0f1e3a, #1a2b4c)' },
          }}
        >
          {loading ? 'Cargando...' : `Cargar ${quantity.toLocaleString()} productos`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================
// DIALOGO DE CARGA EXCEL / CSV
// ============================================================

const ExcelUploadDialog = ({ open, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [step, setStep] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fileType, setFileType] = useState('');
  const fileInputRef = useRef(null);

  const steps = ['📂 Subir archivo', '👀 Previsualizar', '🚀 Cargar productos'];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (file) => {
    const name = file.name.toLowerCase();
    const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls');
    const isCsv = name.endsWith('.csv');

    if (!isExcel && !isCsv) {
      toast.error('❌ Por favor sube un archivo Excel (.xlsx, .xls) o CSV (.csv)');
      return;
    }

    setFile(file);
    setFileType(isExcel ? 'Excel' : 'CSV');
    setStep(1);
    readFile(file);
  };

  const readFile = (file) => {
    const reader = new FileReader();
    
    if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            toast.error('❌ El archivo CSV está vacío o tiene pocas líneas');
            return;
          }

          const firstLine = lines[0];
          const separator = firstLine.includes(';') ? ';' : ',';
          
          const headers = firstLine.split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
          
          const data = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            data.push(row);
          }

          processData(data);
        } catch (err) {
          toast.error('❌ Error al leer el archivo CSV');
          console.error(err);
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          processData(jsonData);
        } catch (err) {
          toast.error('❌ Error al leer el archivo Excel');
          console.error(err);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const processData = (rawData) => {
    const columnMapping = {
      name: ['Nombre', 'nombre', 'Producto', 'producto', 'Name', 'name'],
      description: ['Descripción', 'descripción', 'Descripcion', 'descripcion', 'Description', 'description'],
      price: ['Precio', 'precio', 'Price', 'price'],
      stock: ['Stock', 'stock'],
      categoryName: ['Categoría', 'categoría', 'Categoria', 'categoria', 'Category', 'category'],
      sku: ['SKU', 'sku', 'Codigo', 'codigo', 'Code', 'code'],
      imageUrl: ['Imagen', 'imagen', 'Image', 'image', 'URL', 'url'],
    };

    const mappedData = rawData.map((row) => {
      const result = {};
      
      Object.keys(columnMapping).forEach((field) => {
        const possibleNames = columnMapping[field];
        let value = '';
        for (const name of possibleNames) {
          if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
            value = row[name];
            break;
          }
        }
        result[field] = value;
      });

      result.price = parseFloat(String(result.price).replace(',', '.')) || 0;
      result.stock = parseInt(String(result.stock)) || 0;
      result.name = String(result.name || 'Producto sin nombre');

      return result;
    });

    setPreviewData(mappedData);
    setStep(1);
  };

  const handleUpload = async () => {
    setLoading(true);
    setProgress(0);
    setStatus('Preparando datos...');

    try {
      let successCount = 0;
      let errorCount = 0;
      const total = previewData.length;

      for (let i = 0; i < previewData.length; i++) {
        const row = previewData[i];
        setProgress(Math.round(((i + 1) / total) * 100));
        setStatus(`Procesando ${i + 1} de ${total}...`);

        try {
          let categoryId = null;
          if (row.categoryName) {
            const found = categories.find(c => 
              c.name.toLowerCase() === String(row.categoryName).toLowerCase()
            );
            if (found) categoryId = found.id;
          }
          if (!categoryId && categories.length > 0) {
            categoryId = categories[0].id;
          }

          const productData = {
            name: String(row.name).trim() || 'Producto sin nombre',
            description: String(row.description || ''),
            price: row.price || 0,
            stock: row.stock || 0,
            categoryId: categoryId || 1,
            sku: row.sku ? String(row.sku).trim() : `SKU-${Date.now()}-${i}`,
            imageUrl: String(row.imageUrl || ''),
          };

          await productService.createProduct(productData);
          successCount++;
        } catch (err) {
          errorCount++;
          console.error(`Error en fila ${i + 1}:`, err);
        }
      }

      setProgress(100);
      setStatus(`✅ ${successCount} productos cargados, ${errorCount} errores`);
      toast.success(`🎉 ${successCount} productos cargados exitosamente`);
      
      setTimeout(() => {
        onUpload();
        onClose();
        setLoading(false);
        setFile(null);
        setPreviewData([]);
        setStep(0);
      }, 1500);
    } catch (err) {
      setStatus('❌ Error en la carga masiva');
      toast.error('❌ Error al cargar productos');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFile(null);
      setPreviewData([]);
      setStep(0);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          padding: '8px',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: '#1a2b4c', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#1a2b4c', width: 44, height: 44 }}>
            {fileType === 'CSV' ? <FilePresent /> : <TableChart />}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Carga Masiva desde {fileType || 'Excel/CSV'}
            </Typography>
            <Typography variant="caption" color="#6b7a8f">
              Sube un archivo Excel (.xlsx, .xls) o CSV (.csv)
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 && (
          <UploadZone
            isDragActive={isDragActive}
            onDragEnter={() => setIsDragActive(true)}
            onDragLeave={() => setIsDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload sx={{ fontSize: 64, color: '#8a9aa8', mb: 2 }} />
            <Typography variant="h6" color="#1a2b4c">
              Arrastra tu archivo aquí
            </Typography>
            <Typography variant="body2" color="#6b7a8f">
              o haz clic para seleccionar un archivo
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}>
              <FileChip
                icon={<Description />}
                label="Excel (.xlsx, .xls)"
                size="small"
                sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}
              />
              <FileChip
                icon={<FilePresent />}
                label="CSV (.csv)"
                size="small"
                sx={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}
              />
            </Box>
            <Typography variant="caption" color="#6b7a8f" sx={{ mt: 1, display: 'block' }}>
              Formatos soportados: .xlsx, .xls, .csv
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </UploadZone>
        )}

        {step === 1 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <FileChip
                icon={fileType === 'CSV' ? <FilePresent /> : <Description />}
                label={`${file?.name} (${previewData.length} registros)`}
                size="medium"
                sx={{ backgroundColor: 'rgba(26,43,76,0.06)', color: '#1a2b4c', py: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                <Chip
                  icon={<CheckCircle sx={{ fontSize: 16 }} />}
                  label={`${previewData.filter(r => r.name).length} nombres`}
                  size="small"
                  sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}
                />
                <Chip
                  icon={<ErrorIcon sx={{ fontSize: 16 }} />}
                  label={`${previewData.filter(r => !r.name).length} sin nombre`}
                  size="small"
                  sx={{ backgroundColor: '#ffebee', color: '#c62828' }}
                />
                <Button
                  size="small"
                  onClick={() => { setFile(null); setPreviewData([]); setStep(0); }}
                  startIcon={<Close />}
                >
                  Cambiar
                </Button>
              </Box>
            </Box>

            <Paper
              sx={{
                maxHeight: 300,
                overflow: 'auto',
                borderRadius: '12px',
                border: '1px solid #e8ecf1',
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>Precio</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>Categoría</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>SKU</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.slice(0, 20).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.name || '-'}</TableCell>
                      <TableCell>${row.price || 0}</TableCell>
                      <TableCell>{row.stock || 0}</TableCell>
                      <TableCell>{row.categoryName || '-'}</TableCell>
                      <TableCell>{row.sku || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {previewData.length > 20 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: '#6b7a8f' }}>
                        ... y {previewData.length - 20} registros más
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>

            {loading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #1a2b4c, #2c3e6b)',
                    },
                  }}
                />
                <Typography variant="caption" color="#6b7a8f" sx={{ mt: 1, display: 'block' }}>
                  {status}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        {step === 1 && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading || previewData.length === 0}
            startIcon={loading ? null : <CloudUpload />}
            sx={{
              background: 'linear-gradient(135deg, #1a2b4c, #2c3e6b)',
              color: 'white',
              '&:hover': { background: 'linear-gradient(135deg, #0f1e3a, #1a2b4c)' },
            }}
          >
            {loading ? `Cargando ${Math.round(progress)}%...` : `Cargar ${previewData.length} productos`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [excelDialogOpen, setExcelDialogOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, pageSize: 10 };
      if (search.trim()) params.searchTerm = search.trim();
      const data = await productService.getProducts(params);
      setProducts(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalCount || 0);
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${name}"?`)) return;
    try {
      await productService.deleteProduct(id);
      toast.success('🗑️ Producto eliminado');
      loadProducts();
    } catch (err) {
      toast.error('❌ Error al eliminar');
    }
  };

  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton variant="text" width={30} /></TableCell>
        <TableCell><Skeleton variant="text" width={150} /></TableCell>
        <TableCell><Skeleton variant="text" width={60} /></TableCell>
        <TableCell><Skeleton variant="text" width={40} /></TableCell>
        <TableCell><Skeleton variant="text" width={100} /></TableCell>
        <TableCell><Skeleton variant="rectangular" width={120} height={32} /></TableCell>
      </TableRow>
    ));
  };

  return (
    <Container maxWidth="lg">
      <HeaderBox component="div">
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1a2b4c">
            📦 Productos
          </Typography>
          <Typography variant="body2" color="#6b7a8f">
            {totalItems.toLocaleString()} productos encontrados
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<FileUpload />}
            onClick={() => setExcelDialogOpen(true)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #2e7d32, #43a047)',
              color: 'white',
              '&:hover': { background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' },
            }}
          >
            📊 Excel / CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setBulkDialogOpen(true)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1a2b4c, #2c3e6b)',
              color: 'white',
              '&:hover': { background: 'linear-gradient(135deg, #0f1e3a, #1a2b4c)' },
            }}
          >
            ⚡ Carga Masiva
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/products/create')}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#1a2b4c',
              '&:hover': { backgroundColor: '#0f1e3a' },
            }}
          >
            ✨ Crear Producto
          </Button>
        </Box>
      </HeaderBox>

      <Box component="form" onSubmit={handleSearch} sx={{ px: 3, pb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar productos por nombre, SKU o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ color: '#8a9aa8' }} /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <Button type="submit" size="small" sx={{ textTransform: 'none' }}>
                  Buscar
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: '#f8f9fa',
              '&:hover': { backgroundColor: '#ffffff' },
            },
          }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mx: 3, mb: 2 }}>{error}</Alert>}

      <StyledPaper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#1a2b4c', backgroundColor: '#f8f9fa' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1a2b4c', backgroundColor: '#f8f9fa' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1a2b4c', backgroundColor: '#f8f9fa' }}>Precio</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1a2b4c', backgroundColor: '#f8f9fa' }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1a2b4c', backgroundColor: '#f8f9fa' }}>Categoría</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1a2b4c', backgroundColor: '#f8f9fa' }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderSkeletons()
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="#6b7a8f">No hay productos</Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>{product.name}</Typography>
                  </TableCell>
                  <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.stock}
                      size="small"
                      sx={{
                        backgroundColor: product.stock > 50 ? '#e8f5e9' : product.stock > 10 ? '#fff3e0' : '#ffebee',
                        color: product.stock > 50 ? '#2e7d32' : product.stock > 10 ? '#e65100' : '#c62828',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.categoryName || 'Sin categoría'}
                      size="small"
                      sx={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/products/${product.id}`)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/products/edit/${product.id}`)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(product.id, product.name)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </StyledPaper>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Diálogo de carga Excel/CSV */}
      <ExcelUploadDialog
        open={excelDialogOpen}
        onClose={() => setExcelDialogOpen(false)}
        onUpload={() => {
          setPage(1);
          loadProducts();
        }}
      />
    </Container>
  );
};

export default ProductsPage;