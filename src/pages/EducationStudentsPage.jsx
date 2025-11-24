import './EducationStudentsPage.css'
import { Link } from 'react-router-dom'
import { useEducationStudents } from '../hooks/useEducationStudents'
import { formatCpfForDisplay } from '../hooks/useRegistrationForm'

function EducationStudentsPage() {
  const {
    students,
    status,
    errorMessage,
    formState,
    formStatus,
    formMessage,
    handleFormChange,
    saveStudent,
    startEditing,
    cancelEdit,
    editingId,
    isEditing,
    resetForm,
    deleteStudent,
    refresh,
    nextRegistrationCode,
  } = useEducationStudents()

  const handleSubmit = async (event) => {
    event.preventDefault()
    await saveStudent()
  }

  const handleDeleteStudent = async (studentId) => {
    await deleteStudent(studentId)
  }

  const handleEditStudent = (student) => {
    startEditing(student)
  }

  const registrationCodeValue = isEditing
    ? (formState.registrationCode ?? '')
    : (nextRegistrationCode ?? '')

  return (
    <section className="students-page" aria-labelledby="students-title">
      <header className="students-header">
        <div>
          <p className="students-kicker">Rede de ensino</p>
          <h1 id="students-title">Alunos</h1>
          <p>
            Cadastre alunos de forma independente. As inscrições em turmas agora ficam na tela
            <strong> Inscrições</strong>.
          </p>
        </div>
        <button type="button" className="students-refresh" onClick={refresh} disabled={status === 'loading'}>
          {status === 'loading' ? 'Atualizando…' : 'Atualizar dados'}
        </button>
      </header>

      <div className="students-layout">
        <form className="students-form" onSubmit={handleSubmit}>
          <div className="students-form-header">
            <h2>{isEditing ? 'Editar aluno' : 'Novo aluno'}</h2>
            <p>
              {isEditing
                ? 'Atualize os dados do aluno selecionado e salve as alterações.'
                : 'Preencha as informações básicas; depois acesse Inscrições para vincular turmas.'}
            </p>
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
            <p className="students-hint">
              {isEditing
                ? 'A matrícula e as inscrições existentes do aluno serão preservadas.'
                : 'A matrícula é gerada automaticamente como um número sequencial ao cadastrar o aluno.'}
            </p>

            <label className="students-field">
              <span>Matrícula</span>
              <input
                type="text"
                name="registrationCode"
                value={registrationCodeValue}
                readOnly
                placeholder="Gerada automaticamente"
                inputMode="numeric"
              />
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
              <span>CPF</span>
              <input
                type="text"
                name="cpf"
                value={formState.cpf}
                onChange={handleFormChange}
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={14}
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
              {formStatus === 'submitting'
                ? 'Salvando…'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Cadastrar aluno'}
            </button>
            {isEditing ? (
              <button
                type="button"
                className="students-reset"
                onClick={cancelEdit}
                disabled={formStatus === 'submitting'}
              >
                Cancelar edição
              </button>
            ) : (
              <button
                type="button"
                className="students-reset"
                onClick={resetForm}
                disabled={formStatus === 'submitting'}
              >
                Limpar
              </button>
            )}
          </div>
        </form>

        <div className="students-list-card">
          <div className="students-list-header">
            <h2>Alunos cadastrados</h2>
            <p>Acompanhe os dados principais. Para gerenciar vínculos, utilize a tela Inscrições.</p>
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
                <li
                  key={item.id}
                  className={`students-item${editingId === item.id ? ' students-item-editing' : ''}`.trim()}
                >
                  <div className="students-item-header">
                    <div>
                      <strong>{item.name}</strong>
                      {item.registrationCode && (
                        <span className="students-chip">Matrícula: {item.registrationCode}</span>
                      )}
                    </div>
                    <div className="students-item-actions">
                      <Link to="/app/education-enrollments" className="students-manage-link">
                        Gerenciar inscrições
                      </Link>
                      <button type="button" onClick={() => handleEditStudent(item)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => handleDeleteStudent(item.id)}>
                        Remover aluno
                      </button>
                    </div>
                  </div>
                  <dl>
                    {item.registrationCode && (
                      <div>
                        <dt>Matrícula</dt>
                        <dd>{item.registrationCode}</dd>
                      </div>
                    )}
                    {item.cpf && (
                      <div>
                        <dt>CPF</dt>
                        <dd>{formatCpfForDisplay(item.cpf)}</dd>
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
                      <dt>Cadastrado em</dt>
                      <dd>{new Date(item.createdAt).toLocaleString('pt-BR')}</dd>
                    </div>
                  </dl>

                  <div className="students-enrollment-summary">
                    <strong>Turmas vinculadas</strong>
                    {Array.isArray(item.enrollments) && item.enrollments.length > 0 ? (
                      <ul className="students-enrollment-tags">
                        {item.enrollments.map((enrollment) => (
                          <li key={`${item.id}-${enrollment.educationClassId}`}>{enrollment.educationClassName}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="students-enrollment-empty">
                        Nenhuma inscrição registrada. Use a tela Inscrições para adicionar vínculos.
                      </p>
                    )}
                  </div>
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
