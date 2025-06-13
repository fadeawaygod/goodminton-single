import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import CourtSystem from './components/CourtSystem';
import Header from './components/Header';
import Home from './pages/Home';
import Settings from './pages/Settings';
import { Provider } from 'react-redux';
import { store } from './store';

// 使用 PUBLIC_URL 作為 basename
const basePath = process.env.PUBLIC_URL || '';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF69B4', // Hot pink
    },
    secondary: {
      main: '#9370DB', // Soft purple
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router basename={basePath}>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <main style={{ flexGrow: 1, padding: '20px 0' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/courts" element={<CourtSystem />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </Router>
        </ThemeProvider>
      </I18nextProvider>
    </Provider>
  );
};

export default App;
