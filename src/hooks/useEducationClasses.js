import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuth from './useAuth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5128'

const initialFormState = {
  educationUnitId: '',
  name: '',
  code: '',
  academicYear: '',
  startDate: '',
  endDate: '',
  capacity: '',
  description: '',
}

const toDateInputValue = (value) => {
  if (!value) {
    return ''
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toISOString().slice(0, 10)
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
    setFormState(() => ({ ...initialFormState }))
    setFormStatus('idle')
    setFormMessage('')
    setEditingId(null)
  }, [])

  const saveClass = useCallback(async () => {
    if (!authorizedHeaders) {
      setFormStatus('error')
      setFormMessage('Sua sessão expirou. Faça login novamente para cadastrar turmas.')
      return
    }

    setFormStatus('submitting')
    setFormMessage('')

    const capacityInput = typeof formState.capacity === 'string' ? formState.capacity.trim() : formState.capacity;
    const capacityParsed = capacityInput === '' || capacityInput === null || capacityInput === undefined
      ? null
      : Number.parseInt(capacityInput, 10);

    if (capacityParsed !== null && (!Number.isFinite(capacityParsed) || capacityParsed <= 0)) {
      setFormStatus('error')
      setFormMessage('Informe um número de vagas válido (maior que zero).')
      return
    }

    const startDateValue = typeof formState.startDate === 'string' ? formState.startDate.trim() : formState.startDate
    const endDateValue = typeof formState.endDate === 'string' ? formState.endDate.trim() : formState.endDate

    if (startDateValue && endDateValue && new Date(startDateValue) > new Date(endDateValue)) {
      setFormStatus('error')
      setFormMessage('A data de início deve ser anterior ou igual à data de fim.')
      return
    }

    const payload = {
      educationUnitId: Number(formState.educationUnitId),
      name: formState.name.trim(),
      academicYear: formState.academicYear.trim() || null,
      startDate: startDateValue || null,
      endDate: endDateValue || null,
      capacity: capacityParsed,
      description: formState.description.trim() || null,
    }

    const isEditing = editingId !== null
    const url = isEditing
      ? `${API_BASE_URL}/api/education-classes/${editingId}`
      : `${API_BASE_URL}/api/education-classes`
    const method = isEditing ? 'PUT' : 'POST'
    const failureMessage = isEditing
      ? 'Não foi possível atualizar a turma.'
      : 'Não foi possível cadastrar a turma.'

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
      setClasses((prev) => isEditing ? prev.map((item) => (item.id === created.id ? created : item)) : [created, ...prev])
      setFormStatus('success')
      const successMessage = isEditing
        ? 'Turma atualizada com sucesso.'
        : `Turma cadastrada com sucesso${created?.code ? ` (código ${created.code})` : ''}${created?.capacity ? ` com ${created.capacity} vaga(s).` : '.'}`
      setFormMessage(successMessage)
      setFormState(() => ({ ...initialFormState }))
      setEditingId(null)
    } catch (error) {
      setFormStatus('error')
      setFormMessage(error instanceof Error ? error.message : failureMessage)
    }
  }, [authorizedHeaders, editingId, formState])

  const startEditing = useCallback((item) => {
    setEditingId(item?.id ?? null)
    setFormState({
      educationUnitId: item?.educationUnitId ? String(item.educationUnitId) : '',
      name: item?.name ?? '',
      code: item?.code ?? '',
      academicYear: item?.academicYear ?? '',
      startDate: toDateInputValue(item?.startDate),
      endDate: toDateInputValue(item?.endDate),
      capacity: item?.capacity != null ? String(item.capacity) : '',
      description: item?.description ?? '',
    })
    setFormStatus('idle')
    setFormMessage('')
  }, [])

  const cancelEdit = useCallback(() => {
    resetForm()
  }, [resetForm])

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
      if (editingId === id) {
        resetForm()
      }
    } catch (error) {
      console.error('Erro ao remover a turma:', error)
    }
  }, [authorizedHeaders, editingId, resetForm])

  const refresh = useCallback(async () => {
    await Promise.all([fetchUnits(), fetchClasses()])
  }, [fetchUnits, fetchClasses])

  useEffect(() => {
    refresh()
  }, [refresh])

  const nextCode = useMemo(() => {
    const numericCodes = classes
      .map((item) => Number.parseInt(item?.code ?? '', 10))
      .filter((value) => Number.isFinite(value) && value > 0)
    if (!numericCodes.length) {
      return 1
    }
    return Math.max(...numericCodes) + 1
  }, [classes])

  return {
    units,
    classes,
    status,
    errorMessage,
    formState,
    formStatus,
    formMessage,
    handleFormChange,
    saveClass,
    resetForm,
    startEditing,
    cancelEdit,
    editingId,
    isEditing: editingId !== null,
    nextCode,
    deleteClass,
    refresh,
  }
}
