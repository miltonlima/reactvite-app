import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="login-header">
          <h2>Bem-vindo de volta</h2>
          <p>Faça login para acessar a plataforma.</p>
        </header>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@exemplo.com"
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-footer">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Não tem uma conta2? <a href="/register" style={{ color: '#6366f1' }}>Registre-se</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;