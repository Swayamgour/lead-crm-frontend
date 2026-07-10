import { createTheme } from '@mui/material/styles';

// Mirrors the CSS brand tokens in src/index.css ("Cobalt & Signal")
// so MUI components (buttons, chips, avatars, etc.) match the rest
// of the app instead of MUI's default blue.
// This pass elevates the whole design system: softer surfaces, refined
// elevation/shadows, consistent radii, and calmer typography — same
// brand colors, noticeably more premium finish.
const theme = createTheme({
    palette: {
        primary: {
            main: '#2653ef',
            light: '#6d93f9',
            dark: '#131d33',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f5a524',
            light: '#ffbb4d',
            dark: '#c97e0a',
            contrastText: '#0a0f1e',
        },
        success: { main: '#17b378' },
        background: {
            default: '#f5f6fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#151b2c',
            secondary: '#6b7488',
        },
        divider: 'rgba(20, 26, 46, 0.08)',
    },
    typography: {
        fontFamily: "'Inter', system-ui, sans-serif",
        h1: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 },
        h2: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 },
        h3: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
        h4: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
        h5: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
        h6: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
        button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: {
        borderRadius: 14,
    },
    shadows: [
        'none',
        '0 1px 2px rgba(15,23,42,0.06)',
        '0 2px 6px rgba(15,23,42,0.06)',
        '0 4px 10px rgba(15,23,42,0.07)',
        '0 6px 14px rgba(15,23,42,0.08)',
        '0 8px 18px rgba(15,23,42,0.08)',
        '0 10px 22px rgba(15,23,42,0.09)',
        '0 12px 26px rgba(15,23,42,0.09)',
        '0 14px 30px rgba(15,23,42,0.10)',
        '0 16px 34px rgba(15,23,42,0.10)',
        '0 18px 38px rgba(15,23,42,0.10)',
        '0 20px 42px rgba(15,23,42,0.11)',
        '0 22px 46px rgba(15,23,42,0.11)',
        '0 24px 50px rgba(15,23,42,0.12)',
        '0 24px 50px rgba(15,23,42,0.12)',
        '0 24px 50px rgba(15,23,42,0.12)',
        '0 24px 50px rgba(15,23,42,0.12)',
        '0 24px 50px rgba(15,23,42,0.12)',
        '0 24px 50px rgba(15,23,42,0.12)',
        '0 24px 50px rgba(15,23,42,0.12)',
        '0 24px 50px rgba(15,23,42,0.12)',
        '0 24px 50px rgba(15,23,42,0.12)',
        '0 24px 50px rgba(15,23,42,0.12)',
        '0 24px 50px rgba(15,23,42,0.12)',
        '0 24px 50px rgba(15,23,42,0.12)',
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { backgroundColor: '#f5f6fa' },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
                rounded: { borderRadius: 16 },
                elevation1: { boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 1px 12px rgba(15,23,42,0.05)' },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid rgba(20,26,46,0.06)',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 1px 12px rgba(15,23,42,0.05)',
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    paddingTop: 8,
                    paddingBottom: 8,
                    paddingLeft: 18,
                    paddingRight: 18,
                    fontWeight: 600,
                },
                containedPrimary: {
                    backgroundImage: 'linear-gradient(135deg, #2653ef 0%, #1d40c9 100%)',
                    '&:hover': {
                        backgroundImage: 'linear-gradient(135deg, #1d40c9 0%, #17347fff 100%)',
                        boxShadow: '0 8px 20px rgba(38,83,239,0.28)',
                    },
                },
                outlined: {
                    borderWidth: 1.5,
                    '&:hover': { borderWidth: 1.5 },
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: { borderRadius: 10 },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 8, fontWeight: 600 },
            },
        },
        MuiTextField: {
            defaultProps: { size: 'small' },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    backgroundColor: '#fbfbfd',
                    '& fieldset': { borderColor: 'rgba(20,26,46,0.12)' },
                    '&:hover fieldset': { borderColor: 'rgba(38,83,239,0.4)' },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#6b7488',
                    backgroundColor: '#fafbfd',
                    borderBottom: '1px solid rgba(20,26,46,0.08)',
                },
                root: {
                    borderBottom: '1px solid rgba(20,26,46,0.06)',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': { backgroundColor: 'rgba(38,83,239,0.035)' },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: { backgroundImage: 'none' },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#151b2c',
                    fontSize: 12,
                    borderRadius: 8,
                    padding: '6px 10px',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: { borderRadius: 18 },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: { borderRadius: 12 },
            },
        },
    },
});

export default theme;
