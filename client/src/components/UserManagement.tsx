
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  UserPlus,
  Users,
  ShieldCheck,
  Search,
  RefreshCw,
} from 'lucide-react';
import './UserManagement.css';

type Props = {
  authToken: string;
  onBack: () => void;
};

type User = {
  id: string;
  fullName: string;
  username: string | null;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  accountId: string | null;
};

export default function UserManagement({ authToken, onBack }: Props) {
  const [page, setPage] = useState<'list' | 'create'>('list');

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'support',
    accountId: '',
  });

  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError('');

    try {
      const response = await fetch('/api/auth/users', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load users.');
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users.');
    } finally {
      setLoadingUsers(false);
    }
  }, [authToken]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter(user => {
      const matchesSearch =
        !term ||
        user.fullName.toLowerCase().includes(term) ||
        (user.username || '').toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);

      const matchesRole =
        roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          accountId: form.role === 'customer' ? form.accountId || null : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create user.');
      }

      setMessage('User created successfully.');
      setPage('list');

      setForm({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'support',
        accountId: '',
      });

      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'User creation failed.');
    } finally {
      setSaving(false);
    }
  }


  async function updateUser(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (!editingUser) return;

  setActionLoading(true);
  setError('');
  setMessage('');

  try {
    const response = await fetch(`/api/auth/users/${editingUser.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: editingUser.fullName,
        username: editingUser.username,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role,
        accountId: editingUser.accountId || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not update user.');
    }

    setMessage('User updated successfully.');
    setEditingUser(null);
    await loadUsers();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'User update failed.');
  } finally {
    setActionLoading(false);
  }
}

async function toggleUserStatus(user: User) {
  const action = user.isActive ? 'deactivate' : 'activate';

  if (!window.confirm(`Are you sure you want to ${action} ${user.fullName}?`)) {
    return;
  }

  setActionLoading(true);
  setError('');
  setMessage('');

  try {
    const response = await fetch(`/api/auth/users/${user.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: !user.isActive }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not update account status.');
    }

    setMessage(data.message);
    await loadUsers();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Status update failed.');
  } finally {
    setActionLoading(false);
  }
}

  return (
    <main className="user-management">
      <button
        className="um-back-button"
        onClick={() => page === 'create' ? setPage('list') : onBack()}
      >
        <ArrowLeft size={17} />
        {page === 'create' ? 'Back to Users' : 'Back to Dashboard'}
      </button>

      <header className="um-page-header">
        <div className="um-header-icon">
          <Users size={25} />
        </div>
        <div>
          <h1>User Management</h1>
          <p>Manage NyotaOne users, staff accounts and access roles.</p>
        </div>
      </header>

      {page === 'create' && (
      <section className="um-form-card">
        <div className="um-card-heading">
          <div className="um-section-icon">
            <UserPlus size={21} />
          </div>
          <div>
            <h2>Create New User</h2>
            <p>Enter the account details and assign the appropriate role.</p>
          </div>
        </div>

        <form onSubmit={createUser}>
          <div className="um-form-grid">
            <label className="um-field">
              <span>Full name *</span>
              <input required value={form.fullName}
                placeholder="Enter full name"
                onChange={e => setForm({ ...form, fullName: e.target.value })} />
            </label>

            <label className="um-field">
              <span>Username</span>
              <input value={form.username}
                placeholder="Enter username"
                onChange={e => setForm({ ...form, username: e.target.value })} />
            </label>

            <label className="um-field">
              <span>Email address *</span>
              <input required type="email" value={form.email}
                placeholder="name@example.com"
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </label>

            <label className="um-field">
              <span>Phone number</span>
              <input type="tel" value={form.phone}
                placeholder="Enter phone number"
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </label>

            <label className="um-field">
              <span>Temporary password *</span>
              <input required type="password" minLength={8}
                value={form.password}
                placeholder="Minimum 8 characters"
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </label>

            <label className="um-field">
              <span>User role *</span>
              <select value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Administrator</option>
                <option value="finance">Finance Staff</option>
                <option value="sales">Sales Staff</option>
                <option value="inventory">Inventory Staff</option>
                <option value="support">Support Staff</option>
                <option value="editor">Editor</option>
                <option value="customer">Customer</option>
              </select>
            </label>

            {form.role === 'customer' && (
              <label className="um-field">
                <span>Customer Account ID</span>
                <input value={form.accountId}
                  placeholder="Enter account ID (optional)"
                  onChange={e => setForm({ ...form, accountId: e.target.value })} />
              </label>
            )}
          </div>

          <div className="um-security-note">
            <ShieldCheck size={19} />
            <span>User access will be controlled by their assigned role.</span>
          </div>

          {error && <div className="um-alert um-error">{error}</div>}
          {message && <div className="um-alert um-success">{message}</div>}

          <div className="um-form-footer">
            <button
              type="button"
              className="um-cancel-button"
              onClick={() => setPage('list')}
            >
              Cancel
            </button>
            <button type="submit" className="um-create-button" disabled={saving}>
              <UserPlus size={18} />
              {saving ? 'Creating User...' : 'Create User'}
            </button>
          </div>
        </form>
      </section>

      )}

      {page === 'list' && (
      <section className="um-directory">
        <div className="um-directory-header">
          <div>
            <h2>Users Directory</h2>
            <p>{users.length} registered users</p>
          </div>

          <div className="um-directory-header-actions">
            <button
              type="button"
              className="um-create-button"
              onClick={() => {
                setMessage('');
                setError('');
                setPage('create');
              }}
            >
              <UserPlus size={17} />
              Create User
            </button>
            <button
              className="um-refresh-button"
              onClick={() => void loadUsers()}
              disabled={loadingUsers}
            >
              <RefreshCw size={16} className={loadingUsers ? 'um-spinning' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="um-directory-tools">
          <div className="um-search">
            <Search size={18} />
            <input
              value={search}
              placeholder="Search name, username or email..."
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="um-role-filter"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">All roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Administrator</option>
            <option value="finance">Finance</option>
            <option value="sales">Sales</option>
            <option value="inventory">Inventory</option>
            <option value="support">Support</option>
            <option value="editor">Editor</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan={5} className="um-empty">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="um-empty">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="um-user-cell">
                        <div className="um-avatar">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{user.fullName}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.username || '—'}</td>
                    <td>
                      <span className="um-role-badge">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
  <span className={`um-status ${user.isActive ? 'active' : 'inactive'}`}>
    {user.isActive ? 'Active' : 'Inactive'}
  </span>
</td>

            <td>
              {user.role === 'superadmin' ? (
                <span className="um-protected">Protected</span>
              ) : (
                <div className="um-actions">
                  <button
                    className="um-edit-button"
                    disabled={actionLoading}
                    onClick={() => setEditingUser({ ...user })}
                  >
                    Edit
                  </button>

                  <button
                    className={user.isActive ? 'um-deactivate-button' : 'um-activate-button'}
                    disabled={actionLoading}
                    onClick={() => void toggleUserStatus(user)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              )}
            </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="um-directory-footer">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </section>


)}

      {page === 'list' && editingUser && (
  <div className="um-modal-overlay">
    <div className="um-modal">
      <div className="um-modal-header">
        <div>
          <h2>Edit User</h2>
          <p>Update user details and access role.</p>
        </div>

        <button
          type="button"
          className="um-modal-close"
          onClick={() => setEditingUser(null)}
        >
          ×
        </button>
      </div>

      <form onSubmit={updateUser}>
        <div className="um-modal-fields">
          <label className="um-field">
            <span>Full name</span>
            <input
              required
              value={editingUser.fullName}
              onChange={e => setEditingUser({
                ...editingUser,
                fullName: e.target.value,
              })}
            />
          </label>

          <label className="um-field">
            <span>Username</span>
            <input
              value={editingUser.username || ''}
              onChange={e => setEditingUser({
                ...editingUser,
                username: e.target.value,
              })}
            />
          </label>

          <label className="um-field">
            <span>Email address</span>
            <input
              required
              type="email"
              value={editingUser.email}
              onChange={e => setEditingUser({
                ...editingUser,
                email: e.target.value,
              })}
            />
          </label>

          <label className="um-field">
            <span>Phone number</span>
            <input
              value={editingUser.phone}
              onChange={e => setEditingUser({
                ...editingUser,
                phone: e.target.value,
              })}
            />
          </label>

          <label className="um-field">
            <span>User role</span>
            <select
              value={editingUser.role}
              onChange={e => setEditingUser({
                ...editingUser,
                role: e.target.value,
                accountId: e.target.value === 'customer'
                  ? editingUser.accountId
                  : null,
              })}
            >
              <option value="admin">Administrator</option>
              <option value="finance">Finance Staff</option>
              <option value="sales">Sales Staff</option>
              <option value="inventory">Inventory Staff</option>
              <option value="support">Support Staff</option>
              <option value="editor">Editor</option>
              <option value="customer">Customer</option>
            </select>
          </label>

          {editingUser.role === 'customer' && (
            <label className="um-field">
              <span>Customer Account ID</span>
              <input
                value={editingUser.accountId || ''}
                onChange={e => setEditingUser({
                  ...editingUser,
                  accountId: e.target.value,
                })}
              />
            </label>
          )}
        </div>

        <div className="um-modal-footer">
          <button
            type="button"
            className="um-cancel-button"
            onClick={() => setEditingUser(null)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="um-create-button"
            disabled={actionLoading}
          >
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </main>
  );
}
