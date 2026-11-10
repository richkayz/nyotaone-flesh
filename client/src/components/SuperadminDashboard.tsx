import {
  LayoutDashboard,
  Users,
  Globe,
  Mail,
  ShoppingCart,
  Receipt,
  CreditCard,
  Headset,
  Settings,
  LogOut,
  Server,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

import './SuperadminDashboard.css';

type SuperadminDashboardProps = {
  currentUser: any;
  onLogout: () => void;
  onOpenDomains: () => void;
  onOpenCustomers: () => void;
  onOpenUsers: () => void;
  onOpenRoles: () => void;
};

const dashboardItems = [
  {
    title: 'Customers & Accounts',
    description: 'Manage customer accounts and users',
    icon: Users,
  },
  {
    title: 'Users & Roles',
    description: 'Create staff accounts and manage user access',
    icon: Users,
  },
  {
    title: 'Roles & Permissions',
    description: 'Control what each staff role can access',
    icon: ShieldCheck,
  },
  {
    title: 'Domains',
    description: 'Manage domains and hosting services',
    icon: Globe,
  },
  {
    title: 'Business Email',
    description: 'Manage email services and subscriptions',
    icon: Mail,
  },
  {
    title: 'Hosting & Websites',
    description: 'Manage hosting plans and websites',
    icon: Server,
  },
  {
    title: 'Orders',
    description: 'View customer orders',
    icon: ShoppingCart,
  },
  {
    title: 'Invoices',
    description: 'Manage billing and invoices',
    icon: Receipt,
  },
  {
    title: 'Payments',
    description: 'Review payments and transactions',
    icon: CreditCard,
  },
  {
    title: 'Support',
    description: 'Manage customer support tickets',
    icon: Headset,
  },
  {
    title: 'Settings',
    description: 'Manage platform settings',
    icon: Settings,
  },
];

export default function SuperadminDashboard({
  currentUser,
  onLogout,
  onOpenDomains,
  onOpenCustomers,
  onOpenUsers,
  onOpenRoles,
}: SuperadminDashboardProps) {
  const name =
    currentUser?.full_name ||
    currentUser?.fullName ||
    'Administrator';

  function handleNavigation(title: string) {
    switch (title) {
      case 'Domains':
        onOpenDomains();
        break;

      case 'Customers & Accounts':
        onOpenCustomers();
        break;

      case 'Users & Roles':
        onOpenUsers();
        break;

      case 'Roles & Permissions':
        onOpenRoles();
        break;

      default:
        break;
    }
  }

  function isEnabled(title: string) {
    return [
      'Domains',
      'Customers & Accounts',
      'Users & Roles',
      'Roles & Permissions',
    ].includes(title);
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <LayoutDashboard size={22} />
          </div>

          <span>
            nyota<span>one</span>
          </span>
        </div>

        <div className="admin-sidebar-label">
          ADMINISTRATION
        </div>

        <div className="admin-nav-item active">
          <LayoutDashboard size={18} />
          Dashboard
        </div>

        <div className="admin-sidebar-label">
          MANAGEMENT
        </div>

        {dashboardItems.map((item) => {
          const Icon = item.icon;
          const enabled = isEnabled(item.title);

          return (
            <button
              type="button"
              className="admin-nav-item"
              key={item.title}
              onClick={() => handleNavigation(item.title)}
              disabled={!enabled}
              title={!enabled ? 'Coming soon' : item.title}
            >
              <Icon size={18} />
              {item.title}
            </button>
          );
        })}

        <button
          type="button"
          className="admin-logout"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Superadmin Dashboard</h1>
            <p>
              Manage your NyotaOne platform from one place.
            </p>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">
              {name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{name}</strong>
              <span>Superadmin</span>
            </div>
          </div>
        </header>

        <section className="admin-welcome">
          <div>
            <h2>Welcome back, {name}</h2>

            <p>
              Your central workspace for customers, users,
              roles, permissions, domains, services, billing and support.
            </p>
          </div>

          <LayoutDashboard size={42} />
        </section>

        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <h2>Platform Management</h2>
              <p>Select a section to manage your business.</p>
            </div>
          </div>

          <div className="admin-grid">
            {dashboardItems.map((item) => {
              const Icon = item.icon;
              const enabled = isEnabled(item.title);

              return (
                <button
                  type="button"
                  className="admin-card"
                  key={item.title}
                  onClick={() => handleNavigation(item.title)}
                  disabled={!enabled}
                  style={{
                    cursor: enabled ? 'pointer' : 'default',
                    textAlign: 'left',
                    font: 'inherit',
                  }}
                  title={!enabled ? 'Coming soon' : item.title}
                >
                  <div className="admin-card-icon">
                    <Icon size={21} />
                  </div>

                  <h3>{item.title}</h3>
                  <p>{item.description}</p>

                  <span className="admin-card-arrow">
                    <ArrowUpRight size={17} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="admin-footer">
          NyotaOne Administration · 2026
        </footer>
      </main>
    </div>
  );
}
