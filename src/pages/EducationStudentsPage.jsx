import './EducationStudentsPage.css'
import { useEducationStudents } from '../hooks/useEducationStudents'

function EducationStudentsPage() {
  const {
    classes,
    students,
    status,
    errorMessage,
    formState,
    formStatus,
    formMessage,
    handleFormChange,
    createStudent,
    resetForm,
    deleteStudent,
    refresh,
  } = useEducationStudents()

  const handleSubmit = async (event) => {
    event.preventDefault()
    await createStudent()
  }

  return (
    <section className="students-page" aria-labelledby="students-title">
      <header className="students-header">
        <div>
          <p className="students-kicker">Rede de ensino</p>
          <h1 id="students-title">Alunos</h1>
          <p>Inscreva alunos nas turmas existentes, mantendo um histórico dos responsáveis, dados de contato e observações importantes.</p>
        </div>
        <button type="button" className="students-refresh" onClick={refresh} disabled={status === 'loading'}>
          {status === 'loading' ? 'Atualizando…' : 'Atualizar dados'}
        </button>
      </header>

      <div className="students-layout">
        <form className="students-form" onSubmit={handleSubmit}>
          <div className="students-form-header">
            <h2>Nova inscrição</h2>
            <p>Preencha as informações básicas do aluno e vincule a turma desejada.</p>
          </div>

          {formMessage && (
            <div
              role="status"
              className={`students-alert ${formStatus === 'success' ? 'students-alert-success' : ''} ${formStatus === 'error' ? 'students-alert-error' : ''}`.trim()}
            >
              {formMessage}
            </div>
          )}

          <div className="students-grid">
            <label className="students-field students-field-full">
              <span>Turma *</span>
              <select
                name="educationClassId"
                value={formState.educationClassId}
                onChange={handleFormChange}
                required
              >
                <option value="">Selecione uma turma</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.educationUnitName}
                  </option>
                ))}
              </select>
            </label>

            <label className="students-field students-field-full">
              <span>Nome do aluno *</span>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleFormChange}
                placeholder="Nome completo"
                required
              />
            </label>

            <label className="students-field">
              <span>Código de matrícula</span>
              <input
                type="text"
                name="registrationCode"
                value={formState.registrationCode}
                onChange={handleFormChange}
                placeholder="Identificador interno"
              />
            </label>

            <label className="students-field">
              <span>Data de nascimento</span>
              <input
                type="date"
                name="birthDate"
                value={formState.birthDate}
                onChange={handleFormChange}
              />
            </label>

            <label className="students-field">
              <span>Responsável</span>
              <input
                type="text"
                name="guardianName"
                value={formState.guardianName}
                onChange={handleFormChange}
                placeholder="Nome do responsável"
              />
            </label>

            <label className="students-field">
              <span>Contato do responsável</span>
              <input
                type="text"
                name="guardianContact"
                value={formState.guardianContact}
                onChange={handleFormChange}
                placeholder="Telefone, email, etc."
              />
            </label>

            <label className="students-field students-field-full">
              <span>Observações</span>
              <textarea
                name="notes"
                value={formState.notes}
                onChange={handleFormChange}
                placeholder="Observações gerais, restrições alimentares, necessidades especiais, etc."
                rows={4}
              />
            </label>
          </div>

          <div className="students-actions">
            <button type="submit" disabled={formStatus === 'submitting'}>
              {formStatus === 'submitting' ? 'Salvando…' : 'Cadastrar aluno'}
            </button>
            <button type="button" className="students-reset" onClick={resetForm} disabled={formStatus === 'submitting'}>
              Limpar
            </button>
          </div>
        </form>

        <div className="students-list-card">
          <div className="students-list-header">
            <h2>Alunos inscritos</h2>
            <p>Confira a distribuição de alunos por turma e mantenha os cadastros atualizados.</p>
          </div>

          {status === 'error' && (
            <div className="students-alert students-alert-error" role="alert">
              {errorMessage || 'Não foi possível carregar os alunos inscritos.'}
            </div>
          )}

          {status === 'loading' && !students.length ? (
            <p className="students-placeholder">Carregando alunos…</p>
          ) : students.length === 0 ? (
            <p className="students-placeholder">Nenhum aluno inscrito até o momento.</p>
          ) : (
            <ul className="students-list">
              {students.map((item) => (
                <li key={item.id} className="students-item">
                  <div className="students-item-header">
                    <div>
                      <strong>{item.name}</strong>
                      <span className="students-chip">Turma: {item.educationClassName}</span>
                      <span className="students-chip">Unidade: {item.educationUnitName}</span>
                    </div>
                    <button type="button" onClick={() => deleteStudent(item.id)}>
                      Remover
                    </button>
                  </div>
                  <dl>
                    {item.registrationCode && (
                      <div>
                        <dt>Matrícula</dt>
                        <dd>{item.registrationCode}</dd>
                      </div>
                    )}
                    {item.birthDate && (
                      <div>
                        <dt>Nascimento</dt>
                        <dd>{new Date(item.birthDate).toLocaleDateString('pt-BR')}</dd>
                      </div>
                    )}
                    {item.guardianName && (
                      <div>
                        <dt>Responsável</dt>
                        <dd>{item.guardianName}</dd>
                      </div>
                    )}
                    {item.guardianContact && (
                      <div>
                        <dt>Contato</dt>
                        <dd>{item.guardianContact}</dd>
                      </div>
                    )}
                    {item.notes && (
                      <div>
                        <dt>Observações</dt>
                        <dd>{item.notes}</dd>
                      </div>
                    )}
                    <div>
                      <dt>Inscrito em</dt>
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

export default EducationStudentsPage
