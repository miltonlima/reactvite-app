import { useCallback, useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7242'

export function useRegistrationsReport() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const fetchRegistrations = useCallback(async () => {
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/registrations`)
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
  }, [])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  return {
    items,
    status,
    errorMessage,
    refresh: fetchRegistrations,
  }
}
