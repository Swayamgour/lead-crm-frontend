import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useGetProfileQuery } from "../redux/api.jsx";
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
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
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
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
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    {/* Left Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            color="inherit"
                            aria-label="toggle drawer"
                            onClick={handleDrawerToggle}
                            edge="start"
                            sx={{ color: 'text.secondary' }}
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
                                    borderRadius: 2,
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                    // width:'full'
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: 'primary.main',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    }}
                                >
                                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Avatar>
                                <Box sx={{ display: { xs: 'none', md: 'block' }, ml: 1.5, mr: 0.5, textAlign: 'left' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                        {profile?.name || 'User'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {profile?.role || 'Employee'}
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
                                        borderRadius: 2,
                                        overflow: 'visible',
                                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
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
                                <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                bgcolor: 'primary.main',
                                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                            }}
                                        >
                                            {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {profile?.name || 'User'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {profile?.email || 'user@example.com'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                                <Divider />

                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText>Logout</ListItemText>
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
                            borderRight: '1px solid',
                            borderColor: 'divider',
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
                    p: isMobile ? 0 : 3,
                    width: '100%',
                    minHeight: '100vh',
                    backgroundColor: 'grey.50',
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
                <Box sx={{ maxWidth: '100%' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;