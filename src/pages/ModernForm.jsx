import { formatCpfForDisplay, useRegistrationForm } from '../hooks/useRegistrationForm.js'

function ModernForm() {
  const { formData, submitted, status, errorMessage, handleChange, handleSubmit } =
    useRegistrationForm()

  return (
    <section className="modern-form">
      <header className="hero">
        <span className="badge">Novo cadastro</span>
        <h2>Cadastro de Pessoa</h2>
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

          <div className="field field-full">
            <label htmlFor="description">Descrição (opcional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Observações adicionais sobre o cadastro"
              maxLength={1000}
              rows={4}
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
            <h3>Dados cadastrados</h3>
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
              <strong>Descrição:</strong>
              <span>{submitted.description ? submitted.description : '—'}</span>
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
    </section>
  )
}

export default ModernForm
