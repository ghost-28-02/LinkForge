import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import CreateLinkForm from '../components/CreateLinkForm.jsx';
import LinkCard from '../components/LinkCard.jsx';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listLinks()
      .then(setLinks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(link) {
    setLinks((prev) => [link, ...prev]);
  }

  function handleDeleted(id) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="space-y-6">
      <CreateLinkForm onCreated={handleCreated} />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your links</h2>
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-slate-500">Loading links…</p>
        ) : links.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No links yet. Create your first short link above.
          </p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} onDeleted={handleDeleted} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
