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
          <Link to="dashboard">Dashboard</Link>
          <Link to="reports">Relatórios</Link>
          <Link to="new-registration">Novo Cadastro</Link>
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
