import { useEffect, useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import './DashboardPage.css';

const normalizeSummary = (summary) => {
  if (!summary || typeof summary !== 'object') {
    return {
      generatedAt: null,
      totalStudents: 0,
      units: [],
    };
  }

  const rawUnits = summary?.units ?? summary?.Units;

  const units = Array.isArray(rawUnits)
    ? rawUnits.map((unit) => {
        const unitClasses = unit?.classes ?? unit?.Classes;
        return {
          id: unit?.id ?? unit?.Id ?? 0,
          name: unit?.name ?? unit?.Name ?? 'Sem nome',
          totalStudents: unit?.totalStudents ?? unit?.TotalStudents ?? 0,
          classes: Array.isArray(unitClasses)
            ? unitClasses.map((klass) => ({
                id: klass?.id ?? klass?.Id ?? 0,
                name: klass?.name ?? klass?.Name ?? 'Sem nome',
                totalStudents: klass?.totalStudents ?? klass?.TotalStudents ?? 0,
              }))
            : [],
        };
      })
    : [];

  return {
    generatedAt: summary.generatedAt ?? summary.GeneratedAt ?? null,
    totalStudents: summary.totalStudents ?? summary.TotalStudents ?? 0,
    units,
  };
};

const DashboardPage = () => {
  const { token, logout } = useAuth();
  const [summary, setSummary] = useState(() => normalizeSummary(null));
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setSummary(normalizeSummary(null));
      setStatus('idle');
      setErrorMessage('');
      return;
    }

    let isActive = true;
    const fetchSummary = async () => {
      setStatus('loading');
      setErrorMessage('');

      try {
        const { data } = await api.get('/dashboard');
        if (!isActive) {
          return;
        }
        setSummary(normalizeSummary(data));
        setStatus('success');
      } catch (error) {
        if (!isActive) {
          return;
        }

        const unauthorized = error?.response?.status === 401;
        if (unauthorized) {
          logout?.();
          setStatus('idle');
          setErrorMessage('Sua sessão expirou. Faça login novamente.');
          return;
        }

        console.error('Falha ao carregar a visão geral do dashboard', error);
        const apiMessage = error?.response?.data?.message;
        setStatus('error');
        setErrorMessage(apiMessage ?? 'Não foi possível carregar os dados do dashboard.');
      }
    };

    fetchSummary();

    return () => {
      isActive = false;
    };
  }, [token, logout]);

  const units = summary.units;
  const generatedAt = useMemo(
    () => (summary.generatedAt ? new Date(summary.generatedAt) : null),
    [summary.generatedAt],
  );

  const totalUnits = useMemo(() => units.length, [units]);
  const totalClasses = useMemo(
    () => units.reduce((acc, unit) => acc + (Array.isArray(unit.classes) ? unit.classes.length : 0), 0),
    [units],
  );

  const maxClassTotal = useMemo(() => {
    let max = 0;
    for (const unit of units) {
      if (!Array.isArray(unit.classes)) {
        continue;
      }
      for (const klass of unit.classes) {
        if (klass.totalStudents > max) {
          max = klass.totalStudents;
        }
      }
    }
    return max;
  }, [units]);

  const hasData = useMemo(() => units.some((unit) => (unit.classes ?? []).some((klass) => klass.totalStudents > 0)), [units]);

  const chartScale = maxClassTotal > 0 ? maxClassTotal : 1;

  return (
    <section className="dashboard-page" aria-labelledby="dashboard-title">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Painel</p>
          <h1 id="dashboard-title">Inscrições por unidades e turmas</h1>
          <p>
            Acompanhe como os alunos estão distribuídos entre as unidades de ensino e suas turmas.
            Este painel é atualizado automaticamente sempre que novas matrículas são registradas.
          </p>
        </div>
      </header>

      {errorMessage && status === 'error' && (
        <div className="dashboard-alert" role="alert">
          {errorMessage}
        </div>
      )}

      {status === 'loading' ? (
        <div className="dashboard-card">
          <p>Carregando métricas de inscrições...</p>
        </div>
      ) : (
        <>
          <section className="dashboard-summary" aria-label="Visão geral de matrículas">
            <div className="dashboard-summary-row">
              <div>
                <h2>Visão geral</h2>
                <p>
                  Dados gerados&nbsp;
                  {generatedAt ? generatedAt.toLocaleString('pt-BR') : 'recentemente'}.
                </p>
              </div>
            </div>
            <div className="dashboard-summary-grid">
              <div className="dashboard-metric">
                <span className="dashboard-metric-label">Alunos matriculados</span>
                <strong className="dashboard-metric-value">{summary.totalStudents}</strong>
              </div>
              <div className="dashboard-metric">
                <span className="dashboard-metric-label">Unidades com matrículas</span>
                <strong className="dashboard-metric-value">{totalUnits}</strong>
              </div>
              <div className="dashboard-metric">
                <span className="dashboard-metric-label">Turmas acompanhadas</span>
                <strong className="dashboard-metric-value">{totalClasses}</strong>
              </div>
            </div>
          </section>

          {units.length === 0 ? (
            <p className="dashboard-empty">
              Cadastre unidades e turmas para visualizar o gráfico de inscrições.
            </p>
          ) : (
            <section className="dashboard-chart" aria-label="Gráfico de alunos por unidade e turma">
              {units.map((unit) => (
                <article key={unit.id} className="dashboard-unit-card">
                  <header className="dashboard-unit-header">
                    <div>
                      <h3>{unit.name}</h3>
                      <p>{unit.totalStudents} aluno(s) matriculado(s) nas turmas desta unidade.</p>
                    </div>
                  </header>

                  {Array.isArray(unit.classes) && unit.classes.length > 0 ? (
                    <ul className="dashboard-classes" role="list">
                      {unit.classes.map((klass) => {
                        const percentage = Math.max((klass.totalStudents / chartScale) * 100, klass.totalStudents > 0 ? 8 : 0);
                        return (
                          <li key={klass.id} className="dashboard-class-row">
                            <div className="dashboard-class-label">
                              <span>{klass.name}</span>
                              <span className="dashboard-class-value">{klass.totalStudents}</span>
                            </div>
                            <div className="dashboard-class-bar" aria-label={`${klass.totalStudents} aluno(s) em ${klass.name}`}>
                              <div
                                className="dashboard-class-bar-fill"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="dashboard-unit-empty">Nenhuma turma cadastrada nesta unidade.</p>
                  )}
                </article>
              ))}
            </section>
          )}

          {!hasData && units.length > 0 && (
            <p className="dashboard-empty">
              Ainda não há matrículas registradas. Assim que alunos forem vinculados às turmas, o gráfico será atualizado.
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default DashboardPage;
