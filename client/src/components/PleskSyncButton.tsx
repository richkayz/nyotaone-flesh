
import { useState } from 'react';

export default function PleskSyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function syncDomains() {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/plesk/sync-domains', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Synchronization failed');
      }

      setMessage(
        `Successfully synchronized ${result.synced} domains.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Synchronization failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={syncDomains}
        disabled={loading}
      >
        {loading ? 'Synchronizing...' : 'Sync Plesk Domains'}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
