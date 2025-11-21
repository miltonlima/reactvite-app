import { useCallback, useEffect, useState } from 'react'
import useAuth from './useAuth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7242'

export function useRegistrationsReport() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { token } = useAuth()

  const fetchRegistrations = useCallback(async () => {
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Falha ao carregar os cadastros.')
      }

      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro inesperado ao gerar o relatório.',
      )
    }
  }, [token])

  const updateRegistration = useCallback(async (id, payload) => {
    const response = await fetch(`${API_BASE_URL}/api/registrations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      let message = 'Falha ao atualizar o cadastro.'
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
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    )
    return updated
  }, [token])

  const deleteRegistration = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/registrations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        let message = 'Falha ao deletar o cadastro.'
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          try {
            const body = await response.json()
            if (body?.message) message = body.message
          } catch (e) {
            // ignore parse errors
          }
        }
        setErrorMessage(message)
        throw new Error(message)
      }

      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Erro ao deletar o cadastro:', error)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchRegistrations()
    }
  }, [fetchRegistrations, token])

  return {
    items,
    status,
    errorMessage,
    refresh: fetchRegistrations,
    updateRegistration,
    deleteRegistration,
  }
}
