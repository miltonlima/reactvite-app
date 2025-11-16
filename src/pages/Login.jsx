import { useState } from 'react'
import './Login.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email && password) {
      onLogin()
    } else {
      setError('Por favor, preencha o e-mail e a senha.')
    }
  }

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
            />
          </div>
          <div className="form-footer">
            <button type="submit">Entrar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
