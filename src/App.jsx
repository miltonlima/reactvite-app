import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import ModernForm from './pages/ModernForm.jsx'
import Reports from './pages/Reports.jsx'
import SimpleForm from './pages/SimpleForm.jsx'
import DuplicateForm from './pages/DuplicateForm.jsx'
import NewForm from './pages/NewForm.jsx'
import Login from './pages/Login.jsx'
import { useAuth } from './hooks/useAuth.js'
import './App.css'

function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const { isLoggedIn, handleLogin, handleLogout } = useAuth()

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={isLoggedIn ? <Navigate to="/app" replace /> : <Login onLogin={handleLogin} />} />
      <Route
        path="/app/*"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <MainApp onLogout={handleLogout} />
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
          <NavLink
            to="new"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Novo formulário
          </NavLink>
          <NavLink
            to="duplicate"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Duplicado
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
            <Route path="duplicate" element={<DuplicateForm />} />
            <Route path="new" element={<NewForm />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
