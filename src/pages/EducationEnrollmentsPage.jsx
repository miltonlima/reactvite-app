import './EducationEnrollmentsPage.css'
import { useMemo, useState } from 'react'
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

  const handleSelectionChange = (classId, value) => {
    setSelections((prev) => ({
      ...prev,
      [classId]: value,
    }))
    setFeedback((prev) => ({
      ...prev,
      [classId]: prev[classId]?.status === 'error' ? { status: 'idle', message: '' } : prev[classId],
    }))
  }

  const updateFeedback = (classId, statusValue, message) => {
    setFeedback((prev) => ({
      ...prev,
      [classId]: { status: statusValue, message },
    }))
  }

  const handleEnroll = async (classId) => {
    const selectedStudent = selections[classId]
    if (!selectedStudent) {
      updateFeedback(classId, 'error', 'Selecione um aluno para vincular à disciplina.')
      return
    }

    updateFeedback(classId, 'loading', 'Vinculando aluno à disciplina…')

    try {
      await enrollStudent(Number(selectedStudent), Number(classId))
      updateFeedback(classId, 'success', 'Aluno vinculado com sucesso.')
      setSelections((prev) => ({
        ...prev,
        [classId]: '',
      }))
    } catch (error) {
      updateFeedback(
        classId,
        'error',
        error instanceof Error ? error.message : 'Erro inesperado ao vincular o aluno à disciplina.'
      )
    }
  }

  const handleUnenroll = async (classId, studentId) => {
    updateFeedback(classId, 'loading', 'Removendo aluno da disciplina…')

    try {
      await unenrollStudent(Number(studentId), Number(classId))
      updateFeedback(classId, 'success', 'Aluno removido com sucesso.')
    } catch (error) {
      updateFeedback(
        classId,
        'error',
        error instanceof Error ? error.message : 'Erro inesperado ao remover o aluno da disciplina.'
      )
    }
  }

  const classesWithEnrollments = useMemo(() => {
    return classes.map((educationClass) => {
      const enrollmentsForClass = students.reduce((accumulator, student) => {
        const enrollment = Array.isArray(student.enrollments)
          ? student.enrollments.find((entry) => entry.educationClassId === educationClass.id)
          : null

        if (enrollment) {
          accumulator.push({ student, enrollment })
        }

        return accumulator
      }, [])

      enrollmentsForClass.sort((a, b) => a.student.name.localeCompare(b.student.name, 'pt-BR'))

      const availableStudents = students
        .filter((student) => !enrollmentsForClass.some((entry) => entry.student.id === student.id))
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

      return {
        educationClass,
        enrollments: enrollmentsForClass,
        availableStudents,
      }
    })
  }, [classes, students])

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
          <h2>Inscrições por disciplina</h2>
          <p>Gerencie em cada disciplina quais alunos estão vinculados, adicionando ou removendo participantes.</p>
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

        {status === 'loading' && !classes.length ? (
          <p className="enrollments-placeholder">Carregando inscrições…</p>
        ) : classes.length === 0 ? (
          <p className="enrollments-placeholder">Cadastre turmas antes de gerenciar inscrições.</p>
        ) : students.length === 0 ? (
          <p className="enrollments-placeholder">Cadastre alunos antes de vincular disciplinas.</p>
        ) : (
          <ul className="enrollments-list">
            {classesWithEnrollments.map(({ educationClass, enrollments: classEnrollments, availableStudents }) => {
              const classFeedback = feedback[educationClass.id]
              const selection = selections[educationClass.id] ?? ''
              const subtitle =
                classEnrollments.length === 0
                  ? 'Nenhum aluno vinculado'
                  : classEnrollments.length === 1
                    ? '1 aluno vinculado'
                    : `${classEnrollments.length} alunos vinculados`

              return (
                <li key={educationClass.id} className="enrollments-item">
                  <header className="enrollments-item-header">
                    <div>
                      <strong>{educationClass.name}</strong>
                      <span className="enrollments-chip">Unidade: {educationClass.educationUnitName}</span>
                      {educationClass.scheduledTime && (
                        <span className="enrollments-chip">Horário: {educationClass.scheduledTime}</span>
                      )}
                    </div>
                    <span className="enrollments-subtitle">{subtitle}</span>
                  </header>

                  <div className="enrollments-item-body">
                    {classEnrollments.length > 0 ? (
                      <ul className="enrollments-current-list">
                        {classEnrollments.map(({ student, enrollment }) => (
                          <li key={`${educationClass.id}-${student.id}`}>
                            <div>
                              <strong>{student.name}</strong>
                              {student.registrationCode && (
                                <span>Matrícula: {student.registrationCode}</span>
                              )}
                              <span className="enrollments-date">
                                Vinculado em {new Date(enrollment.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUnenroll(educationClass.id, student.id)}
                              disabled={classFeedback?.status === 'loading'}
                            >
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="enrollments-empty">Nenhum aluno vinculado a esta disciplina.</p>
                    )}
                  </div>

                  <div className="enrollments-actions">
                    <label htmlFor={`enrollments-select-class-${educationClass.id}`}>Adicionar aluno</label>
                    <div className="enrollments-row">
                      <select
                        id={`enrollments-select-class-${educationClass.id}`}
                        value={selection}
                        onChange={(event) => handleSelectionChange(educationClass.id, event.target.value)}
                        disabled={availableStudents.length === 0 || classFeedback?.status === 'loading'}
                      >
                        <option value="">Selecione um aluno</option>
                        {availableStudents.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name}
                            {student.registrationCode ? ` — Matrícula ${student.registrationCode}` : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleEnroll(educationClass.id)}
                        disabled={!selection || classFeedback?.status === 'loading'}
                      >
                        {classFeedback?.status === 'loading' ? 'Processando…' : 'Adicionar'}
                      </button>
                    </div>

                    {availableStudents.length === 0 && students.length > 0 && (
                      <p className="enrollments-hint">
                        Todos os alunos cadastrados já estão vinculados a esta disciplina.
                      </p>
                    )}

                    {classFeedback?.message && (
                      <p
                        className={`enrollments-feedback ${
                          classFeedback?.status === 'error' ? 'enrollments-feedback-error' : ''
                        } ${
                          classFeedback?.status === 'success' ? 'enrollments-feedback-success' : ''
                        }`.trim()}
                      >
                        {classFeedback.message}
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
