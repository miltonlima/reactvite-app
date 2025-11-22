import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuth from './useAuth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5128'

const initialFormState = {
  educationUnitId: '',
  name: '',
  code: '',
  academicYear: '',
  description: '',
}

export function useEducationClasses() {
  const { token } = useAuth()
  const [units, setUnits] = useState([])
  const [classes, setClasses] = useState([])
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

  const fetchUnits = useCallback(async () => {
    if (!authorizedHeaders) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/education-units`, {
        headers: authorizedHeaders,
      })

      if (!response.ok) {
        throw new Error('Não foi possível carregar as unidades de ensino.')
      }

      const data = await response.json()
      setUnits(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar unidades de ensino:', error)
      setUnits([])
    }
  }, [authorizedHeaders])

  const fetchClasses = useCallback(async () => {
    if (!authorizedHeaders) {
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/education-classes`, {
        headers: authorizedHeaders,
      })

      if (!response.ok) {
        throw new Error('Não foi possível carregar as turmas.')
      }

      const data = await response.json()
      setClasses(Array.isArray(data) ? data : [])
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado ao carregar as turmas.')
    }
  }, [authorizedHeaders])

  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target

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

  const createClass = useCallback(async () => {
    if (!authorizedHeaders) {
      setFormStatus('error')
      setFormMessage('Sua sessão expirou. Faça login novamente para cadastrar turmas.')
      return
    }

    setFormStatus('submitting')
    setFormMessage('')

    const payload = {
      educationUnitId: Number(formState.educationUnitId),
      name: formState.name.trim(),
      code: formState.code.trim() || null,
      academicYear: formState.academicYear.trim() || null,
      description: formState.description.trim() || null,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/education-classes`, {
        method: 'POST',
        headers: authorizedHeaders,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = 'Não foi possível cadastrar a turma.'
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
      setClasses((prev) => [created, ...prev])
      setFormStatus('success')
      setFormMessage('Turma cadastrada com sucesso.')
      setFormState(initialFormState)
    } catch (error) {
      setFormStatus('error')
      setFormMessage(error instanceof Error ? error.message : 'Erro inesperado ao cadastrar a turma.')
    }
  }, [authorizedHeaders, formState])

  const deleteClass = useCallback(async (id) => {
    if (!authorizedHeaders) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/education-classes/${id}`, {
        method: 'DELETE',
        headers: authorizedHeaders,
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Não foi possível remover a turma.')
      }

      setClasses((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Erro ao remover a turma:', error)
    }
  }, [authorizedHeaders])

  const refresh = useCallback(async () => {
    await Promise.all([fetchUnits(), fetchClasses()])
  }, [fetchUnits, fetchClasses])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    units,
    classes,
    status,
    errorMessage,
    formState,
    formStatus,
    formMessage,
    handleFormChange,
    createClass,
    resetForm,
    deleteClass,
    refresh,
  }
}
