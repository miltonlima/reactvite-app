import './EducationEnrollmentsPage.css'
import { useState } from 'react'
import { useEducationStudents } from '../hooks/useEducationStudents'

function EducationEnrollmentsPage() {
  const [selections, setSelections] = useState({})
  const [feedback, setFeedback] = useState({})
  const {
    classes,
    students,
    status,
    errorMessage,
    enrollStudent,
    unenrollStudent,
    refresh,
  } = useEducationStudents()

  const handleSelectionChange = (studentId, value) => {
    setSelections((prev) => ({
      ...prev,
      [studentId]: value,
    }))
    setFeedback((prev) => ({
      ...prev,
      [studentId]: prev[studentId]?.status === 'error' ? { status: 'idle', message: '' } : prev[studentId],
    }))
  }

  const updateFeedback = (studentId, statusValue, message) => {
    setFeedback((prev) => ({
      ...prev,
      [studentId]: { status: statusValue, message },
    }))
  }

  const handleEnroll = async (studentId) => {
    const selectedClass = selections[studentId]
    if (!selectedClass) {
      updateFeedback(studentId, 'error', 'Selecione uma turma para vincular o aluno.')
      return
    }

    updateFeedback(studentId, 'loading', 'Vinculando aluno à turma…')

    try {
      await enrollStudent(studentId, Number(selectedClass))
      updateFeedback(studentId, 'success', 'Turma adicionada com sucesso.')
      setSelections((prev) => ({
        ...prev,
        [studentId]: '',
      }))
    } catch (error) {
      updateFeedback(
        studentId,
        'error',
        error instanceof Error ? error.message : 'Erro inesperado ao vincular o aluno à turma.'
      )
    }
  }

  const handleUnenroll = async (studentId, classId) => {
    updateFeedback(studentId, 'loading', 'Removendo turma do aluno…')

    try {
      await unenrollStudent(studentId, classId)
      updateFeedback(studentId, 'success', 'Turma removida com sucesso.')
    } catch (error) {
      updateFeedback(
        studentId,
        'error',
        error instanceof Error ? error.message : 'Erro inesperado ao remover a turma do aluno.'
      )
    }
  }

  return (
    <section className="enrollments-page" aria-labelledby="enrollments-title">
      <header className="enrollments-header">
        <div>
          <p className="enrollments-kicker">Rede de ensino</p>
          <h1 id="enrollments-title">Inscrições</h1>
          <p>Gerencie o vínculo entre alunos e turmas, adicionando ou removendo inscrições conforme necessário.</p>
        </div>
        <button type="button" className="enrollments-refresh" onClick={refresh} disabled={status === 'loading'}>
          {status === 'loading' ? 'Atualizando…' : 'Atualizar dados'}
        </button>
      </header>

      <div className="enrollments-card">
        <div className="enrollments-card-header">
          <h2>Inscrições por aluno</h2>
          <p>
            Use os controles abaixo para vincular alunos às turmas disponíveis ou remover inscrições já registradas.
          </p>
        </div>

        {classes.length === 0 && (
          <div className="enrollments-alert" role="alert">
            Cadastre ao menos uma turma para poder realizar inscrições.
          </div>
        )}

        {status === 'error' && (
          <div className="enrollments-alert enrollments-alert-error" role="alert">
            {errorMessage || 'Não foi possível carregar as inscrições.'}
          </div>
        )}

        {status === 'loading' && !students.length ? (
          <p className="enrollments-placeholder">Carregando inscrições…</p>
        ) : students.length === 0 ? (
          <p className="enrollments-placeholder">Cadastre alunos antes de gerenciar inscrições.</p>
        ) : (
          <ul className="enrollments-list">
            {students.map((student) => {
              const enrollments = Array.isArray(student.enrollments) ? student.enrollments : []
              const availableClasses = classes.filter(
                (educationClass) =>
                  !enrollments.some((enrollment) => enrollment.educationClassId === educationClass.id)
              )
              const studentFeedback = feedback[student.id]
              const selection = selections[student.id] ?? ''
              const subtitle =
                enrollments.length === 0
                  ? 'Nenhuma turma vinculada'
                  : enrollments.length === 1
                    ? '1 turma vinculada'
                    : `${enrollments.length} turmas vinculadas`

              return (
                <li key={student.id} className="enrollments-item">
                  <header className="enrollments-item-header">
                    <div>
                      <strong>{student.name}</strong>
                      {student.registrationCode && (
                        <span className="enrollments-chip">Matrícula: {student.registrationCode}</span>
                      )}
                    </div>
                    <span className="enrollments-subtitle">{subtitle}</span>
                  </header>

                  <div className="enrollments-item-body">
                    {enrollments.length > 0 ? (
                      <ul className="enrollments-current-list">
                        {enrollments.map((enrollment) => (
                          <li key={`${student.id}-${enrollment.educationClassId}`}>
                            <div>
                              <strong>{enrollment.educationClassName}</strong>
                              <span>{enrollment.educationUnitName}</span>
                              <span className="enrollments-date">
                                Inscrito em {new Date(enrollment.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUnenroll(student.id, enrollment.educationClassId)}
                              disabled={studentFeedback?.status === 'loading'}
                            >
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="enrollments-empty">Nenhuma inscrição registrada para este aluno.</p>
                    )}
                  </div>

                  <div className="enrollments-actions">
                    <label htmlFor={`enrollments-select-${student.id}`}>Adicionar turma</label>
                    <div className="enrollments-row">
                      <select
                        id={`enrollments-select-${student.id}`}
                        value={selection}
                        onChange={(event) => handleSelectionChange(student.id, event.target.value)}
                        disabled={availableClasses.length === 0 || studentFeedback?.status === 'loading'}
                      >
                        <option value="">Selecione uma turma</option>
                        {availableClasses.map((educationClass) => (
                          <option key={educationClass.id} value={educationClass.id}>
                            {educationClass.name} — {educationClass.educationUnitName}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleEnroll(student.id)}
                        disabled={!selection || studentFeedback?.status === 'loading'}
                      >
                        {studentFeedback?.status === 'loading' ? 'Processando…' : 'Adicionar'}
                      </button>
                    </div>

                    {availableClasses.length === 0 && classes.length > 0 && (
                      <p className="enrollments-hint">
                        Todas as turmas disponíveis já estão vinculadas a este aluno.
                      </p>
                    )}

                    {studentFeedback?.message && (
                      <p
                        className={`enrollments-feedback ${
                          studentFeedback?.status === 'error' ? 'enrollments-feedback-error' : ''
                        } ${
                          studentFeedback?.status === 'success' ? 'enrollments-feedback-success' : ''
                        }`.trim()}
                      >
                        {studentFeedback.message}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export default EducationEnrollmentsPage
