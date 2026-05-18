import { useState, useEffect } from 'react';
import { api, InventoryItem } from '../services/api';

export default function ItemsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.items.list().then(setItems).catch(() => setError('Failed to load items.'));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const item = await api.items.create({
        sku,
        name,
        description: description || undefined,
      });
      setItems((prev) => [item, ...prev]);
      setSku('');
      setName('');
      setDescription('');
      setSuccess('Item created successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create item.');
    }
  }

  return (
    <>
      <h1>Inventory Items</h1>
      <div className="card">
        <h2>Add Item</h2>
        <form onSubmit={handleSubmit}>
          <label>
            SKU
            <input value={sku} onChange={(e) => setSku(e.target.value)} required />
          </label>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          {error && <p className="msg-error">{error}</p>}
          {success && <p className="msg-success">{success}</p>}
          <button type="submit">Create</button>
        </form>
      </div>

      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Description</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="empty">No items yet.</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td><code>{item.sku}</code></td>
                <td>{item.name}</td>
                <td>{item.description ?? '—'}</td>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
