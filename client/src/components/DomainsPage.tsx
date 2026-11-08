
import './DomainsPage.css';
import { useCallback, useEffect, useState } from 'react';
import {
  Globe,
  RefreshCw,
  Search,
  ArrowLeft,
  Circle,
} from 'lucide-react';

type DomainsPageProps = {
  onBack: () => void;
};

type Domain = {
  id: number;
  domain_name: string;
  status: string | null;
  hosting_type: string | null;
  account_id: number | null;
  sync_status: string;
  last_synced_at: string | null;
  sync_error: string | null;
};

export default function DomainsPage({ onBack }: DomainsPageProps) {
  const [search, setSearch] = useState('');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('nyotaone_token');

  const loadDomains = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/plesk/domains', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load domains.');
      }

      setDomains(data.domains || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load domains.'
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDomains();
  }, [loadDomains]);

  const handleSync = async () => {
    setSyncing(true);
    setError('');

    try {
      const response = await fetch('/api/plesk/sync-domains', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Plesk synchronization failed.'
        );
      }

      await loadDomains();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Plesk synchronization failed.'
      );
    } finally {
      setSyncing(false);
    }
  };

  const filteredDomains = domains.filter((domain) =>
    domain.domain_name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="domains-page">
      <header className="domains-header">
        <div>
          <button className="domains-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <h1>
            <Globe size={25} />
            Domains
          </h1>

          <p>
            Manage domains registered and hosted through NyotaOne.
          </p>
        </div>

        <button
          className="domains-sync"
          onClick={handleSync}
          disabled={syncing || loading}
        >
          <RefreshCw
            size={16}
            className={syncing ? 'domains-spinning' : ''}
          />
          {syncing ? 'Synchronizing...' : 'Sync from Plesk'}
        </button>
      </header>

      <div className="domains-toolbar">
        <div className="domains-search">
          <Search size={17} />

          <input
            placeholder="Search domains..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="domains-error">
          {error}
          <button onClick={loadDomains}>Retry</button>
        </div>
      )}

      <div className="domains-table-wrapper">
        <table className="domains-table">
          <thead>
            <tr>
              <th>Domain Name</th>
              <th>Hosting Type</th>
              <th>Account</th>
              <th>Status</th>
              <th>Sync Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="domains-empty">
                  Loading domains...
                </td>
              </tr>
            ) : filteredDomains.length === 0 ? (
              <tr>
                <td colSpan={5} className="domains-empty">
                  <Globe size={30} />

                  <strong>
                    {search
                      ? 'No matching domains'
                      : 'No domains loaded'}
                  </strong>

                  <span>
                    {search
                      ? 'Try another search.'
                      : 'Domains will appear here after synchronization with Plesk.'}
                  </span>
                </td>
              </tr>
            ) : (
              filteredDomains.map((domain) => (
                <tr key={domain.id}>
                  <td>
                    <strong>{domain.domain_name}</strong>
                  </td>

                  <td>{domain.hosting_type || '—'}</td>

                  <td>
                    {domain.account_id
                      ? `Account #${domain.account_id}`
                      : 'Unassigned'}
                  </td>

                  <td>
                    {domain.status || 'Unknown'}
                  </td>

                  <td>
                    <span className={`domains-status ${domain.sync_status}`}>
                      {domain.sync_status}
                    </span>

                    {domain.sync_error && (
                      <span title={domain.sync_error}>
                        {' '}⚠
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="domains-footer">
        <Circle size={8} />

        {domains.length} domain{domains.length !== 1 ? 's' : ''}
        {' '}in the NyotaOne database
      </div>
    </div>
  );
}
