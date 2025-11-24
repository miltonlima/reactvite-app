import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuth from './useAuth'
import { formatCpfForDisplay } from './useRegistrationForm'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5128'

const initialFormState = {
  name: '',
  cpf: '',
  birthDate: '',
  guardianName: '',
  guardianContact: '',
  notes: '',
}

const sanitizeCpf = (value) => value.replace(/\D/g, '').slice(0, 11)

export function useEducationStudents() {
  const { token } = useAuth()
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [formState, setFormState] = useState(initialFormState)
  const [formStatus, setFormStatus] = useState('idle')
  const [formMessage, setFormMessage] = useState('')

  const authorizedHeaders = useMemo(() => {
    if (!token) {
      return null
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }, [token])

  const fetchClasses = useCallback(async () => {
    if (!authorizedHeaders) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/education-classes`, {
        headers: authorizedHeaders,
      })

      if (!response.ok) {
        throw new Error('Não foi possível carregar as turmas.')
      }

      const data = await response.json()
      setClasses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
      setClasses([])
    }
  }, [authorizedHeaders])

  const fetchStudents = useCallback(async () => {
    if (!authorizedHeaders) {
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/education-students`, {
        headers: authorizedHeaders,
      })

      if (!response.ok) {
        throw new Error('Não foi possível carregar os alunos inscritos.')
      }

      const data = await response.json()
      setStudents(Array.isArray(data) ? data : [])
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado ao carregar os alunos.')
    }
  }, [authorizedHeaders])

  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target

    if (name === 'cpf') {
      const formatted = formatCpfForDisplay(value)
      setFormState((prev) => ({
        ...prev,
        cpf: formatted,
      }))
      return
    }

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  const resetForm = useCallback(() => {
    setFormState(initialFormState)
    setFormStatus('idle')
    setFormMessage('')
  }, [])

  const createStudent = useCallback(async () => {
    if (!authorizedHeaders) {
      setFormStatus('error')
      setFormMessage('Sua sessão expirou. Faça login novamente para cadastrar alunos.')
      return
    }

    setFormStatus('submitting')
    setFormMessage('')

    const payload = {
      name: formState.name.trim(),
      cpf: sanitizeCpf(formState.cpf) || null,
      birthDate: formState.birthDate || null,
      guardianName: formState.guardianName.trim() || null,
      guardianContact: formState.guardianContact.trim() || null,
      notes: formState.notes.trim() || null,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/education-students`, {
        method: 'POST',
        headers: authorizedHeaders,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = 'Não foi possível cadastrar o aluno.'
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const body = await response.json()
          if (body?.message) {
            message = body.message
          }
        }
        throw new Error(message)
      }

      const created = await response.json()
      setStudents((prev) => [created, ...prev])
      setFormStatus('success')
      setFormMessage('Aluno cadastrado com sucesso. Acesse a tela Inscrições para vincular turmas.')
      setFormState(initialFormState)
    } catch (error) {
      setFormStatus('error')
      setFormMessage(error instanceof Error ? error.message : 'Erro inesperado ao cadastrar o aluno.')
    }
  }, [authorizedHeaders, formState])

  const enrollStudent = useCallback(
    async (studentId, classId) => {
      if (!authorizedHeaders) {
        throw new Error('Sua sessão expirou. Faça login novamente.')
      }

      const payload = {
        educationClassId: Number(classId),
      }

      const response = await fetch(`${API_BASE_URL}/api/education-students/${studentId}/enrollments`, {
        method: 'POST',
        headers: authorizedHeaders,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = 'Não foi possível vincular o aluno à turma.'
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const body = await response.json()
          if (body?.message) {
            message = body.message
          }
        }
        throw new Error(message)
      }

      const updated = await response.json()
      setStudents((prev) => prev.map((student) => (student.id === updated.id ? updated : student)))
      return updated
    },
    [authorizedHeaders]
  )

  const unenrollStudent = useCallback(
    async (studentId, classId) => {
      if (!authorizedHeaders) {
        throw new Error('Sua sessão expirou. Faça login novamente.')
      }

      const response = await fetch(
        `${API_BASE_URL}/api/education-students/${studentId}/enrollments/${classId}`,
        {
          method: 'DELETE',
          headers: authorizedHeaders,
        }
      )

      if (!response.ok) {
        let message = 'Não foi possível remover a turma do aluno.'
        if (response.status === 404) {
          message = 'Aluno ou turma não encontrados.'
        } else {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const body = await response.json()
            if (body?.message) {
              message = body.message
            }
          }
        }
        throw new Error(message)
      }

      const updated = await response.json()
      setStudents((prev) => prev.map((student) => (student.id === updated.id ? updated : student)))
      return updated
    },
    [authorizedHeaders]
  )

  const deleteStudent = useCallback(async (id) => {
    if (!authorizedHeaders) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/education-students/${id}`, {
        method: 'DELETE',
        headers: authorizedHeaders,
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Não foi possível remover o aluno.')
      }

      setStudents((prev) => prev.filter((student) => student.id !== id))
    } catch (error) {
      console.error('Erro ao remover aluno:', error)
    }
  }, [authorizedHeaders])

  const refresh = useCallback(async () => {
    await Promise.all([fetchClasses(), fetchStudents()])
  }, [fetchClasses, fetchStudents])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    classes,
    students,
    status,
    errorMessage,
    formState,
    formStatus,
    formMessage,
    handleFormChange,
    createStudent,
    enrollStudent,
    unenrollStudent,
    resetForm,
    deleteStudent,
    refresh,
  }
}
