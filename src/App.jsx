import { useState } from 'react'
import './App.css'

const initialFormState = {
  name: '',
  birthDate: '',
  cpf: '',
  email: '',
}

const sanitizeCpf = (value) => value.replace(/\D/g, '').slice(0, 11)

const formatCpfForDisplay = (value) => {
  const digits = sanitizeCpf(value)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7242'

function App() {
  const [formData, setFormData] = useState({ ...initialFormState })
  const [submitted, setSubmitted] = useState(null)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

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
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  return (
    <main className="app">
      <header className="hero">
        <span className="badge">Novo cadastro</span>
        <h1>Cadastro de Pessoa</h1>
        <p>
          Preencha os dados para registrar uma nova pessoa. Você pode revisar as
          informações antes de salvar.
        </p>
      </header>

      {status === 'error' && errorMessage && (
        <div className="alert alert-error" role="alert">
          {errorMessage}
        </div>
      )}

      {status === 'success' && submitted && (
        <div className="alert alert-success" role="status">
          Cadastro salvo com sucesso.
        </div>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <div className="fields-grid">
          <div className="field">
            <label htmlFor="name">Nome completo</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex.: Ana Silva"
              autoComplete="name"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="birthDate">Data de nascimento</label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              inputMode="numeric"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
              title="Informe o CPF no formato 000.000.000-00"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nome@exemplo.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="form-footer">
          <button type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Salvando...' : 'Salvar cadastro'}
          </button>
        </div>
      </form>

      {submitted && (
        <section className="submitted" aria-live="polite">
          <div className="submitted-header">
            <span className="badge badge-success">Cadastro salvo</span>
            <h2>Dados cadastrados</h2>
          </div>
          <ul>
            <li>
              <strong>Nome:</strong>
              <span>{submitted.name}</span>
            </li>
            <li>
              <strong>Nascimento:</strong>
              <span>
                {new Date(submitted.birthDate).toLocaleDateString('pt-BR', {
                  timeZone: 'UTC',
                })}
              </span>
            </li>
            <li>
              <strong>CPF:</strong>
              <span>{formatCpfForDisplay(submitted.cpf)}</span>
            </li>
            <li>
              <strong>E-mail:</strong>
              <span>{submitted.email}</span>
            </li>
            <li>
              <strong>Criado em:</strong>
              <span>
                {submitted.createdAt
                  ? new Date(submitted.createdAt).toLocaleString('pt-BR')
                  : ''}
              </span>
            </li>
          </ul>
        </section>
      )}
    </main>
  )
}

export default App
