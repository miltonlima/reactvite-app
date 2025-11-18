import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import ModernForm from './pages/ModernForm.jsx'
import Reports from './pages/Reports.jsx'
import SimpleForm from './pages/SimpleForm.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { useAuth } from './hooks/useAuth.js'
import './App.css'

function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const { token, logout } = useAuth()

  return (
    <Routes>
      <Route path="/" element={!token ? <Navigate to="/login" replace /> : <Navigate to="/app" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <MainApp onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function MainApp({ onLogout }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="nav-links" aria-label="Variações de formulário">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Formulário moderno
          </NavLink>
          <NavLink
            to="simple"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Formulário compacto
          </NavLink>
          <NavLink
            to="reports"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Relatório de cadastros
          </NavLink>
        </nav>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </header>

      <main className="content">
        <div className="content-card">
          <Routes>
            <Route index element={<ModernForm />} />
            <Route path="simple" element={<SimpleForm />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
