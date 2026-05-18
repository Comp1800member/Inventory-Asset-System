import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, InventoryItem, Warehouse, Vendor, User, MovementType } from '../services/api';

export default function CreateMovementPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [itemId, setItemId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [userId, setUserId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('INBOUND');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.items.list(),
      api.warehouses.list(),
      api.vendors.list(),
      api.users.list(),
    ])
      .then(([i, w, v, u]) => {
        setItems(i);
        setWarehouses(w);
        setVendors(v);
        setUsers(u);
      })
      .catch(() => setError('Failed to load reference data.'));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.movements.create({
        inventory_item_id: parseInt(itemId, 10),
        warehouse_id: parseInt(warehouseId, 10),
        user_id: parseInt(userId, 10),
        vendor_id: vendorId ? parseInt(vendorId, 10) : undefined,
        movement_type: movementType,
        quantity: parseInt(quantity, 10),
        notes: notes || undefined,
      });
      navigate('/movements');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record movement.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1>Record Movement</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <label>
            Item
            <select value={itemId} onChange={(e) => setItemId(e.target.value)} required>
              <option value="">Select item…</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.sku} — {i.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Warehouse
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required>
              <option value="">Select warehouse…</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Recorded by
            <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
              <option value="">Select user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Vendor (optional)
            <select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              <option value="">None</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Movement Type
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as MovementType)}
              required
            >
              <option value="INBOUND">INBOUND</option>
              <option value="OUTBOUND">OUTBOUND</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
            </select>
          </label>

          <label>
            Quantity
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </label>

          <label>
            Notes
            <input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>

          {error && <p className="msg-error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Record Movement'}
          </button>
        </form>
      </div>
    </>
  );
}
