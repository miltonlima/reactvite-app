import './EducationClassesPage.css'
import { useEducationClasses } from '../hooks/useEducationClasses'

function EducationClassesPage() {
  const {
    units,
    classes,
    status,
    errorMessage,
    formState,
    formStatus,
    formMessage,
    handleFormChange,
    createClass,
    resetForm,
    deleteClass,
    refresh,
  } = useEducationClasses()

  const handleSubmit = async (event) => {
    event.preventDefault()
    await createClass()
  }

  return (
    <section className="classes-page" aria-labelledby="classes-title">
      <header className="classes-header">
        <div>
          <p className="classes-kicker">Rede de ensino</p>
          <h1 id="classes-title">Turmas</h1>
          <p>Cadastre turmas e vincule-as às unidades de ensino existentes. Depois você poderá associar alunos e professores a cada turma.</p>
        </div>
        <button type="button" className="classes-refresh" onClick={refresh} disabled={status === 'loading'}>
          {status === 'loading' ? 'Atualizando…' : 'Atualizar dados'}
        </button>
      </header>

      <div className="classes-layout">
        <form className="classes-form" onSubmit={handleSubmit}>
          <div className="classes-form-header">
            <h2>Nova turma</h2>
            <p>Informe os dados básicos e selecione a unidade a que a turma pertence.</p>
          </div>

          {formMessage && (
            <div
              role="status"
              className={`classes-alert ${formStatus === 'success' ? 'classes-alert-success' : ''} ${formStatus === 'error' ? 'classes-alert-error' : ''}`.trim()}
            >
              {formMessage}
            </div>
          )}

          <div className="classes-grid">
            <label className="classes-field classes-field-full">
              <span>Unidade *</span>
              <select
                name="educationUnitId"
                value={formState.educationUnitId}
                onChange={handleFormChange}
                required
              >
                <option value="">Selecione uma unidade</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="classes-field classes-field-full">
              <span>Nome da turma *</span>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleFormChange}
                placeholder="Ex.: 7º Ano A"
                required
              />
            </label>

            <label className="classes-field">
              <span>Código</span>
              <input
                type="text"
                name="code"
                value={formState.code}
                onChange={handleFormChange}
                placeholder="Identificador interno"
              />
            </label>

            <label className="classes-field">
              <span>Ano/Etapa</span>
              <input
                type="text"
                name="academicYear"
                value={formState.academicYear}
                onChange={handleFormChange}
                placeholder="2025 / Ensino Fundamental"
              />
            </label>

            <label className="classes-field classes-field-full">
              <span>Descrição</span>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleFormChange}
                placeholder="Observações gerais, turno, componentes curriculares, etc."
                rows={4}
              />
            </label>
          </div>

          <div className="classes-actions">
            <button type="submit" disabled={formStatus === 'submitting'}>
              {formStatus === 'submitting' ? 'Salvando…' : 'Cadastrar turma'}
            </button>
            <button type="button" className="classes-reset" onClick={resetForm} disabled={formStatus === 'submitting'}>
              Limpar
            </button>
          </div>
        </form>

        <div className="classes-list-card">
          <div className="classes-list-header">
            <h2>Turmas cadastradas</h2>
            <p>Gerencie as turmas existentes e mantenha as informações atualizadas.</p>
          </div>

          {status === 'error' && (
            <div className="classes-alert classes-alert-error" role="alert">
              {errorMessage || 'Não foi possível carregar as turmas.'}
            </div>
          )}

          {status === 'loading' && !classes.length ? (
            <p className="classes-placeholder">Carregando turmas…</p>
          ) : classes.length === 0 ? (
            <p className="classes-placeholder">Nenhuma turma cadastrada até o momento.</p>
          ) : (
            <ul className="classes-list">
              {classes.map((item) => (
                <li key={item.id} className="classes-item">
                  <div className="classes-item-header">
                    <div>
                      <strong>{item.name}</strong>
                      <span className="classes-chip">Unidade: {item.educationUnitName}</span>
                    </div>
                    <button type="button" onClick={() => deleteClass(item.id)}>
                      Remover
                    </button>
                  </div>
                  <dl>
                    {item.code && (
                      <div>
                        <dt>Código</dt>
                        <dd>{item.code}</dd>
                      </div>
                    )}
                    {item.academicYear && (
                      <div>
                        <dt>Ano/Etapa</dt>
                        <dd>{item.academicYear}</dd>
                      </div>
                    )}
                    {item.description && (
                      <div>
                        <dt>Descrição</dt>
                        <dd>{item.description}</dd>
                      </div>
                    )}
                    <div>
                      <dt>Criada em</dt>
                      <dd>{new Date(item.createdAt).toLocaleString('pt-BR')}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default EducationClassesPage
