import './EducationClassesPage.css'
import { useEducationClasses } from '../hooks/useEducationClasses'

const AVAILABLE_SCHEDULE_TIMES = Array.from({ length: 16 }, (_, index) => `${String(7 + index).padStart(2, '0')}:00`)

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
    saveClass,
    resetForm,
    startEditing,
    cancelEdit,
    editingId,
    isEditing,
    nextCode,
    deleteClass,
    refresh,
  } = useEducationClasses()

  const handleSubmit = async (event) => {
    event.preventDefault()
    await saveClass()
  }

  const handleEditClass = (item) => {
    startEditing(item)
  }

  const codeFieldValue = isEditing ? (formState.code ?? '') : (nextCode ? String(nextCode) : '')
  const formatDate = (value) => {
    if (!value) {
      return null
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return null
    }

    return parsed.toLocaleDateString('pt-BR')
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
            <h2>{isEditing ? 'Editar turma' : 'Nova turma'}</h2>
            <p>
              {isEditing
                ? 'Altere os dados da turma selecionada e confirme para salvar as mudanças.'
                : 'Informe os dados básicos e selecione a unidade a que a turma pertence.'}
            </p>
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
            <p className="classes-hint">
              O código da turma é gerado automaticamente em ordem sequencial.
            </p>

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
                value={codeFieldValue}
                readOnly
                placeholder="Gerado automaticamente"
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

            <label className="classes-field">
              <span>Data de início</span>
              <input
                type="date"
                name="startDate"
                value={formState.startDate}
                onChange={handleFormChange}
              />
            </label>

            <label className="classes-field">
              <span>Data de fim</span>
              <input
                type="date"
                name="endDate"
                value={formState.endDate}
                onChange={handleFormChange}
                min={formState.startDate || undefined}
              />
            </label>

            <label className="classes-field">
              <span>Horário</span>
              <select
                name="scheduleTime"
                value={formState.scheduleTime}
                onChange={handleFormChange}
              >
                <option value="">Selecione um horário</option>
                {AVAILABLE_SCHEDULE_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>

            <label className="classes-field">
              <span>Vagas disponíveis *</span>
              <input
                type="number"
                min={1}
                step={1}
                name="capacity"
                value={formState.capacity}
                onChange={handleFormChange}
                placeholder="Quantidade de vagas"
                inputMode="numeric"
                required
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
              {formStatus === 'submitting'
                ? 'Salvando…'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Cadastrar turma'}
            </button>
            {isEditing ? (
              <button
                type="button"
                className="classes-reset"
                onClick={cancelEdit}
                disabled={formStatus === 'submitting'}
              >
                Cancelar edição
              </button>
            ) : (
              <button
                type="button"
                className="classes-reset"
                onClick={resetForm}
                disabled={formStatus === 'submitting'}
              >
                Limpar
              </button>
            )}
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
                <li
                  key={item.id}
                  className={`classes-item${editingId === item.id ? ' classes-item-editing' : ''}`.trim()}
                >
                  <div className="classes-item-header">
                    <div>
                      <strong>{item.name}</strong>
                      <span className="classes-chip">Unidade: {item.educationUnitName}</span>
                      {typeof item.capacity === 'number' && (
                        <span className="classes-chip">Vagas: {item.capacity}</span>
                      )}
                    </div>
                    <div className="classes-item-actions">
                      <button type="button" onClick={() => handleEditClass(item)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => deleteClass(item.id)}>
                        Remover
                      </button>
                    </div>
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
                    {(item.startDate || item.endDate) && (
                      <div>
                        <dt>Período</dt>
                        <dd>
                          {formatDate(item.startDate) ?? '—'}
                          {' '}até{' '}
                          {formatDate(item.endDate) ?? '—'}
                        </dd>
                      </div>
                    )}
                    {item.scheduledTime && (
                      <div>
                        <dt>Horário</dt>
                        <dd>{item.scheduledTime}</dd>
                      </div>
                    )}
                    {typeof item.capacity === 'number' && (
                      <div>
                        <dt>Vagas disponíveis</dt>
                        <dd>{item.capacity}</dd>
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
