import './EducationGradesPage.css'
import { useMemo } from 'react'
import { useEducationGrades } from '../hooks/useEducationGrades'

function EducationGradesPage() {
  const {
    classes,
    selectedClassId,
    selectClass,
    status,
    errorMessage,
    grades,
    draftGrades,
    handleGradeChange,
    saveStudentGrades,
    resetStudentGrades,
    feedback,
    savingIds,
    refresh,
    calculateAverage,
  } = useEducationGrades()

  const selectedClassName = useMemo(() => {
    const current = classes.find((item) => String(item.id) === String(selectedClassId))
    return current?.name ?? ''
  }, [classes, selectedClassId])

  const handleClassChange = (event) => {
    selectClass(event.target.value)
  }

  const handleGradeInputChange = (studentId, field) => (event) => {
    handleGradeChange(studentId, field, event.target.value)
  }

  const handleSubmit = (studentId) => async (event) => {
    event.preventDefault()
    await saveStudentGrades(studentId)
  }

  const handleReset = (studentId) => (event) => {
    event.preventDefault()
    resetStudentGrades(studentId)
  }

  const renderAverage = (studentId) => {
    const draft = draftGrades[studentId]
    const average = draft ? calculateAverage(draft) : null
    if (average === null) {
      return '—'
    }

    return average.toFixed(2)
  }

  return (
    <section className="grades-page page-shell" aria-labelledby="grades-title">
      <header className="grades-header">
        <div>
          <p className="grades-kicker">Rede de ensino</p>
          <h1 id="grades-title">Notas</h1>
          <p>Registre e atualize as notas por turma, acompanhando automaticamente a média final de cada aluno.</p>
        </div>
        <button type="button" className="grades-refresh" onClick={refresh} disabled={status === 'loading'}>
          {status === 'loading' ? 'Atualizando…' : 'Atualizar dados'}
        </button>
      </header>

      <form className="grades-form">
        <div className="grades-form-header">
          <h2>Selecione uma turma</h2>
          <p>Escolha a turma para visualizar os alunos matriculados e lançar as notas de cada avaliação.</p>
        </div>

        <div className="grades-form-grid">
          <label className="grades-field">
            <span>Turma</span>
            <select value={selectedClassId} onChange={handleClassChange}>
              <option value="">Selecione uma turma</option>
              {classes.map((educationClass) => (
                <option key={educationClass.id} value={educationClass.id}>
                  {educationClass.name} — {educationClass.educationUnitName}
                </option>
              ))}
            </select>
          </label>
          {selectedClassName && (
            <p className="grades-selection-hint">
              Atualizando notas da turma <strong>{selectedClassName}</strong>
            </p>
          )}
        </div>
      </form>

      <div className="grades-card">
        <div className="grades-card-header">
          <h2>Lançamento de notas</h2>
          <p>Informe os valores para AV1, AV2 e AV3. Campos em branco são considerados como notas não lançadas.</p>
        </div>

        {!selectedClassId && (
          <p className="grades-placeholder">Selecione uma turma para visualizar os alunos.</p>
        )}

        {selectedClassId && status === 'error' && (
          <div className="grades-alert grades-alert-error" role="alert">
            {errorMessage || 'Não foi possível carregar as notas da turma selecionada.'}
          </div>
        )}

        {selectedClassId && status === 'loading' && !grades.length && (
          <p className="grades-placeholder">Carregando notas…</p>
        )}

        {selectedClassId && status === 'success' && grades.length === 0 && (
          <p className="grades-placeholder">Nenhum aluno matriculado nesta turma.</p>
        )}

        {selectedClassId && grades.length > 0 && (
          <div className="grades-table-wrapper">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Matrícula</th>
                  <th>AV1</th>
                  <th>AV2</th>
                  <th>AV3</th>
                  <th>Média</th>
                  <th>Atualizado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((item) => {
                  const draft = draftGrades[item.studentId] ?? emptyDraft
                  const studentFeedback = feedback[item.studentId]
                  const isSaving = Boolean(savingIds[item.studentId])

                  return (
                    <tr key={item.studentId} className={studentFeedback?.status === 'success' ? 'grades-row-success' : ''}>
                      <td data-label="Aluno">
                        <div className="grades-student">
                          <strong>{item.studentName}</strong>
                        </div>
                      </td>
                      <td data-label="Matrícula">{item.registrationCode ?? '—'}</td>
                      <td data-label="AV1">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.01"
                          value={draft.av1 ?? ''}
                          onChange={handleGradeInputChange(item.studentId, 'av1')}
                          disabled={isSaving}
                          inputMode="decimal"
                        />
                      </td>
                      <td data-label="AV2">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.01"
                          value={draft.av2 ?? ''}
                          onChange={handleGradeInputChange(item.studentId, 'av2')}
                          disabled={isSaving}
                          inputMode="decimal"
                        />
                      </td>
                      <td data-label="AV3">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.01"
                          value={draft.av3 ?? ''}
                          onChange={handleGradeInputChange(item.studentId, 'av3')}
                          disabled={isSaving}
                          inputMode="decimal"
                        />
                      </td>
                      <td data-label="Média" className="grades-average">
                        {renderAverage(item.studentId)}
                      </td>
                      <td data-label="Atualizado em">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td data-label="Ações">
                        <div className="grades-actions">
                          <button type="button" onClick={handleSubmit(item.studentId)} disabled={isSaving}>
                            {isSaving ? 'Salvando…' : 'Salvar'}
                          </button>
                          <button type="button" onClick={handleReset(item.studentId)} disabled={isSaving}>
                            Restaurar
                          </button>
                        </div>
                        {studentFeedback?.message && (
                          <p
                            className={`grades-feedback ${
                              studentFeedback.status === 'error' ? 'grades-feedback-error' : ''
                            } ${studentFeedback.status === 'success' ? 'grades-feedback-success' : ''}`.trim()}
                          >
                            {studentFeedback.message}
                          </p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

const emptyDraft = { av1: '', av2: '', av3: '' }

export default EducationGradesPage
