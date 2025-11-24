import './EducationUnitsPage.css'
import { useEducationUnits } from '../hooks/useEducationUnits'

function EducationUnitsPage() {
  const {
    items,
    status,
    errorMessage,
    formState,
    formStatus,
    formMessage,
    handleFormChange,
    saveUnit,
    resetForm,
    startEditing,
    cancelEdit,
    editingId,
    isEditing,
    deleteUnit,
    refresh,
  } = useEducationUnits()

  const handleSubmit = async (event) => {
    event.preventDefault()
    await saveUnit()
  }

  const handleEditUnit = (unit) => {
    startEditing(unit)
  }

  return (
    <section className="units-page" aria-labelledby="units-title">
      <header className="units-header">
        <div>
          <p className="units-kicker">Gestão acadêmica</p>
          <h1 id="units-title">Unidades de ensino</h1>
          <p>Cadastre as unidades que farão parte da rede. Depois você pode vincular turmas e alunos a cada unidade.</p>
        </div>
        <button type="button" className="units-refresh" onClick={refresh} disabled={status === 'loading'}>
          {status === 'loading' ? 'Atualizando…' : 'Atualizar lista'}
        </button>
      </header>

      <div className="units-layout">
        <form className="units-form" onSubmit={handleSubmit}>
          <div className="units-form-header">
            <h2>{isEditing ? 'Editar unidade' : 'Nova unidade'}</h2>
            <p>
              {isEditing
                ? 'Atualize as informações da unidade selecionada e salve as alterações.'
                : 'Informe os dados essenciais para identificar esta unidade dentro da rede de ensino.'}
            </p>
          </div>

          {formMessage && (
            <div
              role="status"
              className={`units-alert ${formStatus === 'success' ? 'units-alert-success' : ''} ${formStatus === 'error' ? 'units-alert-error' : ''}`.trim()}
            >
              {formMessage}
            </div>
          )}

          <div className="units-grid">
            <label className="units-field units-field-full">
              <span>Nome da unidade *</span>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleFormChange}
                placeholder="Ex.: Escola Municipal Aurora"
                required
              />
            </label>

            <label className="units-field">
              <span>Código *</span>
              <input
                type="text"
                name="code"
                value={formState.code}
                onChange={handleFormChange}
                placeholder="Código interno ou INEP"
                required
              />
            </label>

            <label className="units-field">
              <span>Cidade</span>
              <input
                type="text"
                name="city"
                value={formState.city}
                onChange={handleFormChange}
                placeholder="Cidade"
              />
            </label>

            <label className="units-field">
              <span>Estado</span>
              <input
                type="text"
                name="state"
                value={formState.state}
                onChange={handleFormChange}
                placeholder="Estado"
              />
            </label>

            <label className="units-field units-field-full">
              <span>Descrição</span>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleFormChange}
                placeholder="Informações adicionais, como etapa de ensino ou detalhes administrativos."
                rows={4}
              />
            </label>
          </div>

          <div className="units-actions">
            <button type="submit" disabled={formStatus === 'submitting'}>
              {formStatus === 'submitting'
                ? 'Salvando…'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Cadastrar unidade'}
            </button>
            {isEditing ? (
              <button
                type="button"
                className="units-reset"
                onClick={cancelEdit}
                disabled={formStatus === 'submitting'}
              >
                Cancelar edição
              </button>
            ) : (
              <button
                type="button"
                className="units-reset"
                onClick={resetForm}
                disabled={formStatus === 'submitting'}
              >
                Limpar formulário
              </button>
            )}
          </div>
        </form>

        <div className="units-list-card">
          <div className="units-list-header">
            <h2>Unidades cadastradas</h2>
            <p>Visualize as unidades já registradas e mantenha as informações atualizadas.</p>
          </div>

          {status === 'error' && (
            <div className="units-alert units-alert-error" role="alert">
              {errorMessage || 'Não foi possível carregar as unidades.'}
            </div>
          )}

          {status === 'loading' && !items.length ? (
            <p className="units-placeholder">Carregando unidades…</p>
          ) : items.length === 0 ? (
            <p className="units-placeholder">Nenhuma unidade cadastrada até o momento.</p>
          ) : (
            <ul className="units-list">
              {items.map((unit) => (
                <li
                  key={unit.id}
                  className={`units-item${editingId === unit.id ? ' units-item-editing' : ''}`.trim()}
                >
                  <div className="units-item-header">
                    <div>
                      <strong>{unit.name}</strong>
                      <span className="units-chip">Código {unit.code}</span>
                    </div>
                    <div className="units-item-actions">
                      <button type="button" onClick={() => handleEditUnit(unit)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => deleteUnit(unit.id)}>
                        Remover
                      </button>
                    </div>
                  </div>
                  <dl>
                    {(unit.city || unit.state) && (
                      <div>
                        <dt>Localização</dt>
                        <dd>
                          {[unit.city, unit.state].filter(Boolean).join(' / ')}
                        </dd>
                      </div>
                    )}
                    {unit.description && (
                      <div>
                        <dt>Descrição</dt>
                        <dd>{unit.description}</dd>
                      </div>
                    )}
                    <div>
                      <dt>Criada em</dt>
                      <dd>{new Date(unit.createdAt).toLocaleString('pt-BR')}</dd>
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

export default EducationUnitsPage
