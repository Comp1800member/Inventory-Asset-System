import { useState, useEffect } from 'react';
import { api, InventoryMovement, InventoryItem, Warehouse } from '../services/api';

const BADGE_CLASS: Record<string, string> = {
  INBOUND: 'badge badge-inbound',
  OUTBOUND: 'badge badge-outbound',
  ADJUSTMENT: 'badge badge-adjustment',
};

export default function MovementsPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filterItem, setFilterItem] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.items.list(), api.warehouses.list()])
      .then(([i, w]) => {
        setItems(i);
        setWarehouses(w);
      })
      .catch(() => setError('Failed to load reference data.'));
  }, []);

  useEffect(() => {
    const params: { item_id?: number; warehouse_id?: number } = {};
    if (filterItem) params.item_id = parseInt(filterItem, 10);
    if (filterWarehouse) params.warehouse_id = parseInt(filterWarehouse, 10);
    api.movements
      .list(params)
      .then(setMovements)
      .catch(() => setError('Failed to load movements.'));
  }, [filterItem, filterWarehouse]);

  return (
    <>
      <h1>Inventory Movements</h1>
      {error && <p className="msg-error" style={{ marginBottom: '1rem' }}>{error}</p>}

      <div className="filters">
        <label>
          Filter by Item
          <select value={filterItem} onChange={(e) => setFilterItem(e.target.value)}>
            <option value="">All items</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.sku} — {i.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Filter by Warehouse
          <select value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)}>
            <option value="">All warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Item</th>
            <th>Warehouse</th>
            <th>Qty</th>
            <th>Notes</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {movements.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty">No movements found.</td>
            </tr>
          ) : (
            movements.map((m) => (
              <tr key={m.id}>
                <td>
                  <span className={BADGE_CLASS[m.movement_type]}>{m.movement_type}</span>
                </td>
                <td>
                  <code>
                    {items.find((i) => i.id === m.inventory_item_id)?.sku ??
                      `#${m.inventory_item_id}`}
                  </code>
                </td>
                <td>
                  {warehouses.find((w) => w.id === m.warehouse_id)?.name ??
                    `#${m.warehouse_id}`}
                </td>
                <td>{m.quantity}</td>
                <td>{m.notes ?? '—'}</td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
