import { useState } from 'react'
import { formatCpfForDisplay } from '../hooks/useRegistrationForm.js'
import { useRegistrationsReport } from '../hooks/useRegistrationsReport.js'
import EditRegistrationModal from './EditRegistrationModal.jsx'
import './Reports.css'

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
  const { items, status, errorMessage, refresh, updateRegistration, deleteRegistration } = useRegistrationsReport()
  const [editingRegistration, setEditingRegistration] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const hasData = items.length > 0
  const showEmpty = !hasData && status !== 'loading'

  const handleEdit = (registration) => {
    setEditingRegistration(registration)
  }

  const handleClose = () => {
    setEditingRegistration(null)
  }

  const handleDelete = (id) => {
    const ok = window.confirm(
      'Tem certeza que deseja apagar este cadastro? Esta ação não pode ser desfeita.'
    )
    if (!ok) return

    setSelectedId(id)
    deleteRegistration(id)
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
                        editingRegistration?.id === item.id
                          ? 'reports-action reports-action-active'
                          : 'reports-action'
                      }
                      onClick={() => handleEdit(item)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(item.id)}
                      disabled={status === 'submitting'}
                    >
                      {status === 'submitting' ? 'Apagando...' : 'Apagar'}
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

      {editingRegistration && (
        <EditRegistrationModal
          registration={editingRegistration}
          onUpdate={updateRegistration}
          onClose={handleClose}
          onRefresh={refresh}
        />
      )}
    </section>
  )
}

export default Reports
