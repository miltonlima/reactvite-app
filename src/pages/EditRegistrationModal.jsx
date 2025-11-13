import { useEffect, useState } from 'react'
import { formatCpfForDisplay } from '../hooks/useRegistrationForm.js'

const sanitizeCpf = (value) => (value ? value.replace(/\D/g, '').slice(0, 11) : '')

function EditRegistrationModal({ registration, onUpdate, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    cpf: '',
    email: '',
    description: '',
  })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (registration) {
      setFormData({
        name: registration.name ?? '',
        birthDate: registration.birthDate ? new Date(registration.birthDate).toISOString().split('T')[0] : '',
        cpf: formatCpfForDisplay(registration.cpf ?? ''),
        email: registration.email ?? '',
        description: registration.description || '',
      })
      setStatus('idle')
      setError('')
    }
  }, [registration])

  if (!registration) {
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('saving')
    setError('')

    try {
      const payload = {
        name: formData.name.trim(),
        birthDate: formData.birthDate || null,
        cpf: sanitizeCpf(formData.cpf) || null,
        email: formData.email.trim(),
        description: formData.description.trim() || null,
      }

      // Remove campos nulos para que o backend mantenha os valores existentes
      Object.keys(payload).forEach((k) => {
        if (payload[k] === null || payload[k] === undefined) delete payload[k]
      })

      await onUpdate(registration.id, payload)
      setStatus('success')
      onRefresh() // Atualiza a lista na tela principal
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Falha ao atualizar o cadastro.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h3>Editar Cadastro</h3>
            <p>Altere os dados de <strong>{registration.name}</strong>.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="reports-detail-grid">
            <div>
              <label className="reports-detail-label" htmlFor="name-editor">Nome</label>
              <input id="name-editor" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="reports-detail-label" htmlFor="birthdate-editor">Nascimento</label>
              <input id="birthdate-editor" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
            </div>
            <div>
              <label className="reports-detail-label" htmlFor="cpf-editor">CPF</label>
              <input id="cpf-editor" name="cpf" value={formData.cpf} onChange={handleChange} pattern="\d{3}\.\d{3}\.\d{3}-\d{2}" />
            </div>
            <div>
              <label className="reports-detail-label" htmlFor="email-editor">E-mail</label>
              <input id="email-editor" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="textarea-wrapper">
            <label className="reports-detail-label" htmlFor="description-editor">Descrição</label>
            <textarea
              id="description-editor"
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={1000}
              rows={5}
              placeholder="Informações complementares sobre o cadastro"
            />
            <small className="char-counter">{formData.description.length} / 1000</small>
          </div>

          {error && (
            <p className="reports-detail-error" role="alert">
              {error}
            </p>
          )}

          {status === 'success' && !error && (
            <p className="reports-detail-success" role="status">
              Cadastro atualizado com sucesso!
            </p>
          )}

          <div className="modal-actions">
            <button type="submit" disabled={status === 'saving'}>
              {status === 'saving' ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={status === 'saving'}
              className="reports-detail-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRegistrationModal