import { useState, useEffect } from 'react';
import { api, CurrentInventory, Analytics, Warehouse } from '../services/api';

export default function DashboardPage() {
  const [inventory, setInventory] = useState<CurrentInventory[]>([]);
  const [lowStock, setLowStock] = useState<CurrentInventory[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [warehouses, setWarehouses] = useState<Record<number, string>>({});
  const [threshold, setThreshold] = useState(10);
  const [pendingThreshold, setPendingThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api.inventory.current(),
      api.inventory.lowStock(threshold),
      api.inventory.analytics(),
      api.warehouses.list(),
    ])
      .then(([inv, low, anal, whs]) => {
        setInventory(inv);
        setLowStock(low);
        setAnalytics(anal);
        const whMap: Record<number, string> = {};
        (whs as Warehouse[]).forEach((w) => { whMap[w.id] = w.name; });
        setWarehouses(whMap);
      })
      .catch(() => setError('Failed to load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [threshold]);

  if (loading) return <p style={{ padding: '2rem' }}>Loading dashboard...</p>;

  return (
    <>
      <h1>Inventory Dashboard</h1>
      {error && <p className="msg-error">{error}</p>}

      {/* ── Current Inventory ── */}
      <section>
        <h2>Current Inventory <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>({inventory.length} records)</span></h2>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item Name</th>
              <th>Warehouse</th>
              <th>Current Qty</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr><td colSpan={4} className="empty">No inventory records found.</td></tr>
            ) : (
              inventory.map((row) => (
                <tr key={`${row.item_id}-${row.warehouse_id}`}>
                  <td><code>{row.sku}</code></td>
                  <td>{row.name}</td>
                  <td>{warehouses[row.warehouse_id] ?? `Warehouse ${row.warehouse_id}`}</td>
                  <td style={{ fontWeight: 'bold', color: row.current_quantity <= 0 ? '#c0392b' : 'inherit' }}>
                    {row.current_quantity}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* ── Low Stock Alerts ── */}
      <section style={{ marginTop: '2rem' }}>
        <h2>
          Low Stock Alerts
          {lowStock.length > 0 && (
            <span style={{ marginLeft: '0.5rem', background: '#c0392b', color: '#fff', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.85rem' }}>
              {lowStock.length}
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Alert threshold:
            <input
              type="number"
              min={0}
              value={pendingThreshold}
              onChange={(e) => setPendingThreshold(Number(e.target.value))}
              style={{ width: '5rem' }}
            />
          </label>
          <button type="button" onClick={() => setThreshold(pendingThreshold)}>Apply</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item Name</th>
              <th>Warehouse</th>
              <th>Current Qty</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.length === 0 ? (
              <tr><td colSpan={4} className="empty">No items at or below threshold of {threshold}.</td></tr>
            ) : (
              lowStock.map((row) => (
                <tr key={`${row.item_id}-${row.warehouse_id}`}>
                  <td><code>{row.sku}</code></td>
                  <td>{row.name}</td>
                  <td>{warehouses[row.warehouse_id] ?? `Warehouse ${row.warehouse_id}`}</td>
                  <td style={{ fontWeight: 'bold', color: '#c0392b' }}>{row.current_quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* ── Analytics ── */}
      {analytics && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Analytics</h2>

          {/* Volume summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card">
              <h3 style={{ margin: '0 0 0.5rem' }}>Total Movements</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{analytics.volume.total_movements}</p>
            </div>
            <div className="card">
              <h3 style={{ margin: '0 0 0.5rem' }}>Inbound</h3>
              <p style={{ fontSize: '2rem', margin: 0, color: '#27ae60' }}>{analytics.volume.total_inbound}</p>
            </div>
            <div className="card">
              <h3 style={{ margin: '0 0 0.5rem' }}>Outbound</h3>
              <p style={{ fontSize: '2rem', margin: 0, color: '#c0392b' }}>{analytics.volume.total_outbound}</p>
            </div>
            <div className="card">
              <h3 style={{ margin: '0 0 0.5rem' }}>Adjustments</h3>
              <p style={{ fontSize: '2rem', margin: 0, color: '#e67e22' }}>{analytics.volume.total_adjustment}</p>
            </div>
          </div>

          {/* Activity over last 7 days */}
          <h3>Activity — Last 7 Days</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Movements</th>
              </tr>
            </thead>
            <tbody>
              {analytics.daily_activity.length === 0 ? (
                <tr><td colSpan={2} className="empty">No activity in the last 7 days.</td></tr>
              ) : (
                analytics.daily_activity.map((d) => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td>{d.movement_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Top moved items */}
          <h3 style={{ marginTop: '2rem' }}>Top 5 Most Moved Items</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Item Name</th>
                <th>Total Movements</th>
                <th>Total Units Moved</th>
              </tr>
            </thead>
            <tbody>
              {analytics.top_moved_items.length === 0 ? (
                <tr><td colSpan={4} className="empty">No data.</td></tr>
              ) : (
                analytics.top_moved_items.map((item) => (
                  <tr key={item.item_id}>
                    <td><code>{item.sku}</code></td>
                    <td>{item.name}</td>
                    <td>{item.movement_count}</td>
                    <td>{item.total_quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Top warehouses */}
          <h3 style={{ marginTop: '2rem' }}>Top Warehouses by Activity</h3>
          <table>
            <thead>
              <tr>
                <th>Warehouse</th>
                <th>Total Movements</th>
                <th>Total Units Moved</th>
              </tr>
            </thead>
            <tbody>
              {analytics.top_warehouses.length === 0 ? (
                <tr><td colSpan={3} className="empty">No data.</td></tr>
              ) : (
                analytics.top_warehouses.map((wh) => (
                  <tr key={wh.warehouse_id}>
                    <td>{wh.warehouse_name}</td>
                    <td>{wh.movement_count}</td>
                    <td>{wh.total_quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
