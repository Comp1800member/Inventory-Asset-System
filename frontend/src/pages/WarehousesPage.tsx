import { useState, useEffect } from 'react';
import { api, Warehouse } from '../services/api';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.warehouses.list().then(setWarehouses).catch(() => setError('Failed to load warehouses.'));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const wh = await api.warehouses.create({ name, location });
      setWarehouses((prev) => [wh, ...prev]);
      setName('');
      setLocation('');
      setSuccess('Warehouse created successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create warehouse.');
    }
  }

  return (
    <>
      <h1>Warehouses</h1>
      <div className="card">
        <h2>Add Warehouse</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Location
            <input value={location} onChange={(e) => setLocation(e.target.value)} required />
          </label>
          {error && <p className="msg-error">{error}</p>}
          {success && <p className="msg-success">{success}</p>}
          <button type="submit">Create</button>
        </form>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.length === 0 ? (
            <tr>
              <td colSpan={3} className="empty">No warehouses yet.</td>
            </tr>
          ) : (
            warehouses.map((wh) => (
              <tr key={wh.id}>
                <td>{wh.name}</td>
                <td>{wh.location}</td>
                <td>{new Date(wh.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
