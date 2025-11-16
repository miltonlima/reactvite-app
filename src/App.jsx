import { useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import ModernForm from './pages/ModernForm.jsx'
import Reports from './pages/Reports.jsx'
import SimpleForm from './pages/SimpleForm.jsx'
import DuplicateForm from './pages/DuplicateForm.jsx'
import NewForm from './pages/NewForm.jsx'
import Login from './pages/Login.jsx'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return <MainApp />
}

function MainApp() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="nav-links" aria-label="Variações de formulário">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Formulário moderno
          </NavLink>
          <NavLink
            to="/simple"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Formulário compacto
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Relatório de cadastros
          </NavLink>
          <NavLink
            to="/new"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Novo formulário
          </NavLink>
          <NavLink
            to="/duplicate"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Duplicado
          </NavLink>
        </nav>
      </header>

      <main className="content">
        <div className="content-card">
          <Routes>
            <Route path="/" element={<ModernForm />} />
            <Route path="/simple" element={<SimpleForm />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/duplicate" element={<DuplicateForm />} />
            <Route path="/new" element={<NewForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App

