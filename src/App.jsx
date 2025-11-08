import { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    cpf: '',
    email: '',
  })
  const [submitted, setSubmitted] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target

    if (name === 'cpf') {
      const digits = value.replace(/\D/g, '').slice(0, 11)
      const formatted = digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      setFormData((prev) => ({ ...prev, cpf: formatted }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(formData)
    setFormData({ name: '', birthDate: '', cpf: '', email: '' })
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
          <button type="submit">Salvar cadastro</button>
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
              <span>{submitted.cpf}</span>
            </li>
            <li>
              <strong>E-mail:</strong>
              <span>{submitted.email}</span>
            </li>
          </ul>
        </section>
      )}
    </main>
  )
}

export default App
