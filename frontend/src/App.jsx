import { useEffect, useState } from 'react';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FuncionarioDashboard from './pages/FuncionarioDashboard.jsx';
import { loginWithCredentials, logoutSession, restoreAuthSession } from './domains/auth/auth.service.js';

export default function App() {
  const [view, setView] = useState('landing');
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [userPermissions, setUserPermissions] = useState([]);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const session = restoreAuthSession();
    if (session) {
      const { payload } = session;
      setUserRole(payload.role || null);
      setUserName(payload.email || '');
      setUserPermissions(payload.permissions || []);
      setView('dashboard');
    }
  }, []);

  const handleLoginSubmit = async ({ usuario, senha }) => {
    setIsSubmitting(true);
    setLoginError('');

    try {
      const { payload, usuario: loggedUser } = await loginWithCredentials({ usuario, senha });
      setUserRole(payload?.role || null);
      setUserName(loggedUser?.name || payload?.email || '');
      setUserPermissions(payload?.permissions || []);
      setView('dashboard');
    } catch (err) {
      const message = err?.response?.data?.message || 'Usuario ou senha invalidos.';
      setLoginError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logoutSession();
    setUserRole(null);
    setUserName('');
    setUserPermissions([]);
    setView('landing');
  };

  return (
    <div className={`app app--${view}`}>
      {view === 'landing' && (
        <Landing
          onLoginClick={() => {
            setLoginError('');
            setView('login');
          }}
        />
      )}
      {view === 'login' && (
        <Login
          errorMessage={loginError}
          onSubmit={handleLoginSubmit}
          onBack={() => setView('landing')}
          isSubmitting={isSubmitting}
        />
      )}
      {view === 'dashboard' && userRole === 'FUNCIONARIO' && (
        <FuncionarioDashboard permissions={userPermissions} username={userName} onLogout={handleLogout} />
      )}
      {view === 'dashboard' && userRole !== 'FUNCIONARIO' && (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
}
