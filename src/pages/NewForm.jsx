import { useRegistrationForm } from '../hooks/useRegistrationForm'
import './NewForm.css'

function NewForm() {
  const { formData, submitted, status, errorMessage, handleChange, handleSubmit, reset } =
    useRegistrationForm()

  return (
    <div className="new-form-layout">
      <div className="new-form-card">
        <header className="new-form-header">
          <h2>Novo Formulário</h2>
          <p>Um formulário separado para testar outra abordagem de UI.</p>
        </header>

        <form className="new-form" onSubmit={handleSubmit}>
          <div className="fields-grid">
            <div className="field">
              <label htmlFor="name">Nome</label>
              <input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="field">
              <label htmlFor="birthDate">Nascimento</label>
              <input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
            </div>

            <div className="field">
              <label htmlFor="cpf">CPF</label>
              <input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>


          {errorMessage && <p className="form-error">{errorMessage}</p>}

          <div className="new-actions">
            <button type="submit" disabled={status === 'saving'}>
              {status === 'saving' ? 'Enviando...' : 'Enviar'}
            </button>
            <button type="button" className="secondary" onClick={reset} disabled={status === 'saving'}>
              Limpar
            </button>
          </div>
        </form>

        {submitted && (
          <div className="new-summary">
            <h3>Resumo</h3>
            <p>
              Obrigado — seu cadastro foi enviado. Use a aba Relatórios para visualizar registros.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewForm
