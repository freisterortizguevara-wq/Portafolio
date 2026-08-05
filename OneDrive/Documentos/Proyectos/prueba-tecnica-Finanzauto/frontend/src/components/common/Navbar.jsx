import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Chip,
  Badge,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Add,
  Logout,
  ShoppingBag,
  Person,
  Settings,
  Dashboard,
  Brightness4,
  Brightness7,
  Notifications,
  Help,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// ============================================================
// ESTILOS CORPORATIVOS MEJORADOS
// ============================================================

const CorporateAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#ffffff',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#e8ecf1'}`,
  position: 'sticky',
  top: 0,
  zIndex: 1100,
  transition: 'all 0.3s ease',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  fontWeight: 800,
  fontSize: '22px',
  letterSpacing: '-0.5px',
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a2b4c',
  transition: 'color 0.3s ease',
}));

const LogoIcon = styled(ShoppingBag)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#667eea' : '#1a2b4c',
  fontSize: 28,
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  padding: '8px 18px',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '14px',
  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#4a5a6e',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f0f2f5',
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a2b4c',
  },
}));

const NavButtonActive = styled(NavButton)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a2b4c',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f0f2f5',
  fontWeight: 600,
}));

const PrimaryNavButton = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  padding: '8px 20px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '14px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #667eea, #764ba2)' 
    : 'linear-gradient(135deg, #1a2b4c, #2c3e6b)',
  color: 'white',
  transition: 'all 0.3s ease',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 15px rgba(102, 126, 234, 0.3)' 
    : '0 4px 15px rgba(26, 43, 76, 0.2)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 25px rgba(102, 126, 234, 0.4)' 
      : '0 8px 25px rgba(26, 43, 76, 0.3)',
  },
  '&:active': {
    transform: 'scale(0.97)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #667eea, #764ba2)' 
    : 'linear-gradient(135deg, #1a2b4c, #2c3e6b)',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: '10px',
  margin: '4px 8px',
  padding: '10px 16px',
  transition: 'all 0.2s ease',
  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : '#4a5a6e',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f0f2f5',
  },
  '& .MuiSvgIcon-root': {
    marginRight: '12px',
    fontSize: '20px',
    color: theme.palette.mode === 'dark' ? '#667eea' : '#6b7a8f',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    width: 12,
    height: 12,
    borderRadius: '50%',
  },
}));

const ThemeToggleButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#4a5a6e',
  borderRadius: '10px',
  padding: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f0f2f5',
  },
}));

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const Navbar = ({ toggleTheme, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const open = Boolean(anchorEl);
  const notifOpen = Boolean(notifAnchor);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifClick = (event) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleMenuClose();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <CorporateAppBar elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 2, sm: 3 } }}>
        {/* LOGO - CORREGIDO SIN <p> */}
        <LogoContainer onClick={() => navigate('/')}>
          <LogoIcon />
          Finanzauto
          <Chip
            label="v2.0"
            size="small"
            sx={{
              backgroundColor: 'rgba(102, 126, 234, 0.12)',
              color: '#667eea',
              fontWeight: 600,
              fontSize: '10px',
              height: 20,
            }}
          />
        </LogoContainer>

        {/* MENÚ CENTRAL - SOLO EN DESKTOP */}
        {isAuthenticated && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            <NavButton
              startIcon={<ShoppingBag />}
              onClick={() => navigate('/products')}
              sx={isActive('/products') ? { color: '#667eea', fontWeight: 600 } : {}}
            >
              Productos
            </NavButton>
          </Box>
        )}

        {/* ACCIONES */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {/* Tema Oscuro */}
            <Tooltip title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
              <ThemeToggleButton onClick={toggleTheme}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </ThemeToggleButton>
            </Tooltip>

            {/* Notificaciones */}
            <Tooltip title="Notificaciones">
              <IconButton
                onClick={handleNotifClick}
                sx={{
                  color: darkMode ? 'rgba(255,255,255,0.7)' : '#4a5a6e',
                  borderRadius: '10px',
                  padding: '8px',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.06)' : '#f0f2f5',
                  },
                }}
              >
                <Badge color="primary" variant="dot">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={notifAnchor}
              open={notifOpen}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1,
                  minWidth: 280,
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #e8ecf1',
                  overflow: 'hidden',
                  backgroundColor: darkMode ? '#1e1e2e' : '#ffffff',
                },
              }}
            >
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e8ecf1' }}>
                <Typography fontWeight={600}>Notificaciones</Typography>
              </Box>
              <MenuItem disabled sx={{ py: 2, justifyContent: 'center', color: '#6b7a8f' }}>
                No hay notificaciones nuevas
              </MenuItem>
            </Menu>

            {/* Botón Crear */}
            <PrimaryNavButton
              startIcon={<Add />}
              onClick={() => navigate('/products/create')}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Crear Producto
            </PrimaryNavButton>

            {/* Avatar + Menú de usuario */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Menú de usuario">
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <StyledAvatar onClick={handleMenuClick}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </StyledAvatar>
                </StyledBadge>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                TransitionComponent={Fade}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      mt: 1.5,
                      minWidth: 220,
                      borderRadius: '14px',
                      boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#e8ecf1'}`,
                      overflow: 'hidden',
                      backgroundColor: darkMode ? '#1e1e2e' : '#ffffff',
                    }
                  }
                }}
              >
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#e8ecf1'}` }}>
                  <Typography variant="subtitle1" fontWeight={700} color={darkMode ? '#ffffff' : '#1a2b4c'}>
                    {user?.username}
                  </Typography>
                  <Typography variant="caption" color="#6b7a8f">
                    {user?.email}
                  </Typography>
                  <Chip
                    label={user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: user?.role === 'admin' ? 'rgba(102, 126, 234, 0.12)' : 'rgba(76, 175, 80, 0.12)',
                      color: user?.role === 'admin' ? '#667eea' : '#4caf50',
                      fontWeight: 600,
                      fontSize: '11px',
                    }}
                  />
                </Box>

                <StyledMenuItem onClick={() => { navigate('/products'); handleMenuClose(); }}>
                  <ShoppingBag />
                  Productos
                </StyledMenuItem>

                <StyledMenuItem onClick={() => { navigate('/products/create'); handleMenuClose(); }}>
                  <Add />
                  Crear Producto
                </StyledMenuItem>

                <StyledMenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
                  <Dashboard />
                  Dashboard
                </StyledMenuItem>

                <Divider sx={{ mx: 2, borderColor: darkMode ? 'rgba(255,255,255,0.06)' : '#e8ecf1' }} />

                <StyledMenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                  <Person />
                  Perfil
                </StyledMenuItem>

                <StyledMenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
                  <Settings />
                  Configuración
                </StyledMenuItem>

                <StyledMenuItem onClick={() => { navigate('/help'); handleMenuClose(); }}>
                  <Help />
                  Ayuda
                </StyledMenuItem>

                <Divider sx={{ mx: 2, borderColor: darkMode ? 'rgba(255,255,255,0.06)' : '#e8ecf1' }} />

                <StyledMenuItem onClick={handleLogout} sx={{ color: '#dc3545' }}>
                  <Logout sx={{ color: '#dc3545' }} />
                  Cerrar Sesión
                </StyledMenuItem>
              </Menu>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ThemeToggleButton onClick={toggleTheme}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </ThemeToggleButton>
            <NavButton onClick={() => navigate('/login')}>Iniciar Sesión</NavButton>
            <PrimaryNavButton onClick={() => navigate('/register')}>Registrarse</PrimaryNavButton>
          </Box>
        )}
      </Toolbar>
    </CorporateAppBar>
  );
};

export default Navbar;