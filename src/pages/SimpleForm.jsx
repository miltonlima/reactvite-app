import { formatCpfForDisplay, useRegistrationForm } from '../hooks/useRegistrationForm.js'

function SimpleForm() {
  const { formData, submitted, status, errorMessage, handleChange, handleSubmit, reset } =
    useRegistrationForm()

  const showSummary = Boolean(submitted)

  return (
    <section className="simple-layout">
      <div className="simple-card">
        <header className="simple-card-header">
          <div>
            <p className="simple-kicker">Versão compacta</p>
            <h2>Cadastro Rápido</h2>
          </div>
          <p>
            Um fluxo direto para cadastros pontuais. Ideal para operadores que
            precisam focar em velocidade e clareza visual.
          </p>
        </header>

        {status === 'error' && errorMessage && (
          <div className="simple-alert simple-alert-error" role="alert">
            {errorMessage}
          </div>
        )}

        {status === 'success' && (
          <div className="simple-alert simple-alert-success" role="status">
            Cadastro enviado!
          </div>
        )}

        <form className="simple-form" onSubmit={handleSubmit}>
          <div className="simple-grid">
            <label className="simple-field" htmlFor="name-simple">
              <span>Nome completo</span>
              <input
                id="name-simple"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ana Silva"
                autoComplete="name"
                required
              />
            </label>

            <label className="simple-field" htmlFor="birthDate-simple">
              <span>Data de nascimento</span>
              <input
                id="birthDate-simple"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </label>

            <label className="simple-field" htmlFor="cpf-simple">
              <span>CPF</span>
              <input
                id="cpf-simple"
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
            </label>

            <label className="simple-field" htmlFor="email-simple">
              <span>E-mail</span>
              <input
                id="email-simple"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nome@exemplo.com"
                autoComplete="email"
                required
              />
            </label>

            <div className="simple-field simple-field-full textarea-wrapper">
              <label htmlFor="description-simple">
                <span>Descrição (opcional)</span>
                <textarea
                  id="description-simple"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Observações adicionais"
                  maxLength={1000}
                  rows={4}
                />
                <small className="char-counter">{formData.description.length} / 1000</small>
              </label>
            </div>
          </div>

          <div className="simple-actions">
            <button type="submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Enviando...' : 'Enviar cadastro'}
            </button>
            <button
              type="button"
              className="simple-reset"
              onClick={reset}
              disabled={status === 'submitting'}
            >
              Limpar
            </button>
          </div>
        </form>
      </div>

      <aside className="simple-summary" aria-live="polite">
        <div className="simple-summary-header">
          <span className="simple-summary-tag">Monitoramento</span>
          <h3>Último cadastro</h3>
        </div>

        {showSummary ? (
          <ul>
            <li>
              <strong>Nome</strong>
              <span>{submitted.name}</span>
            </li>
            <li>
              <strong>Nascimento</strong>
              <span>
                {new Date(submitted.birthDate).toLocaleDateString('pt-BR', {
                  timeZone: 'UTC',
                })}
              </span>
            </li>
            <li>
              <strong>CPF</strong>
              <span>{formatCpfForDisplay(submitted.cpf)}</span>
            </li>
            <li>
              <strong>E-mail</strong>
              <span>{submitted.email}</span>
            </li>
            <li>
              <strong>Descrição</strong>
              <span>{submitted.description ? submitted.description : '—'}</span>
            </li>
            <li>
              <strong>Criado em</strong>
              <span>
                {submitted.createdAt
                  ? new Date(submitted.createdAt).toLocaleString('pt-BR')
                  : ''}
              </span>
            </li>
          </ul>
        ) : (
          <p className="simple-summary-empty">
            Nenhum registro exibido ainda. Envie o formulário para acompanhar os
            dados por aqui.
          </p>
        )}
      </aside>
    </section>
  )
}

export default SimpleForm
