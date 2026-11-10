import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Globe,
  Mail,
  Server,
  ShoppingCart,
  Receipt,
  CreditCard,
  Headset,
  Settings,
  LogOut,
  ArrowLeft,
  Search,
  RefreshCw,
  Menu,
  X,
  Pencil,
  Save,
  User,
} from 'lucide-react';

import './SuperadminDashboard.css';
import './CustomerManagement.css';

type Customer = {
  id?: number | string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: string;
  login?: string;
};

type CustomerManagementProps = {
  authToken: string;
  onBack: () => void;
  onLogout?: () => void;
  onOpenDomains?: () => void;
};

export default function CustomerManagement({
  authToken,
  onBack,
  onLogout,
  onOpenDomains,
}: CustomerManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadCustomers(searchTerm = '') {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://localhost:3000/api/plesk/customers',
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load Plesk customers.'
        );
      }

      const list: Customer[] = Array.isArray(data.customers)
        ? data.customers
        : [];

      const filtered = list.filter((customer) =>
        [
          customer.name,
          customer.company,
          customer.email,
          customer.phone,
          customer.login,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(searchTerm.trim().toLowerCase())
          )
      );

      setCustomers(filtered);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load customers.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, [authToken]);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    loadCustomers(search);
  }

  async function saveCustomer() {
    if (!selectedCustomer?.id) {
      setError('Customer ID is missing.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:3000/api/plesk/customers/${selectedCustomer.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
            body: JSON.stringify({
            name: selectedCustomer.name,
            company: selectedCustomer.company,
            email: selectedCustomer.email,
            phone: selectedCustomer.phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to update customer.'
        );
      }

      setSelectedCustomer(null);
      await loadCustomers(search);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Customer update failed.'
      );
    } finally {
      setSaving(false);
    }
  }

  const navigation = [
    { label: 'Dashboard', icon: LayoutDashboard, action: onBack },
    { label: 'Customers & Accounts', icon: Users, active: true },
    { label: 'Domains', icon: Globe, action: onOpenDomains },
    { label: 'Business Email', icon: Mail },
    { label: 'Hosting & Websites', icon: Server },
    { label: 'Orders', icon: ShoppingCart },
    { label: 'Invoices', icon: Receipt },
    { label: 'Payments', icon: CreditCard },
    { label: 'Support', icon: Headset },
    { label: 'Settings', icon: Settings },
  ];

  return (
    <div className="admin-dashboard customers-admin-layout">
      <aside
        className={`admin-sidebar ${
          mobileMenu ? 'customers-sidebar-open' : ''
        }`}
      >
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <LayoutDashboard size={22} />
          </div>
          <span>
            nyota<span>one</span>
          </span>

          <button
            className="customers-mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-sidebar-label">
          ADMINISTRATION
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className={`admin-nav-item ${
                item.active ? 'active' : ''
              }`}
              onClick={item.action}
              disabled={!item.action && !item.active}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}

        <button
          className="admin-logout"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <main className="admin-main customers-admin-main">
        <header className="customers-topbar">
          <button
            className="customers-menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Menu size={21} />
          </button>

          <div className="customers-topbar-title">
            NyotaOne Administration
          </div>

          <button
            className="customers-profile"
            onClick={onLogout}
            title="Sign out"
          >
            <User size={18} />
          </button>
        </header>

        <div className="customers-main-content">
          <div className="customers-heading">
            <div>
              <button
                className="customers-back"
                onClick={onBack}
              >
                <ArrowLeft size={16} />
                Dashboard
              </button>

              <h1>Customers & Accounts</h1>
              <p>
                Manage customer accounts and contact information.
              </p>
            </div>

            <button
              className="customers-refresh"
              onClick={() => loadCustomers(search)}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <section className="customers-content">
           <div className="customers-toolbar">
            <div>
              <h2>Customer Accounts</h2>
              <p>Customer records retrieved from Plesk</p>
            </div>

            <div className="customers-total">
              <span>Total Customers</span>
              <strong>{customers.length}</strong>
            </div>
          </div>

            <form
              className="customers-search"
              onSubmit={handleSearch}
            >
              <Search size={18} />

              <input
                placeholder="Search name, email, phone or account..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              <button type="submit">Search</button>
            </form>

            {error && (
              <div className="customers-error">
                {error}
              </div>
            )}

            <div className="customers-table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="customers-empty">
                        Loading customers...
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="customers-empty">
                        No customer accounts found.
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer, index) => (
                      <tr
                        key={customer.id ?? customer.login ?? index}
                      >
                        <td>
                          <div className="customers-identity">
                            <div className="customers-avatar">
                              {(customer.name || customer.company || 'C')
                                .trim()
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((part) => part.charAt(0).toUpperCase())
                                .join('')}
                            </div>

                            <strong>{customer.name || 'Unnamed Customer'}</strong>
                          </div>
                        </td>

                        <td>{customer.company || '—'}</td>
                        <td>{customer.email || '—'}</td>
                        <td>{customer.phone || '—'}</td>
                        <td>{customer.login || '—'}</td>

                        <td>
                          
                        <span
                          className={`customers-status ${
                            Number(customer.status) === 0
                              ? 'status-active'
                              : Number(customer.status) === 1
                              ? 'status-inactive'
                              : 'status-unknown'
                          }`}
                        >
                          {Number(customer.status) === 0
                            ? 'Active'
                            : Number(customer.status) === 1
                            ? 'Inactive'
                            : 'Unknown'}
                        </span>

                        </td>

                        <td>
                          <button
                            className="customers-edit-button"
                            onClick={() =>
                              setSelectedCustomer({ ...customer })
                            }
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="customers-page-footer">
            <span>NyotaOne Administration</span>
            <span>© 2026 NyotaOne. All rights reserved.</span>
          </footer>
        </div>
      </main>

      {selectedCustomer && (
        <div
          className="customers-modal-overlay"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="customers-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="customers-modal-header">
              <div>
                <h2>Edit Customer</h2>
                <p>Update customer contact information.</p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Customer Name
              <input
                value={selectedCustomer.name || ''}
                onChange={(event) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    name: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Company
              <input
                value={selectedCustomer.company || ''}
                onChange={(event) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    company: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={selectedCustomer.email || ''}
                onChange={(event) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    email: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Phone
              <input
                value={selectedCustomer.phone || ''}
                onChange={(event) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    phone: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Login Username
              <input
                value={selectedCustomer.login || ''}
                disabled
              />
            </label>

            <div className="customers-modal-actions">
              <button
                className="customers-cancel-button"
                onClick={() => setSelectedCustomer(null)}
              >
                Cancel
              </button>

              <button
                className="customers-save-button"
                onClick={saveCustomer}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}