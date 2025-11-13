import { useEffect, useMemo, useState } from 'react'
import { formatCpfForDisplay } from '../hooks/useRegistrationForm.js'
import { useRegistrationsReport } from '../hooks/useRegistrationsReport.js'

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-BR')
}

const formatDateTime = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('pt-BR')
}

const summarize = (value) => {
  if (!value) return '—'
  return value.length > 80 ? `${value.slice(0, 80)}…` : value
}

function Reports() {
  const { items, status, errorMessage, refresh, updateRegistration } =
    useRegistrationsReport()
  const [selectedId, setSelectedId] = useState(null)
  const [nameDraft, setNameDraft] = useState('')
  const [birthDateDraft, setBirthDateDraft] = useState('')
  const [cpfDraft, setCpfDraft] = useState('')
  const [emailDraft, setEmailDraft] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [updateStatus, setUpdateStatus] = useState('idle')
  const [updateError, setUpdateError] = useState('')

  const hasData = items.length > 0
  const showEmpty = !hasData && status !== 'loading'

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  )

  useEffect(() => {
    if (!selectedId && items.length > 0) {
      setSelectedId(items[0].id)
    }
  }, [items, selectedId])

  useEffect(() => {
    if (selected) {
      setNameDraft(selected.name ?? '')
      // birthDate expected in YYYY-MM-DD or ISO string; keep as string
      setBirthDateDraft(selected.birthDate ?? '')
      setCpfDraft(formatCpfForDisplay(selected.cpf ?? ''))
      setEmailDraft(selected.email ?? '')
      setDescriptionDraft(selected.description ?? '')
      setUpdateStatus('idle')
      setUpdateError('')
    }
  }, [selected])

  const handleSelect = (id) => {
    setSelectedId(id)
  }

  const handleClose = () => {
    setSelectedId(null)
    setDescriptionDraft('')
    setUpdateStatus('idle')
    setUpdateError('')
  }

  const handleCancel = () => {
    if (selected) {
      setDescriptionDraft(selected.description ?? '')
    }
    setUpdateStatus('idle')
    setUpdateError('')
  }

  const sanitizeCpf = (value) => (value ? value.replace(/\D/g, '').slice(0, 11) : '')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selected) return

    setUpdateStatus('saving')
    setUpdateError('')

    try {
      const payload = {
        name: nameDraft.trim(),
        birthDate: birthDateDraft || null,
        cpf: sanitizeCpf(cpfDraft) || null,
        email: emailDraft.trim(),
        description: descriptionDraft.trim() || null,
      }

      // Remove null fields so backend can keep existing values when not provided
      Object.keys(payload).forEach((k) => {
        if (payload[k] === null || payload[k] === undefined) delete payload[k]
      })

      await updateRegistration(selected.id, payload)
      setUpdateStatus('success')
    } catch (error) {
      setUpdateStatus('error')
      setUpdateError(
        error instanceof Error
          ? error.message
          : 'Falha ao atualizar a descrição.',
      )
    }
  }

  return (
    <section className="reports">
      <header className="reports-header">
        <div>
          <span className="reports-badge">Relatório</span>
          <h2>Cadastros realizados</h2>
          <p>
            Consulte os registros enviados pela aplicação. Atualize sempre que
            precisar refletir novos cadastros.
          </p>
        </div>
        <button
          type="button"
          className="reports-refresh"
          onClick={refresh}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Atualizando...' : 'Atualizar lista'}
        </button>
      </header>

      {status === 'error' && errorMessage && (
        <div className="reports-alert" role="alert">
          {errorMessage}
        </div>
      )}

      {hasData ? (
        <div className="reports-table-wrapper" role="region" aria-live="polite">
          <table className="reports-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Nascimento</th>
                <th scope="col">CPF</th>
                <th scope="col">E-mail</th>
                <th scope="col">Descrição</th>
                <th scope="col">Criado em</th>
                <th scope="col" className="reports-col-actions">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td data-title="Nome">{item.name}</td>
                  <td data-title="Nascimento">{formatDate(item.birthDate)}</td>
                  <td data-title="CPF">{formatCpfForDisplay(item.cpf)}</td>
                  <td data-title="E-mail">{item.email}</td>
                  <td data-title="Descrição">{summarize(item.description)}</td>
                  <td data-title="Criado em">{formatDateTime(item.createdAt)}</td>
                  <td className="reports-actions">
                    <button
                      type="button"
                      className={
                        selected?.id === item.id
                          ? 'reports-action reports-action-active'
                          : 'reports-action'
                      }
                      onClick={() => handleSelect(item.id)}
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : showEmpty ? (
        <p className="reports-empty" aria-live="polite">
          Nenhum cadastro encontrado. Envie o formulário e volte para consultar
          o relatório.
        </p>
      ) : (
        <p className="reports-empty" aria-live="polite">
          Carregando cadastros...
        </p>
      )}

      {selected && (
        <section className="reports-detail" aria-live="polite">
          <header className="reports-detail-header">
            <div>
              <h3>{selected.name}</h3>
              <p>
                Dados completos do cadastro e área para atualizar a descrição.
              </p>
            </div>
            <button
              type="button"
              className="reports-detail-close"
              onClick={handleClose}
            >
              Fechar
            </button>
          </header>

          <form className="reports-detail-form" onSubmit={handleSubmit}>
            <div className="reports-detail-grid">
              <div>
                <label className="reports-detail-label" htmlFor="name-editor">
                  Nome
                </label>
                <input
                  id="name-editor"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                />
              </div>

              <div>
                <label className="reports-detail-label" htmlFor="birthdate-editor">
                  Nascimento
                </label>
                <input
                  id="birthdate-editor"
                  type="date"
                  value={birthDateDraft}
                  onChange={(e) => setBirthDateDraft(e.target.value)}
                />
              </div>

              <div>
                <label className="reports-detail-label" htmlFor="cpf-editor">
                  CPF
                </label>
                <input
                  id="cpf-editor"
                  value={cpfDraft}
                  onChange={(e) => setCpfDraft(e.target.value)}
                />
              </div>

              <div>
                <label className="reports-detail-label" htmlFor="email-editor">
                  E-mail
                </label>
                <input
                  id="email-editor"
                  type="email"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                />
              </div>

              <div>
                <dt>Criado em</dt>
                <dd>{formatDateTime(selected.createdAt)}</dd>
              </div>
            </div>

            <label className="reports-detail-label" htmlFor="description-editor">
              Descrição
            </label>
            <textarea
              id="description-editor"
              value={descriptionDraft}
              onChange={(event) => setDescriptionDraft(event.target.value)}
              maxLength={1000}
              rows={6}
              placeholder="Descreva informações complementares sobre o cadastro"
            />

            {updateError && (
              <p className="reports-detail-error" role="alert">
                {updateError}
              </p>
            )}

            {updateStatus === 'success' && !updateError && (
              <p className="reports-detail-success" role="status">
                Descrição atualizada com sucesso.
              </p>
            )}

            <div className="reports-detail-actions">
              <button type="submit" disabled={updateStatus === 'saving'}>
                {updateStatus === 'saving' ? 'Salvando...' : 'Salvar descrição'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={updateStatus === 'saving'}
                className="reports-detail-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}
    </section>
  )
}

export default Reports
