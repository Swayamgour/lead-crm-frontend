import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useGetProfileQuery } from "../redux/api.jsx";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectCurrentUser } from "../redux/slices/authSlice";
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    useTheme,
    useMediaQuery,
    Chip,
    Fade,
    Paper,
    Stack,
} from "@mui/material";
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Notifications as NotificationsIcon,
    Schedule as ScheduleIcon,
    Timeline as TimelineIcon,
    Assessment as AssessmentIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import NavSidebar from "../pages/NavSidebar.jsx";

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

const MainLayout = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const { data: profile } = useGetProfileQuery();
    const dispatch = useDispatch();
    const reduxUser = useSelector(selectCurrentUser);

    // Handle responsive sidebar
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
            setMobileOpen(false);
        } else {
            setSidebarOpen(true);
        }
    }, [isMobile]);

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setSidebarOpen(!sidebarOpen);
        }
    };

    const handleUserMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    // const handleLogout = () => {
    //     localStorage.removeItem('token');
    //     navigate('/login');
    //     window.location.reload();
    // };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login", { replace: true });
    };



    const drawer = (
        <NavSidebar
            sidebarOpen={isMobile ? true : sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            mobileMenuOpen={mobileOpen}
            setMobileMenuOpen={setMobileOpen}
        />
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.78)',
                    backdropFilter: 'blur(16px) saturate(1.4)',
                    boxShadow: '0 1px 0 0 rgba(20,26,46,0.06)',
                    borderBottom: 'none',
                    zIndex: isMobile ? theme.zIndex.drawer - 1 : theme.zIndex.drawer + 1,
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    ...(sidebarOpen && !isMobile && {
                        width: `calc(100% - ${drawerWidth}px)`,
                        marginLeft: `${drawerWidth}px`,
                        transition: theme.transitions.create(['width', 'margin'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    }),
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: '68px !important' }}>
                    {/* Left Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <IconButton
                            color="inherit"
                            aria-label="toggle drawer"
                            onClick={handleDrawerToggle}
                            edge="start"
                            sx={{
                                color: 'text.secondary',
                                bgcolor: 'rgba(20,26,46,0.04)',
                                '&:hover': { bgcolor: 'rgba(38,83,239,0.08)', color: 'primary.main' },
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>

                    {/* Right Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* User Menu */}
                        <Box>
                            <IconButton
                                onClick={handleUserMenuOpen}
                                size="small"
                                sx={{
                                    p: 0.5,
                                    pr: { xs: 0.5, md: 1 },
                                    borderRadius: 3,
                                    border: '1px solid rgba(20,26,46,0.06)',
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: 'primary.main',
                                        background: 'var(--gradient-brand)',
                                        fontWeight: 700,
                                        boxShadow: '0 4px 12px rgba(38,83,239,0.3)',
                                    }}
                                >
                                    {(profile?.name || reduxUser?.name)?.charAt(0)?.toUpperCase() || 'U'}
                                </Avatar>
                                <Box sx={{ display: { xs: 'none', md: 'block' }, ml: 1.5, mr: 0.5, textAlign: 'left' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                        {profile?.name || reduxUser?.name || 'User'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {profile?.role || reduxUser?.role || 'Employee'}
                                    </Typography>
                                </Box>
                                <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 20, display: { xs: 'none', md: 'block' } }} />
                            </IconButton>

                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleUserMenuClose}
                                TransitionComponent={Fade}
                                PaperProps={{
                                    elevation: 3,
                                    sx: {
                                        mt: 1.5,
                                        minWidth: 240,
                                        borderRadius: 3,
                                        overflow: 'visible',
                                        filter: 'drop-shadow(0 12px 28px rgba(15,23,42,0.16))',
                                        '&:before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: -8,
                                            right: 20,
                                            width: 0,
                                            height: 0,
                                            borderLeft: '8px solid transparent',
                                            borderRight: '8px solid transparent',
                                            borderBottom: '8px solid white',
                                        },
                                    },
                                }}
                            >
                                <Box sx={{ p: 2, background: 'var(--gradient-navy)', borderRadius: '12px 12px 0 0' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                bgcolor: 'primary.main',
                                                background: 'var(--gradient-amber)',
                                                color: '#0a0f1e',
                                                fontWeight: 800,
                                            }}
                                        >
                                            {(profile?.name || reduxUser?.name)?.charAt(0)?.toUpperCase() || 'U'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>
                                                {profile?.name || reduxUser?.name || 'User'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                                                {profile?.email || reduxUser?.email || 'user@example.com'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                                <Divider />

                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.3, mx: 0.5, my: 0.5, borderRadius: 2 }}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Logout</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Box
                component="nav"
                sx={{
                    width: { lg: sidebarOpen ? drawerWidth : collapsedDrawerWidth },
                    flexShrink: { lg: 0 },
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            border: 'none',
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', lg: 'block' },
                        width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
                        '& .MuiDrawer-paper': {
                            width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
                            boxSizing: 'border-box',
                            border: 'none',
                            boxShadow: '4px 0 24px rgba(10,15,30,0.18)',
                            backgroundColor: 'background.paper',
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            overflowX: 'hidden',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: isMobile ? 1.5 : 3,
                    width: '100%',
                    minHeight: '100vh',
                    background: 'radial-gradient(1200px 600px at 100% -10%, rgba(38,83,239,0.05), transparent), #f5f6fa',
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    ...(sidebarOpen && !isMobile && {
                        transition: theme.transitions.create('margin', {
                            easing: theme.transitions.easing.easeOut,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    }),
                }}
            >
                {/* Toolbar spacer */}
                <Toolbar sx={{ display: { xs: 'block', sm: 'none' } }} />
                <Toolbar sx={{ display: { xs: 'none', sm: 'block' } }} />

                {/* Page Content */}
                <Box sx={{ maxWidth: '100%', animation: 'fadeInUp 0.35s ease' }}>
                    <Outlet />
                </Box>
            </Box>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Box>
    );
};

export default MainLayout;