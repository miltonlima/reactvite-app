import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuth from './useAuth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5128'

const emptyDraft = { av1: '', av2: '', av3: '' }

const toDraftValue = (value) => (value === null || value === undefined ? '' : value.toString())

const buildDraftState = (grades) =>
  grades.reduce((accumulator, item) => {
    accumulator[item.studentId] = {
      av1: toDraftValue(item.av1),
      av2: toDraftValue(item.av2),
      av3: toDraftValue(item.av3),
    }
    return accumulator
  }, {})

const parseGrade = (raw) => {
  if (raw === null || raw === undefined) {
    return { value: null }
  }

  const normalized = String(raw).trim()
  if (normalized.length === 0) {
    return { value: null }
  }

  const parsed = Number.parseFloat(normalized.replace(',', '.'))
  if (!Number.isFinite(parsed)) {
    return { error: 'Informe um valor numérico válido.' }
  }

  if (parsed < 0 || parsed > 10) {
    return { error: 'Notas devem estar entre 0 e 10.' }
  }

  const rounded = Math.round(parsed * 100) / 100
  return { value: rounded }
}

const calculateAverage = (draft) => {
  const values = ['av1', 'av2', 'av3']
    .map((field) => parseGrade(draft[field]).value)
    .filter((value) => value !== null && value !== undefined)

  if (values.length === 0) {
    return null
  }

  const sum = values.reduce((total, current) => total + current, 0)
  return Math.round((sum / values.length) * 100) / 100
}

export function useEducationGrades() {
  const { token } = useAuth()
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [grades, setGrades] = useState([])
  const [draftGrades, setDraftGrades] = useState({})
  const [feedback, setFeedback] = useState({})
  const [savingIds, setSavingIds] = useState({})

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
      console.error('Erro ao carregar as turmas:', error)
      setClasses([])
    }
  }, [authorizedHeaders])

  const fetchGrades = useCallback(
    async (classId) => {
      if (!authorizedHeaders || !classId) {
        setGrades([])
        setDraftGrades({})
        return
      }

      setStatus('loading')
      setErrorMessage('')

      try {
        const response = await fetch(`${API_BASE_URL}/api/education-classes/${classId}/grades`, {
          headers: authorizedHeaders,
        })

        if (!response.ok) {
          let message = 'Não foi possível carregar as notas da turma selecionada.'
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const body = await response.json()
            if (body?.message) {
              message = body.message
            }
          }
          throw new Error(message)
        }

        const data = await response.json()
        const collection = Array.isArray(data) ? data : []
        setGrades(collection)
        setDraftGrades(buildDraftState(collection))
        setFeedback({})
        setSavingIds({})
        setStatus('success')
      } catch (error) {
        setStatus('error')
        setGrades([])
        setDraftGrades({})
        setFeedback({})
        setSavingIds({})
        setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado ao carregar as notas.')
      }
    },
    [authorizedHeaders]
  )

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  useEffect(() => {
    if (selectedClassId) {
      fetchGrades(selectedClassId)
    } else {
      setGrades([])
      setDraftGrades({})
      setFeedback({})
      setSavingIds({})
    }
  }, [fetchGrades, selectedClassId])

  const selectClass = useCallback((classId) => {
    setSelectedClassId(classId)
    if (!classId) {
      setStatus('idle')
      setErrorMessage('')
    }
  }, [])

  const handleGradeChange = useCallback((studentId, field, value) => {
    setDraftGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] ?? emptyDraft),
        [field]: value,
      },
    }))
    setFeedback((prev) => {
      if (!prev[studentId]) {
        return prev
      }
      return {
        ...prev,
        [studentId]: { status: 'idle', message: '' },
      }
    })
  }, [])

  const resetStudentGrades = useCallback(
    (studentId) => {
      const current = grades.find((item) => item.studentId === studentId)
      setDraftGrades((prev) => ({
        ...prev,
        [studentId]: current
          ? {
              av1: toDraftValue(current.av1),
              av2: toDraftValue(current.av2),
              av3: toDraftValue(current.av3),
            }
          : emptyDraft,
      }))
      setFeedback((prev) => ({
        ...prev,
        [studentId]: { status: 'idle', message: '' },
      }))
    },
    [grades]
  )

  const saveStudentGrades = useCallback(
    async (studentId) => {
      if (!authorizedHeaders) {
        setFeedback((prev) => ({
          ...prev,
          [studentId]: {
            status: 'error',
            message: 'Sua sessão expirou. Faça login novamente para salvar as notas.',
          },
        }))
        return
      }

      if (!selectedClassId) {
        setFeedback((prev) => ({
          ...prev,
          [studentId]: {
            status: 'error',
            message: 'Selecione uma turma antes de salvar as notas.',
          },
        }))
        return
      }

      const draft = draftGrades[studentId] ?? emptyDraft
      const av1Result = parseGrade(draft.av1)
      const av2Result = parseGrade(draft.av2)
      const av3Result = parseGrade(draft.av3)

      const validationError = av1Result.error || av2Result.error || av3Result.error
      if (validationError) {
        setFeedback((prev) => ({
          ...prev,
          [studentId]: {
            status: 'error',
            message: validationError,
          },
        }))
        return
      }

      setSavingIds((prev) => ({ ...prev, [studentId]: true }))
      setFeedback((prev) => ({
        ...prev,
        [studentId]: { status: 'loading', message: 'Salvando notas…' },
      }))

      try {
        const payload = {
          av1: av1Result.value,
          av2: av2Result.value,
          av3: av3Result.value,
        }

        const response = await fetch(
          `${API_BASE_URL}/api/education-classes/${selectedClassId}/grades/${studentId}`,
          {
            method: 'PUT',
            headers: authorizedHeaders,
            body: JSON.stringify(payload),
          }
        )

        if (!response.ok) {
          let message = 'Não foi possível salvar as notas do aluno.'
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

        setGrades((prev) =>
          prev.map((item) => (item.studentId === updated.studentId ? updated : item))
        )
        setDraftGrades((prev) => ({
          ...prev,
          [studentId]: {
            av1: toDraftValue(updated.av1),
            av2: toDraftValue(updated.av2),
            av3: toDraftValue(updated.av3),
          },
        }))
        setFeedback((prev) => ({
          ...prev,
          [studentId]: {
            status: 'success',
            message: 'Notas atualizadas com sucesso.',
          },
        }))
      } catch (error) {
        setFeedback((prev) => ({
          ...prev,
          [studentId]: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Erro inesperado ao salvar as notas.',
          },
        }))
      } finally {
        setSavingIds((prev) => ({
          ...prev,
          [studentId]: false,
        }))
      }
    },
    [authorizedHeaders, draftGrades, selectedClassId]
  )

  const refresh = useCallback(async () => {
    await fetchClasses()
    if (selectedClassId) {
      await fetchGrades(selectedClassId)
    }
  }, [fetchClasses, fetchGrades, selectedClassId])

  return {
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
  }
}
