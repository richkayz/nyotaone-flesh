import DomainsPage from './components/DomainsPage';
import Auth from './Auth';
import { useState } from 'react';
import SuperadminDashboard from './components/SuperadminDashboard';
import CustomerManagement from './components/CustomerManagement';
import {
  Inbox, Send, FileText, Archive, Trash2, ShieldAlert,
  Star, Search, Plus, Settings, HelpCircle, Menu,
  Paperclip, MoreHorizontal, ChevronDown, ArrowLeft,
  Mail, Clock, Sparkles, X, Reply, Forward, Check,
  Circle, LogOut
} from 'lucide-react';
import './App.css';

type Email = {
  id: number;
  sender: string;
  email: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  initials: string;
  color: string;
  unread: boolean;
  starred: boolean;
  folder: string;
};

const initialEmails: Email[] = [
  {
    id: 1,
    sender: 'Sarah Mitchell',
    email: 'sarah@designstudio.com',
    subject: 'The new project designs are ready',
    preview: 'Hi Richard, I have attached the latest designs for your review...',
    body: 'Hi Richard,\n\nI have attached the latest designs for your review. The team has completed the main layouts and we are ready for your feedback.\n\nLet me know what you think. Looking forward to hearing from you.\n\nBest regards,\nSarah',
    time: '10:42 AM',
    initials: 'SM',
    color: '#e9d5ff',
    unread: true,
    starred: true,
    folder: 'Inbox',
  },
  {
    id: 2,
    sender: 'David Thompson',
    email: 'david@techpartners.com',
    subject: 'Partnership proposal — NyotaOne',
    preview: 'Following our discussion yesterday, please find our proposal...',
    body: 'Hello Richard,\n\nFollowing our discussion yesterday, please find our partnership proposal attached.\n\nWe believe this opportunity could be beneficial for both teams.\n\nRegards,\nDavid',
    time: '9:18 AM',
    initials: 'DT',
    color: '#dbeafe',
    unread: true,
    starred: false,
    folder: 'Inbox',
  },
  {
    id: 3,
    sender: 'Microsoft 365',
    email: 'updates@microsoft.com',
    subject: 'Your monthly account summary',
    preview: 'Here is your account activity summary for this month...',
    body: 'Your monthly account summary is ready. Review your account activity and settings.',
    time: 'Yesterday',
    initials: 'M',
    color: '#d1fae5',
    unread: false,
    starred: false,
    folder: 'Inbox',
  },
  {
    id: 4,
    sender: 'James Okello',
    email: 'james@business.co.ug',
    subject: 'Meeting confirmation for Friday',
    preview: 'Just confirming our meeting scheduled for Friday at 2 PM...',
    body: 'Hi Richard,\n\nJust confirming our meeting scheduled for Friday at 2 PM.\n\nSee you then!\n\nJames',
    time: 'Yesterday',
    initials: 'JO',
    color: '#ffedd5',
    unread: false,
    starred: true,
    folder: 'Inbox',
  },
  {
    id: 5,
    sender: 'NyotaOne Support',
    email: 'support@nyotaone.com',
    subject: 'Welcome to your new workspace',
    preview: 'Welcome to NyotaOne Mail. Your workspace is ready...',
    body: 'Welcome to NyotaOne Mail!\n\nYour workspace is ready. We are excited to help you manage your business communication in one place.\n\nNyotaOne Support',
    time: 'Monday',
    initials: 'N',
    color: '#dbeafe',
    unread: false,
    starred: false,
    folder: 'Inbox',
  },
];

const folders = [
  { name: 'Inbox', icon: Inbox },
  { name: 'Starred', icon: Star },
  { name: 'Sent', icon: Send },
  { name: 'Drafts', icon: FileText },
  { name: 'Archive', icon: Archive },
  { name: 'Spam', icon: ShieldAlert },
  { name: 'Trash', icon: Trash2 },
];

function App() {
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem('nyotaone_token')
  );

  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const savedUser = localStorage.getItem('nyotaone_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('nyotaone_user');
      return null;
    }
  });

  function handleLogin(token: string, user: any) {
    localStorage.setItem('nyotaone_token', token);
    localStorage.setItem('nyotaone_user', JSON.stringify(user));
    setAuthToken(token);
    setCurrentUser(user);
  }

  function handleLogout() {
    localStorage.removeItem('nyotaone_token');
    localStorage.removeItem('nyotaone_user');
    setAuthToken(null);
    setCurrentUser(null);
  }
  const [adminPage, setAdminPage] = useState<
  'dashboard' | 'domains' | 'customers'
>('dashboard');
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [activeFolder, setActiveFolder] = useState('Inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [search, setSearch] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileReading, setMobileReading] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const filteredEmails = emails.filter((email) => {
    const matchesFolder =
      activeFolder === 'Inbox'
        ? email.folder === 'Inbox'
        : activeFolder === 'Starred'
          ? email.starred
          : email.folder === activeFolder;

    const searchText = `${email.sender} ${email.email} ${email.subject} ${email.preview}`.toLowerCase();
    return matchesFolder && searchText.includes(search.toLowerCase());
  });

  function openEmail(email: Email) {
    setSelectedEmail(email);
    setMobileReading(true);
    setEmails((previous) =>
      previous.map((item) =>
        item.id === email.id ? { ...item, unread: false } : item
      )
    );
  }

  function toggleStar(id: number) {
    setEmails((previous) =>
      previous.map((email) =>
        email.id === id ? { ...email, starred: !email.starred } : email
      )
    );

    setSelectedEmail((previous) =>
      previous?.id === id ? { ...previous, starred: !previous.starred } : previous
    );
  }

  function sendEmail() {
    if (!recipient.trim() || !subject.trim()) return;

    const newEmail: Email = {
      id: Date.now(),
      sender: currentUser?.full_name || currentUser?.fullName || 'You',
      email: currentUser?.email || 'you@nyotaone.com',
      subject,
      preview: message,
      body: message,
      time: 'Just now',
      initials: (currentUser?.full_name || currentUser?.fullName || 'Y')
        .split(' ')
        .map((part: string) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      color: '#dbeafe',
      unread: false,
      starred: false,
      folder: 'Sent',
    };

    setEmails((previous) => [newEmail, ...previous]);
    setComposeOpen(false);
    setRecipient('');
    setSubject('');
    setMessage('');
    setActiveFolder('Sent');
    setSelectedEmail(newEmail);
    setMobileReading(true);
  }

  if (!authToken) {
    return <Auth onLogin={handleLogin} />;
  }

if (currentUser?.role === 'superadmin') {
  if (adminPage === 'domains') {
    return (
      <DomainsPage
        onBack={() => setAdminPage('dashboard')}
      />
    );
  }

  if (adminPage === 'customers') {
  return (
    <CustomerManagement
      authToken={authToken!}
      onBack={() => setAdminPage('dashboard')}
      onLogout={handleLogout}
      onOpenDomains={() => setAdminPage('domains')}
    />
  );
}

  return (
   <SuperadminDashboard
      currentUser={currentUser}
      onLogout={handleLogout}
      onOpenDomains={() => setAdminPage('domains')}
      onOpenCustomers={() => setAdminPage('customers')}
    />
  );
}

  return (
    <div className="mail-app">
      <header className="topbar">
        <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
          <Menu size={20} />
        </button>

        <div className="brand">
          <div className="brand-mark"><Mail size={21} /></div>
          <span>nyota<span className="brand-highlight">one</span></span>
          <span className="brand-divider">/</span>
          <span className="brand-product">Mail</span>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search your emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-shortcut">⌘ K</span>
        </div>

        <div className="topbar-actions">
          <button className="icon-button" title="Help" aria-label="Help"><HelpCircle size={19} /></button>
          <button className="icon-button" title="Settings" aria-label="Settings"><Settings size={19} /></button>
          <div className="topbar-divider" />
          <button className="profile-button" onClick={handleLogout} title="Log out">
            <span className="profile-avatar">
              {(currentUser?.full_name || currentUser?.fullName || 'R').charAt(0).toUpperCase()}
            </span>
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
          <div className="sidebar-heading">
            <span>WORKSPACE</span>
            <button className="icon-button small" aria-label="Workspace options"><MoreHorizontal size={17} /></button>
          </div>

          <button className="compose-button" onClick={() => setComposeOpen(true)}>
            <Plus size={19} />
            <span>Compose</span>
          </button>

          <nav className="folder-nav">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.name}
                  className={`folder-item ${activeFolder === folder.name ? 'active' : ''}`}
                  onClick={() => {
                    setActiveFolder(folder.name);
                    setSelectedEmail(null);
                    setMobileReading(false);
                    setMobileMenu(false);
                  }}
                >
                  <Icon size={18} />
                  <span>{folder.name}</span>
                  {folder.name === 'Inbox' && (
                    <span className="folder-count">
                      {emails.filter((email) => email.folder === 'Inbox' && email.unread).length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-section">
            <div className="sidebar-heading">
              <span>LABELS</span>
              <button className="icon-button small" aria-label="Add label"><Plus size={15} /></button>
            </div>
            <button className="label-item"><span className="label-dot blue" /> Work</button>
            <button className="label-item"><span className="label-dot purple" /> Personal</button>
            <button className="label-item"><span className="label-dot green" /> Important</button>
          </div>

          <div className="sidebar-bottom">
            <div className="storage-card">
              <div className="storage-top">
                <span>Storage</span>
                <span>24%</span>
              </div>
              <div className="storage-track"><div /></div>
              <p>2.4 GB of 10 GB used</p>
            </div>
            <div className="account-card">
              <div className="account-avatar">
                {(currentUser?.full_name || currentUser?.fullName || 'R').charAt(0).toUpperCase()}
              </div>
              <div className="account-info">
                <strong>{currentUser?.full_name || currentUser?.fullName || 'Account user'}</strong>
                <span>{currentUser?.email || 'Mailbox account'}</span>
              </div>
              <button className="icon-button" onClick={handleLogout} title="Log out" aria-label="Log out"><LogOut size={16} /></button>
            </div>
          </div>
        </aside>

        <main className={`email-list ${mobileReading ? 'hide-mobile' : ''}`}>
          <div className="list-header">
            <div>
              <div className="list-title-row">
                <h1>{activeFolder}</h1>
                <span className="email-total">{filteredEmails.length}</span>
              </div>
              <p>Your messages and conversations</p>
            </div>
            <div className="list-actions">
              <button className="icon-button" title="Filter" aria-label="Filter"><Circle size={17} /></button>
              <button className="icon-button" title="More" aria-label="More"><MoreHorizontal size={19} /></button>
            </div>
          </div>

          <div className="email-toolbar">
            <button className="toolbar-select" aria-label="Select messages"><input type="checkbox" aria-label="Select all" /> <ChevronDown size={14} /></button>
            <span className="toolbar-label">All messages</span>
            <button className="icon-button" aria-label="Sort messages"><Clock size={17} /></button>
          </div>

          <div className="email-items">
            {filteredEmails.length === 0 ? (
              <div className="empty-state">
                <Mail size={32} />
                <h3>No messages here</h3>
                <p>This folder is empty or no messages match your search.</p>
              </div>
            ) : filteredEmails.map((email) => (
              <div
                key={email.id}
                className={`email-item ${email.unread ? 'unread' : ''} ${selectedEmail?.id === email.id ? 'selected' : ''}`}
                onClick={() => openEmail(email)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') openEmail(email);
                }}
              >
                <input type="checkbox" onClick={(e) => e.stopPropagation()} aria-label={`Select ${email.subject}`} />
                <button
                  className={`star-button ${email.starred ? 'starred' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(email.id);
                  }}
                  aria-label="Toggle star"
                >
                  <Star size={17} fill={email.starred ? 'currentColor' : 'none'} />
                </button>
                <div className="sender-avatar" style={{ background: email.color }}>{email.initials}</div>
                <div className="email-content">
                  <div className="email-sender">{email.sender}</div>
                  <div className="email-subject">{email.subject}</div>
                  <div className="email-preview">{email.preview}</div>
                </div>
                <span className="email-time">{email.time}</span>
              </div>
            ))}
          </div>

          <div className="list-footer">
            Showing {filteredEmails.length} of {filteredEmails.length} messages
          </div>
        </main>

        <section className={`reading-pane ${mobileReading ? 'reading-mobile' : ''}`}>
          {selectedEmail ? (
            <>
              <div className="reading-toolbar">
                <button className="icon-button mobile-back" onClick={() => setMobileReading(false)} aria-label="Back to messages">
                  <ArrowLeft size={19} />
                </button>
                <div className="reading-toolbar-actions">
                  <button className="icon-button" aria-label="Archive"><Archive size={17} /></button>
                  <button className="icon-button" aria-label="Mark as spam"><ShieldAlert size={17} /></button>
                  <button className="icon-button" aria-label="Delete"><Trash2 size={17} /></button>
                  <div className="toolbar-divider" />
                  <button className="icon-button" aria-label="More message actions"><MoreHorizontal size={18} /></button>
                </div>
              </div>

              <div className="message-view">
                <div className="message-subject-row">
                  <h2>{selectedEmail.subject}</h2>
                  <button
                    className={`star-button ${selectedEmail.starred ? 'starred' : ''}`}
                    onClick={() => toggleStar(selectedEmail.id)}
                    aria-label="Toggle star"
                  >
                    <Star size={19} fill={selectedEmail.starred ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="message-labels">
                  <span className="message-label">{selectedEmail.folder}</span>
                  <span className="message-label blue-label">Work</span>
                </div>

                <div className="message-sender-row">
                  <div className="sender-avatar large" style={{ background: selectedEmail.color }}>{selectedEmail.initials}</div>
                  <div className="message-sender-info">
                    <strong>{selectedEmail.sender}</strong>
                    <span>{selectedEmail.email}</span>
                    <span className="message-to">to me <ChevronDown size={13} /></span>
                  </div>
                  <span className="message-date">{selectedEmail.time}</span>
                  <button className="icon-button" aria-label="Reply"><Reply size={17} /></button>
                  <button className="icon-button" aria-label="More sender actions"><MoreHorizontal size={18} /></button>
                </div>

                <div className="message-body">
                  {selectedEmail.body.split('\n').map((line, index) => (
                    <p key={index}>{line || '\u00A0'}</p>
                  ))}
                </div>

                <div className="message-actions">
                  <button className="reply-button"><Reply size={16} /> Reply</button>
                  <button className="reply-button"><Forward size={16} /> Forward</button>
                </div>
              </div>
            </>
          ) : (
            <div className="welcome-pane">
              <div className="welcome-illustration">
                <div className="welcome-icon"><Mail size={34} /></div>
                <div className="welcome-sparkle"><Sparkles size={18} /></div>
              </div>
              <h2>Your inbox, in good hands.</h2>
              <p>Select a message to read it here, or start a new conversation.</p>
              <button className="welcome-compose" onClick={() => setComposeOpen(true)}>
                <Plus size={17} /> Compose email
              </button>
              <div className="welcome-footer"><Check size={14} /> Your workspace is ready</div>
            </div>
          )}
        </section>
      </div>

      <footer className="app-footer">
        <span><span className="online-dot" /> NyotaOne Mail</span>
        <span>Secure business communication</span>
        <span>© 2026 NyotaOne</span>
      </footer>

      {composeOpen && (
        <div className="compose-overlay" onClick={() => setComposeOpen(false)}>
          <div className="compose-window" onClick={(e) => e.stopPropagation()}>
            <div className="compose-header">
              <div><Mail size={17} /> <strong>New message</strong></div>
              <button className="icon-button" onClick={() => setComposeOpen(false)} aria-label="Close compose"><X size={18} /></button>
            </div>
            <input
              className="compose-input"
              placeholder="To"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <input
              className="compose-input"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <textarea
              className="compose-body"
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="compose-footer">
              <button className="send-button" onClick={sendEmail}><Send size={16} /> Send message</button>
              <button className="icon-button" title="Attach file" aria-label="Attach file"><Paperclip size={18} /></button>
              <button className="icon-button" title="More options" aria-label="More options"><MoreHorizontal size={18} /></button>
              <button className="icon-button delete-compose" onClick={() => setComposeOpen(false)} title="Discard" aria-label="Discard"><Trash2 size={17} /></button>
            </div>
            <p className="compose-note">Demo interface — messages are not sent to real email accounts.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
