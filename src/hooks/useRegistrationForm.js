import { useState } from 'react'
import useAuth from './useAuth'

const initialFormState = {
  name: '',
  birthDate: '',
  cpf: '',
  email: '',
  description: '',
}

const DEFAULT_PASSWORD = '123456'

const sanitizeCpf = (value) => value.replace(/\D/g, '').slice(0, 11)

export const formatCpfForDisplay = (value) => {
  const digits = sanitizeCpf(value)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5128'

export function useRegistrationForm() {
  const [formData, setFormData] = useState({ ...initialFormState })
  const [submitted, setSubmitted] = useState(null)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { token } = useAuth()

  const handleChange = (event) => {
    const { name, value } = event.target

    if (status !== 'idle') {
      setStatus('idle')
      setErrorMessage('')
    }

    if (name === 'cpf') {
      const formatted = formatCpfForDisplay(value)
      setFormData((prev) => ({ ...prev, cpf: formatted }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const payload = {
      name: formData.name.trim(),
      birthDate: formData.birthDate,
      cpf: sanitizeCpf(formData.cpf),
      email: formData.email.trim(),
      password: DEFAULT_PASSWORD,
      description: formData.description.trim() || null,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = 'Não foi possível salvar o cadastro.'
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
      setSubmitted(data)
      setStatus('success')
      setFormData({ ...initialFormState })
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Erro inesperado ao salvar.',
      )
    }
  }

  const reset = () => {
    setFormData({ ...initialFormState })
    setSubmitted(null)
    setStatus('idle')
    setErrorMessage('')
  }

  return {
    formData,
    submitted,
    status,
    errorMessage,
    handleChange,
    handleSubmit,
    reset,
  }
}
