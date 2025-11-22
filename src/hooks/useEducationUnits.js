import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuth from './useAuth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5128'

const initialFormState = {
  name: '',
  code: '',
  city: '',
  state: '',
  description: '',
}

export function useEducationUnits() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
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
    if (!token) {
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/education-units`, {
        headers: authorizedHeaders ?? undefined,
      })

      if (!response.ok) {
        throw new Error('Não foi possível carregar as unidades.')
      }

      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado ao carregar as unidades.')
    }
  }, [authorizedHeaders, token])

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

  const createUnit = useCallback(async () => {
    setFormStatus('submitting')
    setFormMessage('')

    if (!authorizedHeaders) {
      setFormStatus('error')
      setFormMessage('Sua sessão expirou. Faça login novamente para cadastrar unidades.')
      return
    }

    const payload = {
      name: formState.name.trim(),
      code: formState.code.trim(),
      city: formState.city.trim() || null,
      state: formState.state.trim() || null,
      description: formState.description.trim() || null,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/education-units`, {
        method: 'POST',
        headers: authorizedHeaders,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = 'Não foi possível cadastrar a unidade.'
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
      setItems((prev) => [created, ...prev])
      setFormStatus('success')
      setFormMessage('Unidade cadastrada com sucesso.')
      setFormState(initialFormState)
    } catch (error) {
      setFormStatus('error')
      setFormMessage(error instanceof Error ? error.message : 'Erro inesperado ao cadastrar a unidade.')
    }
  }, [authorizedHeaders, formState])

  const deleteUnit = useCallback(async (id) => {
    if (!id) {
      return
    }

    if (!authorizedHeaders) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/education-units/${id}`, {
        method: 'DELETE',
        headers: authorizedHeaders,
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Não foi possível remover a unidade.')
      }

      setItems((prev) => prev.filter((unit) => unit.id !== id))
    } catch (error) {
      console.error('Erro ao remover a unidade:', error)
    }
  }, [authorizedHeaders])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  return {
    items,
    status,
    errorMessage,
    formState,
    formStatus,
    formMessage,
    handleFormChange,
    createUnit,
    resetForm,
    deleteUnit,
    refresh: fetchUnits,
  }
}
