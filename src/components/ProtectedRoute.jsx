import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

//Ele chama useAuth para descobrir se ainda está verificando o usuário (loading) e se há um token válido (token).
//Enquanto a verificação não termina, renderiza só “Loading…”.
//Depois disso, se existir token, mostra a rota protegida (os children); sem token, manda o usuário direto para /login via Navigate.

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
