import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import ModernForm from './pages/ModernForm.jsx'
import Reports from './pages/Reports.jsx'
import SimpleForm from './pages/SimpleForm.jsx'
import DuplicateForm from './pages/DuplicateForm.jsx'
import NewForm from './pages/NewForm.jsx'
import './App.css'

function App() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-badge">Form hub</span>
          <h1>Experiências de cadastro</h1>
          <p>
            Altere entre layouts para avaliar diferentes abordagens de UX sem
            mudar a integração com a API ASP.NET Core.
          </p>
        </div>
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
        <div className="sidebar-asset">
          <svg
            width="100%"
            viewBox="0 0 210 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="210" height="140" rx="18" fill="url(#asset-gradient)" />
            <defs>
              <linearGradient id="asset-gradient" x1="105" y1="0" x2="105" y2="140" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4338CA" />
                <stop offset="1" stopColor="#6D28D9" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </aside>

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
