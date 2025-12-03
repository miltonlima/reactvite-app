import './EducationStudentsPage.css'
import { useEffect, useMemo, useState } from 'react'
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

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students) || students.length === 0) {
      return []
    }

    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return students
    }

    const numericQuery = query.replace(/[^0-9]/g, '')

    return students.filter((student) => {
      const nameMatch = (student.name ?? '').toLowerCase().includes(query)
      const registration = (student.registrationCode ?? '').toLowerCase()
      const registrationMatch = registration.includes(query)

      const cpfDigits = (student.cpf ?? '').replace(/[^0-9]/g, '')
      const registrationDigits = registration.replace(/[^0-9]/g, '')

      const cpfMatch = numericQuery ? cpfDigits.includes(numericQuery) : false
      const registrationNumericMatch = numericQuery ? registrationDigits.includes(numericQuery) : false

      return nameMatch || registrationMatch || cpfMatch || registrationNumericMatch
    })
  }, [searchTerm, students])

  const hasSearch = searchTerm.trim().length > 0
  const totalStudents = students.length
  const resultsCount = filteredStudents.length

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const formatDate = (value) => {
    if (!value) {
      return '—'
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return '—'
    }

    return parsed.toLocaleDateString('pt-BR')
  }

  const formatDateTime = (value) => {
    if (!value) {
      return '—'
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return '—'
    }

    return parsed.toLocaleString('pt-BR')
  }

  const formatCpf = (value) => {
    if (!value) {
      return '—'
    }

    return formatCpfForDisplay(value)
  }

  const openStudentModal = (student) => {
    setSelectedStudent(student)
  }

  const closeStudentModal = () => {
    setSelectedStudent(null)
  }

  const handleRowKeyDown = (event, student) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openStudentModal(student)
    }
  }

  const handleRowClick = (event, student) => {
    if (event.target.closest('a, button')) {
      return
    }

    openStudentModal(student)
  }

  useEffect(() => {
    if (!selectedStudent) {
      return
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeStudentModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedStudent])

  const handleClearSearch = () => {
    setSearchTerm('')
  }

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

          <div className="students-list-controls" role="search">
            <div className="students-search">
              <label htmlFor="students-search">Buscar aluno</label>
              <input
                id="students-search"
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Digite nome, CPF ou matrícula"
                autoComplete="off"
              />
            </div>
            <div className="students-search-meta">
              <span>
                {resultsCount === totalStudents
                  ? `${resultsCount} ${resultsCount === 1 ? 'aluno' : 'alunos'} cadastrados`
                  : `${resultsCount} de ${totalStudents} alunos`}
              </span>
              {hasSearch && (
                <button type="button" className="students-clear-search" onClick={handleClearSearch}>
                  Limpar busca
                </button>
              )}
            </div>
          </div>

          {status === 'error' && (
            <div className="students-alert students-alert-error" role="alert">
              {errorMessage || 'Não foi possível carregar os alunos inscritos.'}
            </div>
          )}

          {status === 'loading' && !students.length ? (
            <p className="students-placeholder">Carregando alunos…</p>
          ) : resultsCount === 0 ? (
            <p className="students-placeholder">
              {hasSearch ? 'Nenhum aluno encontrado para a busca informada.' : 'Nenhum aluno inscrito até o momento.'}
            </p>
          ) : (
            <div className="students-table-wrapper" role="region" aria-live="polite">
              <table className="students-table">
                <colgroup>
                  <col className="students-col-name" />
                  <col className="students-col-registration" />
                  <col className="students-col-cpf" />
                  <col className="students-col-birth" />
                  <col className="students-col-created" />
                  <col className="students-col-classes" />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">Matrícula</th>
                    <th scope="col">CPF</th>
                    <th scope="col">Nascimento</th>
                    <th scope="col">Cadastrado em</th>
                    <th scope="col">Turmas vinculadas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const enrollmentNames = Array.isArray(student.enrollments)
                      ? student.enrollments.map((enrollment) => enrollment.educationClassName).filter(Boolean)
                      : []

                    return (
                      <tr
                        key={student.id}
                        onClick={(event) => handleRowClick(event, student)}
                        onKeyDown={(event) => handleRowKeyDown(event, student)}
                        role="button"
                        tabIndex={0}
                        className={editingId === student.id ? 'students-row-editing' : undefined}
                      >
                        <td data-title="Nome">{student.name}</td>
                        <td data-title="Matrícula">{student.registrationCode ?? '—'}</td>
                        <td data-title="CPF">{formatCpf(student.cpf)}</td>
                        <td data-title="Nascimento">{formatDate(student.birthDate)}</td>
                        <td data-title="Cadastrado em">{formatDateTime(student.createdAt)}</td>
                        <td data-title="Turmas vinculadas" className="students-table-classes">
                          {enrollmentNames.length > 0 ? enrollmentNames.join(', ') : 'Nenhuma turma'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedStudent && (
        <div
          className="students-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeStudentModal()
            }
          }}
        >
          <div className="students-modal">
            <header className="students-modal-header">
              <div>
                <p className="students-modal-chip">Aluno</p>
                <h3 id="student-modal-title">{selectedStudent.name}</h3>
                {selectedStudent.registrationCode && (
                  <p className="students-modal-subtitle">Matrícula {selectedStudent.registrationCode}</p>
                )}
              </div>
              <button type="button" className="students-modal-close" onClick={closeStudentModal} aria-label="Fechar">
                ×
              </button>
            </header>

            <div className="students-modal-body">
              <dl className="students-modal-details">
                <div>
                  <dt>CPF</dt>
                  <dd>{formatCpf(selectedStudent.cpf)}</dd>
                </div>
                <div>
                  <dt>Data de nascimento</dt>
                  <dd>{formatDate(selectedStudent.birthDate)}</dd>
                </div>
                <div>
                  <dt>Responsável</dt>
                  <dd>{selectedStudent.guardianName || '—'}</dd>
                </div>
                <div>
                  <dt>Contato do responsável</dt>
                  <dd>{selectedStudent.guardianContact || '—'}</dd>
                </div>
                <div className="students-modal-full">
                  <dt>Observações</dt>
                  <dd>{selectedStudent.notes || '—'}</dd>
                </div>
                <div>
                  <dt>Cadastrado em</dt>
                  <dd>{formatDateTime(selectedStudent.createdAt)}</dd>
                </div>
              </dl>

              <section className="students-modal-enrollments" aria-label="Turmas vinculadas">
                <header>
                  <h4>Turmas vinculadas</h4>
                  <Link to="/app/education-enrollments" onClick={closeStudentModal}>
                    Gerenciar inscrições
                  </Link>
                </header>
                {Array.isArray(selectedStudent.enrollments) && selectedStudent.enrollments.length > 0 ? (
                  <ul>
                    {selectedStudent.enrollments.map((enrollment) => (
                      <li key={`${selectedStudent.id}-${enrollment.educationClassId}`}>
                        <strong>{enrollment.educationClassName}</strong>
                        <span>{enrollment.educationUnitName}</span>
                        <span>Desde {formatDate(enrollment.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhuma turma vinculada ainda.</p>
                )}
              </section>
            </div>

            <footer className="students-modal-actions">
              <button type="button" onClick={() => { handleEditStudent(selectedStudent); closeStudentModal() }}>
                Editar cadastro
              </button>
              <button
                type="button"
                className="students-modal-remove"
                onClick={async () => {
                  await handleDeleteStudent(selectedStudent.id)
                  closeStudentModal()
                }}
              >
                Remover aluno
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  )
}

export default EducationStudentsPage
