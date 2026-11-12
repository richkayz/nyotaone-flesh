import {
  Activity, Bell, ChevronDown, CircleHelp, CreditCard, Globe2, Headset,
  LayoutDashboard, LogOut, Mail, Menu, Package, ReceiptText, Search,
  Server, Settings2, ShieldCheck, ShoppingCart, Users, ArrowUpRight, X
} from 'lucide-react';
import { useState } from 'react';
import './SuperadminDashboard.css';

type Props = {
  currentUser: any;
  onLogout: () => void;
  onOpenDomains: () => void;
  onOpenCustomers: () => void;
  onOpenUsers: () => void;
  onOpenRoles: () => void;
};

export default function SuperadminDashboard({
  currentUser, onLogout, onOpenDomains, onOpenCustomers, onOpenUsers, onOpenRoles
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const name = currentUser?.full_name || currentUser?.fullName || 'Administrator';
  const initials = name.split(/\\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase();

  const sections = [
    { title: 'WORKSPACE', items: [{ label: 'Overview', icon: LayoutDashboard, action: () => {}, active: true }] },
    { title: 'MANAGEMENT', items: [
      { label: 'Customers & accounts', icon: Users, action: onOpenCustomers },
      { label: 'Users', icon: Users, action: onOpenUsers },
      { label: 'Roles & permissions', icon: ShieldCheck, action: onOpenRoles },
    ]},
    { title: 'SERVICES', items: [
      { label: 'Domains', icon: Globe2, action: onOpenDomains },
      { label: 'Business email', icon: Mail },
      { label: 'Hosting & websites', icon: Server },
      { label: 'Website builder', icon: LayoutDashboard },
    ]},
    { title: 'COMMERCE & FINANCE', items: [
      { label: 'Products & inventory', icon: Package },
      { label: 'Orders', icon: ShoppingCart },
      { label: 'Invoices', icon: ReceiptText },
      { label: 'Payments', icon: CreditCard },
      { label: 'Support', icon: Headset },
    ]},
    { title: 'SYSTEM', items: [{ label: 'Settings', icon: Settings2 }] },
  ];

  const metrics = [
    { label: 'Customer accounts', icon: Users, note: 'Registered organisations' },
    { label: 'Active services', icon: Activity, note: 'Across customer accounts' },
    { label: 'Outstanding invoices', icon: ReceiptText, note: 'Awaiting payment' },
    { label: 'Open support tickets', icon: Headset, note: 'Requiring attention' },
  ];

  const cards = [
    { title: 'Customers & accounts', text: 'Manage customer organisations and account ownership.', icon: Users, action: onOpenCustomers, tag: 'CORE' },
    { title: 'Users & access', text: 'Manage platform users, roles and permissions.', icon: ShieldCheck, action: onOpenUsers, tag: 'SECURITY' },
    { title: 'Domains', text: 'Review domains synchronised from Plesk.', icon: Globe2, action: onOpenDomains, tag: 'SERVICES' },
    { title: 'Business email', text: 'Manage mailboxes and email allocations.', icon: Mail, tag: 'PLANNED' },
    { title: 'Hosting & websites', text: 'Manage hosting plans and customer websites.', icon: Server, tag: 'PLANNED' },
    { title: 'Orders & billing', text: 'Review orders, invoices and payments.', icon: ReceiptText, tag: 'PLANNED' },
  ];

  return (
    <div className="ny-admin">
      {menuOpen && <button className="ny-admin-scrim" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
      <aside className={`ny-admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="ny-admin-brand">
          <div className="ny-admin-logo">N</div><span>nyota<span>one</span></span>
          <button className="ny-admin-mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={18}/></button>
        </div>
        <div className="ny-admin-workspace"><i/> Platform administration <ChevronDown size={14}/></div>
        <nav>
          {sections.map(section => <div className="ny-admin-nav-section" key={section.title}>
            <div className="ny-admin-nav-label">{section.title}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              const disabled = !item.action;
              return <button key={item.label} className={`ny-admin-nav-item ${item.active ? 'active' : ''}`} disabled={disabled} onClick={() => { item.action?.(); setMenuOpen(false); }}>
                <Icon size={17}/><span>{item.label}</span>{disabled && <small>Soon</small>}
              </button>;
            })}
          </div>)}
        </nav>
        <div className="ny-admin-sidebar-bottom">
          <div className="ny-admin-help"><CircleHelp size={18}/><div><b>Need a hand?</b><span>Visit the help centre</span></div></div>
          <div className="ny-admin-profile"><div className="ny-admin-avatar">{initials || 'A'}</div><div className="ny-admin-profile-text"><b>{name}</b><span>Superadmin</span></div><button onClick={onLogout} title="Sign out" aria-label="Sign out"><LogOut size={17}/></button></div>
        </div>
      </aside>

      <main className="ny-admin-main">
        <header className="ny-admin-topbar">
          <div className="ny-admin-top-left">
            <button className="ny-admin-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={20}/></button>
            <div className="ny-admin-crumb">NyotaOne <span>/</span> <b>Overview</b></div>
          </div>
          <div className="ny-admin-top-actions">
            <label className="ny-admin-search"><Search size={16}/><input placeholder="Search anything..." aria-label="Search platform"/><kbd>⌘ K</kbd></label>
            <button className="ny-admin-notice" aria-label="Notifications"><Bell size={18}/><i/></button>
            <div className="ny-admin-top-profile"><div className="ny-admin-avatar">{initials || 'A'}</div><div><b>{name}</b><span>Platform admin</span></div><ChevronDown size={14}/></div>
          </div>
        </header>

        <div className="ny-admin-content">
          <section className="ny-admin-welcome">
            <div><small>PLATFORM OVERVIEW</small><h1>Good to see you, {name.split(' ')[0]}.</h1><p>Here is what is happening across your NyotaOne platform.</p></div>
            <div className="ny-admin-orbit"><div>N</div></div>
          </section>

          <section className="ny-admin-metrics">
            {metrics.map(metric => { const Icon = metric.icon; return <article key={metric.label}>
              <div className="ny-admin-metric-head"><span>{metric.label}</span><i><Icon size={18}/></i></div>
              <strong>—</strong><small>{metric.note}</small>
            </article>; })}
          </section>

          <div className="ny-admin-section-head"><div><h2>Platform management</h2><p>Manage customers, services and daily operations.</p></div><button onClick={onOpenCustomers}>View customers <ArrowUpRight size={15}/></button></div>

          <section className="ny-admin-cards">
            {cards.map(card => { const Icon = card.icon; return <button key={card.title} className={`ny-admin-card ${!card.action ? 'planned' : ''}`} disabled={!card.action} onClick={card.action}>
              <div className="ny-admin-card-head"><i><Icon size={20}/></i><small>{card.tag}</small><ArrowUpRight size={16}/></div>
              <h3>{card.title}</h3><p>{card.text}</p>
              {!card.action && <em>Coming in a later phase</em>}
            </button>; })}
          </section>

          <section className="ny-admin-lower">
            <article className="ny-admin-panel"><div className="ny-admin-panel-head"><div><h2>Recent activity</h2><p>Latest changes across the platform</p></div></div>
              <div className="ny-admin-empty"><i><Activity size={20}/></i><b>Activity will appear here</b><span>Customer registrations, service changes and payments will be listed here when activity tracking is connected.</span></div>
            </article>
            <article className="ny-admin-panel"><div className="ny-admin-panel-head"><div><h2>Platform services</h2><p>Connection status overview</p></div><small>NOT CHECKED</small></div>
              {[['Application server','Backend health check',Server],['Plesk connection','Hosting control panel',Globe2],['Database','MariaDB connection',Activity]].map(([label,desc,Icon]: any) => <div className="ny-admin-service" key={label}><i><Icon size={16}/></i><div><b>{label}</b><span>{desc}</span></div><small>Unknown</small></div>)}
              <p className="ny-admin-health-note">Live health indicators will appear after monitoring endpoints are connected.</p>
            </article>
          </section>
          <footer className="ny-admin-footer"><span>© {new Date().getFullYear()} NyotaOne</span><span>Business services, connected.</span></footer>
        </div>
      </main>
    </div>
  );
}
