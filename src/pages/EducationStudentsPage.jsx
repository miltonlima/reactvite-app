import './EducationStudentsPage.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEducationStudents } from '../hooks/useEducationStudents'
import { formatCpfForDisplay } from '../hooks/useRegistrationForm'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

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
    resetForm,
    deleteStudent,
    refresh,
    nextRegistrationCode,
    updateStudent,
  } = useEducationStudents()

  const [searchTerm, setSearchTerm] = useState('')
  const emptyModalState = useMemo(
    () => ({
      name: '',
      registrationCode: '',
      cpf: '',
      birthDate: '',
      guardianName: '',
      guardianContact: '',
      notes: '',
    }),
    [],
  )
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalState, setModalState] = useState(() => ({ ...emptyModalState }))
  const [modalStatus, setModalStatus] = useState('idle')
  const [modalMessage, setModalMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    await saveStudent()
  }

  const handleResetForm = () => {
    resetForm()
  }

  const registrationCodeValue = nextRegistrationCode ?? ''

  const mapStudentToModalState = useCallback(
    (student) => ({
      name: student?.name ?? '',
      registrationCode: student?.registrationCode ?? '',
      cpf: formatCpfForDisplay(student?.cpf ?? ''),
      birthDate: student?.birthDate ?? '',
      guardianName: student?.guardianName ?? '',
      guardianContact: student?.guardianContact ?? '',
      notes: student?.notes ?? '',
    }),
    [],
  )

  const selectedStudent = useMemo(() => {
    if (selectedStudentId === null) {
      return null
    }

    return students.find((student) => student.id === selectedStudentId) ?? null
  }, [selectedStudentId, students])

  const selectedStudentEnrollments = useMemo(
    () => (Array.isArray(selectedStudent?.enrollments) ? selectedStudent.enrollments : []),
    [selectedStudent],
  )

  const openStudentModal = useCallback((student) => {
    setSelectedStudentId(student.id)
    setIsModalOpen(true)
    setModalStatus('idle')
    setModalMessage('')
  }, [])

  const closeStudentModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedStudentId(null)
    setModalStatus('idle')
    setModalMessage('')
    setModalState(() => ({ ...emptyModalState }))
  }, [emptyModalState])

  useEffect(() => {
    if (!isModalOpen) {
      return
    }

    if (selectedStudent) {
      setModalState(() => mapStudentToModalState(selectedStudent))
      return
    }

    closeStudentModal()
  }, [isModalOpen, selectedStudent, mapStudentToModalState, closeStudentModal])

  useEffect(() => {
    if (!isModalOpen) {
      return undefined
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
  }, [isModalOpen, closeStudentModal])

  const handleModalFieldChange = (event) => {
    const { name, value } = event.target

    if (name === 'registrationCode') {
      return
    }

    if (name === 'cpf') {
      setModalState((prev) => ({
        ...prev,
        cpf: formatCpfForDisplay(value),
      }))
      return
    }

    setModalState((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleModalReset = () => {
    if (!selectedStudent) {
      setModalState(() => ({ ...emptyModalState }))
      return
    }

    setModalState(() => mapStudentToModalState(selectedStudent))
    setModalStatus('idle')
    setModalMessage('')
  }

  const handleModalSubmit = async (event) => {
    event.preventDefault()

    if (!selectedStudent) {
      return
    }

    setModalStatus('submitting')
    setModalMessage('')

    try {
      const updated = await updateStudent(selectedStudent.id, modalState)
      setModalStatus('success')
      setModalMessage('Dados do aluno atualizados com sucesso.')
      setModalState(mapStudentToModalState(updated))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar os dados do aluno.'
      setModalStatus('error')
      setModalMessage(message)
    }
  }

  const handleModalDelete = async () => {
    if (!selectedStudent) {
      return
    }

    const confirmed = window.confirm('Tem certeza de que deseja remover este aluno? Essa ação não pode ser desfeita.')
    if (!confirmed) {
      return
    }

    setModalStatus('submitting')
    setModalMessage('')
    await deleteStudent(selectedStudent.id)
    closeStudentModal()
  }

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

  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(resultsCount / pageSize)), [resultsCount, pageSize])
  const effectivePage = currentPage > totalPages ? totalPages : currentPage

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedStudents = useMemo(() => {
    if (resultsCount === 0) {
      return []
    }

    const startIndex = (effectivePage - 1) * pageSize
    return filteredStudents.slice(startIndex, startIndex + pageSize)
  }, [filteredStudents, effectivePage, pageSize, resultsCount])

  const pageRangeStart = resultsCount === 0 ? 0 : (effectivePage - 1) * pageSize + 1
  const pageRangeEnd = resultsCount === 0 ? 0 : Math.min(resultsCount, effectivePage * pageSize)

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value))
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <section className="students-page" aria-labelledby="students-title">
      <header className="students-header">
        <div>
          <p className="students-kicker">Rede de ensino</p>
          <h1 id="students-title">Alunos</h1>
          <p>
            Cadastre novos alunos e clique na lista para editar em uma janela modal centralizada. As inscrições em
            turmas ficam na tela<strong> Inscrições</strong>.
          </p>
        </div>
        <button type="button" className="students-refresh" onClick={refresh} disabled={status === 'loading'}>
          {status === 'loading' ? 'Atualizando…' : 'Atualizar dados'}
        </button>
      </header>

      <div className="students-layout">
        <form className="students-form" onSubmit={handleSubmit}>
          <div className="students-form-header">
            <h2>Novo aluno</h2>
            <p>Preencha as informações básicas; depois acesse Inscrições para vincular turmas.</p>
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
              A matrícula é gerada automaticamente como um número sequencial ao cadastrar o aluno.
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
              {formStatus === 'submitting' ? 'Salvando…' : 'Cadastrar aluno'}
            </button>
            <button
              type="button"
              className="students-reset"
              onClick={handleResetForm}
              disabled={formStatus === 'submitting'}
            >
              Limpar
            </button>
          </div>
        </form>

        <div className="students-list-card">
          <div className="students-list-header">
            <h2>Alunos cadastrados</h2>
            <p>Clique em um aluno para abrir a edição em uma janela modal.</p>
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
            <div className="students-page-size">
              <label htmlFor="students-page-size">Alunos por página</label>
              <select id="students-page-size" value={pageSize} onChange={handlePageSizeChange}>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
            <div className="students-table-section">
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
                    {paginatedStudents.map((student) => {
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
                          className={isModalOpen && selectedStudentId === student.id ? 'students-row-editing' : undefined}
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
              <div className="students-pagination" role="navigation" aria-label="Paginação de alunos">
                <div className="students-pagination-info">
                  {resultsCount === 0
                    ? 'Nenhum aluno encontrado'
                    : `Mostrando ${pageRangeStart}-${pageRangeEnd} de ${resultsCount} alunos`}
                </div>
                <div className="students-pagination-controls">
                  <button type="button" onClick={handlePreviousPage} disabled={effectivePage <= 1}>
                    Anterior
                  </button>
                  <span className="students-pagination-status">
                    Página {resultsCount === 0 ? 0 : effectivePage} de {resultsCount === 0 ? 0 : totalPages}
                  </span>
                  <button type="button" onClick={handleNextPage} disabled={effectivePage >= totalPages || resultsCount === 0}>
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedStudent && (
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
          <form className="students-modal" onSubmit={handleModalSubmit}>
            <header className="students-modal-header">
              <div>
                <p className="students-modal-chip">Aluno</p>
                <h3 id="student-modal-title">{selectedStudent.name}</h3>
                {selectedStudent.registrationCode && (
                  <p className="students-modal-subtitle">Matrícula {selectedStudent.registrationCode}</p>
                )}
              </div>
              <button type="button" className="students-modal-close" aria-label="Fechar" onClick={closeStudentModal}>
                ×
              </button>
            </header>

            {modalMessage && (
              <div
                role="status"
                className={`students-alert ${modalStatus === 'success' ? 'students-alert-success' : ''} ${modalStatus === 'error' ? 'students-alert-error' : ''}`.trim()}
              >
                {modalMessage}
              </div>
            )}

            <div className="students-modal-body">
              <div className="students-grid students-modal-form">
                <label className="students-field">
                  <span>Matrícula</span>
                  <input type="text" name="registrationCode" value={modalState.registrationCode} readOnly />
                </label>

                <label className="students-field students-field-full">
                  <span>Nome do aluno *</span>
                  <input
                    type="text"
                    name="name"
                    value={modalState.name}
                    onChange={handleModalFieldChange}
                    placeholder="Nome completo"
                    required
                  />
                </label>

                <label className="students-field">
                  <span>CPF</span>
                  <input
                    type="text"
                    name="cpf"
                    value={modalState.cpf}
                    onChange={handleModalFieldChange}
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
                    value={modalState.birthDate}
                    onChange={handleModalFieldChange}
                  />
                </label>

                <label className="students-field">
                  <span>Responsável</span>
                  <input
                    type="text"
                    name="guardianName"
                    value={modalState.guardianName}
                    onChange={handleModalFieldChange}
                    placeholder="Nome do responsável"
                  />
                </label>

                <label className="students-field">
                  <span>Contato do responsável</span>
                  <input
                    type="text"
                    name="guardianContact"
                    value={modalState.guardianContact}
                    onChange={handleModalFieldChange}
                    placeholder="Telefone, email, etc."
                  />
                </label>

                <label className="students-field students-field-full">
                  <span>Observações</span>
                  <textarea
                    name="notes"
                    value={modalState.notes}
                    onChange={handleModalFieldChange}
                    placeholder="Observações gerais, restrições alimentares, necessidades especiais, etc."
                    rows={4}
                  />
                </label>
              </div>

              <section className="students-modal-enrollments" aria-label="Turmas vinculadas">
                <header>
                  <h4>Turmas vinculadas</h4>
                  <Link to="/app/education-enrollments" state={{ studentId: selectedStudent.id }} onClick={closeStudentModal}>
                    Gerenciar inscrições
                  </Link>
                </header>
                {selectedStudentEnrollments.length > 0 ? (
                  <ul>
                    {selectedStudentEnrollments.map((enrollment) => (
                      <li key={`${selectedStudent.id}-${enrollment.educationClassId}`}>
                        <strong>{enrollment.educationClassName}</strong>
                        <span>{enrollment.educationUnitName}</span>
                        <span>Desde {formatDate(enrollment.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="students-placeholder">Nenhuma turma vinculada ainda.</p>
                )}
              </section>
            </div>

            <footer className="students-modal-actions">
              <button type="submit" disabled={modalStatus === 'submitting'}>
                {modalStatus === 'submitting' ? 'Salvando…' : 'Salvar alterações'}
              </button>
              <button
                type="button"
                className="students-reset"
                onClick={handleModalReset}
                disabled={modalStatus === 'submitting'}
              >
                Desfazer alterações
              </button>
              <button
                type="button"
                className="students-delete"
                onClick={handleModalDelete}
                disabled={modalStatus === 'submitting'}
              >
                Remover aluno
              </button>
            </footer>
          </form>
        </div>
      )}

    </section>
  )
}

export default EducationStudentsPage
