import { useState } from 'react'
import { useGyms } from '../data/gyms'
import { useUsers } from '../data/users'
import { useAuth } from '../hooks/useAuth'

const ROLES = ['member', 'trainer', 'admin']

function GymsSection() {
  const { getAll, create } = useGyms()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await create.mutateAsync({ name, address })
      setName('')
      setAddress('')
    } catch {
      setError('Failed to create gym.')
    }
  }

  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2>Gyms</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '0.4rem 0.6rem' }}
        />
        <input
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          style={{ padding: '0.4rem 0.6rem', minWidth: '200px' }}
        />
        <button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Adding…' : 'Add Gym'}
        </button>
        {error && <span style={{ color: 'red' }}>{error}</span>}
      </form>

      {getAll.isLoading && <p>Loading gyms…</p>}
      {getAll.isError && <p style={{ color: 'red' }}>Failed to load gyms.</p>}
      {getAll.data && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['ID', 'Name', 'Address'].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getAll.data.map((gym: { id: number; name: string; address: string }) => (
              <tr key={gym.id}>
                <td style={tdStyle}>{gym.id}</td>
                <td style={tdStyle}>{gym.name}</td>
                <td style={tdStyle}>{gym.address}</td>
              </tr>
            ))}
            {getAll.data.length === 0 && (
              <tr><td colSpan={3} style={tdStyle}>No gyms yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}

function UsersSection() {
  const [gymFilter, setGymFilter] = useState<number | undefined>(undefined)
  const { getAll: getGyms } = useGyms()
  const { getAll, changeRole } = useUsers(gymFilter)
  const [pendingRole, setPendingRole] = useState<Record<number, string>>({})
  const [feedback, setFeedback] = useState<Record<number, string>>({})

  const handleRoleChange = (userId: number, role: string) => {
    setPendingRole((prev) => ({ ...prev, [userId]: role }))
  }

  const handleSave = async (userId: number, currentRole: string) => {
    const role = pendingRole[userId] ?? currentRole
    try {
      await changeRole.mutateAsync({ id: userId, role })
      setFeedback((prev) => ({ ...prev, [userId]: 'Saved' }))
      setTimeout(() => setFeedback((prev) => ({ ...prev, [userId]: '' })), 2000)
    } catch {
      setFeedback((prev) => ({ ...prev, [userId]: 'Error' }))
    }
  }

  return (
    <section>
      <h2>Users</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Filter by gym:</label>
        <select
          value={gymFilter ?? ''}
          onChange={(e) => setGymFilter(e.target.value ? Number(e.target.value) : undefined)}
          style={{ padding: '0.4rem 0.6rem' }}
        >
          <option value="">All gyms</option>
          {getGyms.data?.map((g: { id: number; name: string }) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {getAll.isLoading && <p>Loading users…</p>}
      {getAll.isError && <p style={{ color: 'red' }}>Failed to load users.</p>}
      {getAll.data && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['ID', 'Name', 'Email', 'Gym', 'Role', ''].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getAll.data.map((user: { id: number; name: string; email: string; gym_id: number; role: string }) => {
              const selected = pendingRole[user.id] ?? user.role
              const dirty = selected !== user.role
              return (
                <tr key={user.id}>
                  <td style={tdStyle}>{user.id}</td>
                  <td style={tdStyle}>{user.name}</td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>{user.gym_id}</td>
                  <td style={tdStyle}>
                    <select
                      value={selected}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{ padding: '0.2rem 0.4rem' }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleSave(user.id, user.role)}
                      disabled={!dirty || changeRole.isPending}
                      style={{ padding: '0.2rem 0.6rem' }}
                    >
                      Save
                    </button>
                    {feedback[user.id] && (
                      <span style={{ marginLeft: '0.5rem', color: feedback[user.id] === 'Saved' ? 'green' : 'red' }}>
                        {feedback[user.id]}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
            {getAll.data.length === 0 && (
              <tr><td colSpan={6} style={tdStyle}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default function AdminPage() {
  const { logout, user } = useAuth()

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Admin Panel</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>{user?.email}</span>
          <button onClick={() => logout()}>Logout</button>
        </div>
      </div>

      <GymsSection />
      <UsersSection />
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  borderBottom: '2px solid #ddd',
  whiteSpace: 'nowrap'
}

const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #eee'
}
