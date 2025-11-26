import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Layout.css';

const Layout = () => {
  const { logout } = useAuth();

  return (
    <div className="layout-container">
      <header className="layout-header">
        <div className="layout-logo">
          <Link to="dashboard">App</Link>
        </div>
        <nav className="layout-nav">
          <Link to="dashboard">Painel</Link>          
          <Link to="education-units">Unidades</Link>
          <Link to="education-classes">Turmas</Link>
          <Link to="education-students">Alunos</Link>
          <Link to="education-enrollments">Inscrições</Link>
          <Link to="new-registration">Usuários</Link>
          <Link to="reports">Relatórios</Link>
          <Link to="profile">Meu Perfil</Link>
        </nav>
        <div className="layout-actions">
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
