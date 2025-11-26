import { useEffect, useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import './ProfilePage.css';

const emptyProfile = {
  name: '',
  email: '',
  birthDate: '',
  cpf: '',
  description: '',
  theme: 'dark',
};

const initialPasswordState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function ProfilePage() {
  const { token, logout, updateThemePreference, theme: preferredTheme } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [profileStatus, setProfileStatus] = useState('idle');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState(initialPasswordState);
  const [passwordStatus, setPasswordStatus] = useState('idle');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingProfile(false);
      return;
    }

    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileMessage('');

      try {
        const { data } = await api.get('/users/me');
        setProfile({
          name: data?.name ?? '',
          email: data?.email ?? '',
          birthDate: data?.birthDate ? String(data.birthDate).slice(0, 10) : '',
          cpf: data?.cpf ?? '',
          description: data?.description ?? '',
          theme: data?.theme ?? preferredTheme ?? 'dark',
        });
      } catch (error) {
        console.error('Failed to load profile', error);
        const apiMessage = error.response?.data?.message;
        setProfileMessage(apiMessage ?? 'Não foi possível carregar seus dados agora.');
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, preferredTheme]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (profileStatus !== 'idle') {
      setProfileStatus('idle');
      setProfileMessage('');
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordStatus !== 'idle') {
      setPasswordStatus('idle');
      setPasswordMessage('');
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileStatus('submitting');
    setProfileMessage('');

    try {
      await api.put('/users/me', {
        name: profile.name.trim(),
        email: profile.email.trim(),
        birthDate: profile.birthDate || null,
        cpf: profile.cpf.trim() || null,
        description: profile.description.trim() || null,
        theme: profile.theme,
      });

      setProfileStatus('success');
      setProfileMessage('Seus dados foram atualizados.');
      updateThemePreference(profile.theme);
    } catch (error) {
      console.error('Failed to update profile', error);
      const apiMessage = error.response?.data?.message;
      setProfileStatus('error');
      setProfileMessage(apiMessage ?? 'Não foi possível salvar as alterações.');
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus('error');
      setPasswordMessage('As novas senhas não coincidem.');
      return;
    }

    setPasswordStatus('submitting');
    setPasswordMessage('');

    try {
      await api.put('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordStatus('success');
      setPasswordMessage('Senha atualizada com sucesso.');
      setPasswordForm(initialPasswordState);
    } catch (error) {
      console.error('Failed to update password', error);
      const apiMessage = error.response?.data?.message;
      setPasswordStatus('error');
      setPasswordMessage(apiMessage ?? 'Não foi possível atualizar a senha.');
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="profile-page">
        <div className="profile-card">
          <h2>Acesso não autorizado</h2>
          <p>Faça login novamente para visualizar ou editar seu cadastro.</p>
          <button type="button" onClick={logout} className="profile-logout">
            Ir para login
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page" aria-live="polite">
      <header className="profile-header">
        <div>
          <span className="profile-kicker">Minha conta</span>
          <h1>Configurações do usuário</h1>
          <p>Atualize seus dados pessoais e defina uma nova senha sempre que precisar.</p>
        </div>
      </header>

      {loadingProfile ? (
        <div className="profile-card">
          <p>Carregando seus dados...</p>
        </div>
      ) : (
        <div className="profile-grid">
          <form className="profile-card" onSubmit={handleProfileSubmit}>
            <h2>Dados pessoais</h2>
            <p className="profile-description">
              Use este formulário para manter suas informações de contato atualizadas.
            </p>

            {profileMessage && (
              <div
                className={`profile-alert ${profileStatus === 'success' ? 'profile-alert-success' : ''} ${profileStatus === 'error' ? 'profile-alert-error' : ''}`.trim()}
                role="status"
              >
                {profileMessage}
              </div>
            )}

            <label className="profile-field" htmlFor="profile-name">
              <span>Nome completo</span>
              <input
                id="profile-name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Seu nome"
                required
              />
            </label>

            <label className="profile-field" htmlFor="profile-email">
              <span>E-mail</span>
              <input
                id="profile-email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder="nome@exemplo.com"
                autoComplete="email"
                required
              />
            </label>

            <div className="profile-field-grid">
              <label className="profile-field" htmlFor="profile-birthDate">
                <span>Data de nascimento</span>
                <input
                  id="profile-birthDate"
                  name="birthDate"
                  type="date"
                  value={profile.birthDate}
                  onChange={handleProfileChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </label>

              <label className="profile-field" htmlFor="profile-cpf">
                <span>CPF</span>
                <input
                  id="profile-cpf"
                  name="cpf"
                  value={profile.cpf}
                  onChange={handleProfileChange}
                  placeholder="000.000.000-00"
                />
              </label>
            </div>

            <label className="profile-field" htmlFor="profile-description">
              <span>Descrição</span>
              <textarea
                id="profile-description"
                name="description"
                value={profile.description}
                onChange={handleProfileChange}
                placeholder="Compartilhe informações que considere relevantes."
                rows={3}
              />
            </label>

            <label className="profile-field" htmlFor="profile-theme">
              <span>Tema preferido</span>
              <select
                id="profile-theme"
                name="theme"
                value={profile.theme}
                onChange={handleProfileChange}
              >
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
              </select>
              <p className="profile-hint">Escolha como a interface deve aparecer após salvar.</p>
            </label>

            <div className="profile-actions">
              <button type="submit" disabled={profileStatus === 'submitting'}>
                {profileStatus === 'submitting' ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>

          <form className="profile-card" onSubmit={handlePasswordSubmit}>
            <h2>Alterar senha</h2>
            <p className="profile-description">
              Escolha uma senha segura que seja fácil de lembrar, mas difícil de adivinhar.
            </p>

            {passwordMessage && (
              <div
                className={`profile-alert ${passwordStatus === 'success' ? 'profile-alert-success' : ''} ${passwordStatus === 'error' ? 'profile-alert-error' : ''}`.trim()}
                role="status"
              >
                {passwordMessage}
              </div>
            )}

            <label className="profile-field" htmlFor="currentPassword">
              <span>Senha atual</span>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Digite sua senha atual"
                autoComplete="current-password"
                required
              />
            </label>

            <label className="profile-field" htmlFor="newPassword">
              <span>Nova senha</span>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Nova senha"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="profile-field" htmlFor="confirmPassword">
              <span>Confirmar nova senha</span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                required
              />
            </label>

            <div className="profile-actions">
              <button type="submit" disabled={passwordStatus === 'submitting'}>
                {passwordStatus === 'submitting' ? 'Atualizando...' : 'Atualizar senha'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default ProfilePage;
