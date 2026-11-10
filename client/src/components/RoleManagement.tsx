
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Save,
  RefreshCw,
  CheckSquare,
} from 'lucide-react';
import './RoleManagement.css';

type Props = {
  authToken: string;
  onBack: () => void;
};

type Permission = {
  permission_key: string;
  permission_name: string;
  module: string;
  description?: string;
};

type Role = {
  role: string;
  permissions: string[];
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  finance: 'Finance Staff',
  sales: 'Sales Staff',
  inventory: 'Inventory Staff',
  support: 'Support Staff',
  editor: 'Editor',
  customer: 'Customer',
};

export default function RoleManagement({ authToken, onBack }: Props) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState('admin');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/roles/permissions', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load permissions.');
      }

      setPermissions(data.permissions || []);
      setRoles(data.roles || []);

      const activeRole = (data.roles || []).find(
        (role: Role) => role.role === selectedRole
      );

      setSelectedPermissions(activeRole?.permissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load permissions.');
    } finally {
      setLoading(false);
    }
  }, [authToken, selectedRole]);

  useEffect(() => {
    void loadPermissions();
  }, [loadPermissions]);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
      if (!groups[permission.module]) {
        groups[permission.module] = [];
      }

      groups[permission.module].push(permission);
      return groups;
    }, {});
  }, [permissions]);

  function changeRole(role: string) {
    setSelectedRole(role);

    const selected = roles.find(item => item.role === role);

    setSelectedPermissions(selected?.permissions || []);
    setMessage('');
    setError('');
  }

  function togglePermission(permissionKey: string) {
    setSelectedPermissions(current =>
      current.includes(permissionKey)
        ? current.filter(key => key !== permissionKey)
        : [...current, permissionKey]
    );

    setMessage('');
  }

  function toggleModule(modulePermissions: Permission[]) {
    const keys = modulePermissions.map(item => item.permission_key);
    const allSelected = keys.every(key => selectedPermissions.includes(key));

    setSelectedPermissions(current =>
      allSelected
        ? current.filter(key => !keys.includes(key))
        : [...new Set([...current, ...keys])]
    );

    setMessage('');
  }

  async function savePermissions() {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        `/api/auth/roles/${selectedRole}/permissions`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            permissions: selectedPermissions,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save permissions.');
      }

      setRoles(current =>
        current.map(role =>
          role.role === selectedRole
            ? { ...role, permissions: selectedPermissions }
            : role
        )
      );

      setMessage('Role permissions saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Permission update failed.');
    } finally {
      setSaving(false);
    }
  }

  const totalPermissions = permissions.length;

  return (
    <main className="role-management">
      <button className="rm-back-button" onClick={onBack}>
        <ArrowLeft size={17} />
        Back to Dashboard
      </button>

      <header className="rm-page-header">
        <div className="rm-header-icon">
          <ShieldCheck size={26} />
        </div>
        <div>
          <h1>Roles & Permissions</h1>
          <p>Control what each NyotaOne staff role can access and manage.</p>
        </div>
      </header>

      <section className="rm-summary">
        <div>
          <span>Available roles</span>
          <strong>{roles.length + 1}</strong>
        </div>
        <div>
          <span>Available permissions</span>
          <strong>{totalPermissions}</strong>
        </div>
        <div>
          <span>Selected role access</span>
          <strong>{selectedPermissions.length}</strong>
        </div>
      </section>

      <section className="rm-main-card">
        <div className="rm-card-heading">
          <div>
            <h2>Manage Role Access</h2>
            <p>Select a role to configure its permissions.</p>
          </div>

          <button
            className="rm-refresh-button"
            onClick={() => void loadPermissions()}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="rm-role-selector">
          <label htmlFor="rm-role-select">Select user role</label>
          <select
            id="rm-role-select"
            value={selectedRole}
            onChange={e => changeRole(e.target.value)}
          >
            {roles.map(role => (
              <option key={role.role} value={role.role}>
                {ROLE_LABELS[role.role] || role.role}
              </option>
            ))}
          </select>
        </div>

        <div className="rm-protected-notice">
          <ShieldCheck size={19} />
          <div>
            <strong>Superadmin protection</strong>
            <p>
              Superadmin has full platform access and cannot be modified
              through this permissions screen.
            </p>
          </div>
        </div>

        {error && <div className="rm-alert rm-error">{error}</div>}
        {message && <div className="rm-alert rm-success">{message}</div>}

        {loading ? (
          <div className="rm-loading">Loading permissions...</div>
        ) : (
          <div className="rm-permission-groups">
            {Object.entries(groupedPermissions).map(([module, items]) => {
              const allSelected = items.every(item =>
                selectedPermissions.includes(item.permission_key)
              );

              return (
                <section className="rm-module" key={module}>
                  <div className="rm-module-heading">
                    <h3>{module}</h3>
                    <button
                      type="button"
                      onClick={() => toggleModule(items)}
                    >
                      <CheckSquare size={15} />
                      {allSelected ? 'Clear all' : 'Select all'}
                    </button>
                  </div>

                  <div className="rm-permission-grid">
                    {items.map(permission => (
                      <label
                        className="rm-permission-item"
                        key={permission.permission_key}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(
                            permission.permission_key
                          )}
                          onChange={() =>
                            togglePermission(permission.permission_key)
                          }
                        />

                        <span>
                          <strong>{permission.permission_name}</strong>
                          <small>{permission.description || permission.permission_key}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="rm-footer">
          <span>
            {selectedPermissions.length} of {totalPermissions} permissions selected
          </span>

          <button
            className="rm-save-button"
            onClick={() => void savePermissions()}
            disabled={loading || saving}
          >
            <Save size={17} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </section>
    </main>
  );
}
