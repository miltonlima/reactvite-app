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
  const { token, logout } = useAuth()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [formState, setFormState] = useState(initialFormState)
  const [formStatus, setFormStatus] = useState('idle')
  const [formMessage, setFormMessage] = useState('')
  const [editingId, setEditingId] = useState(null)

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

      if (response.status === 401) {
        setStatus('idle')
        setErrorMessage('Sua sessão expirou. Faça login novamente.')
        return
      }

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
  }, [authorizedHeaders, logout, token])

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
    setEditingId(null)
  }, [])

  const saveUnit = useCallback(async () => {
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

    const isEditing = editingId !== null
    const url = isEditing
      ? `${API_BASE_URL}/api/education-units/${editingId}`
      : `${API_BASE_URL}/api/education-units`
    const method = isEditing ? 'PUT' : 'POST'

    const failureMessage = isEditing
      ? 'Não foi possível atualizar a unidade.'
      : 'Não foi possível cadastrar a unidade.'

    try {
      const response = await fetch(url, {
        method,
        headers: authorizedHeaders,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = failureMessage
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
      setItems((prev) => isEditing ? prev.map((unit) => (unit.id === created.id ? created : unit)) : [created, ...prev])
      setFormStatus('success')
      setFormMessage(isEditing ? 'Unidade atualizada com sucesso.' : 'Unidade cadastrada com sucesso.')
      setFormState(initialFormState)
      setEditingId(null)
    } catch (error) {
      setFormStatus('error')
      setFormMessage(error instanceof Error ? error.message : failureMessage)
    }
  }, [authorizedHeaders, editingId, formState])

  const startEditing = useCallback((unit) => {
    setEditingId(unit?.id ?? null)
    setFormState({
      name: unit?.name ?? '',
      code: unit?.code ?? '',
      city: unit?.city ?? '',
      state: unit?.state ?? '',
      description: unit?.description ?? '',
    })
    setFormStatus('idle')
    setFormMessage('')
  }, [])

  const cancelEdit = useCallback(() => {
    resetForm()
  }, [resetForm])

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
      if (editingId === id) {
        resetForm()
      }
    } catch (error) {
      console.error('Erro ao remover a unidade:', error)
    }
  }, [authorizedHeaders, editingId, resetForm])

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
    saveUnit,
    resetForm,
    startEditing,
    cancelEdit,
    editingId,
    isEditing: editingId !== null,
    deleteUnit,
    refresh: fetchUnits,
  }
}
