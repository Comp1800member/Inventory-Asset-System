import { useState, useEffect } from 'react';
import { api, CurrentInventory, Analytics, Warehouse } from '../services/api';

export default function DashboardPage() {
  const [inventory, setInventory] = useState<CurrentInventory[]>([]);
  const [lowStock, setLowStock] = useState<CurrentInventory[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [warehouses, setWarehouses] = useState<Record<number, string>>({});
  const [threshold, setThreshold] = useState(10);
  const [pendingThreshold, setPendingThreshold] = useState(10);
  const [error, setError] = useState('');

  useEffect(() => {
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
      .catch(() => setError('Failed to load dashboard data.'));
  }, [threshold]);

  function applyThreshold() {
    setThreshold(pendingThreshold);
  }

  return (
    <>
      <h1>Inventory Dashboard</h1>
      {error && <p className="msg-error">{error}</p>}

      <h2>Current Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Item</th>
            <th>Warehouse</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {inventory.length === 0 ? (
            <tr><td colSpan={4} className="empty">No inventory data.</td></tr>
          ) : (
            inventory.map((row) => (
              <tr key={`${row.item_id}-${row.warehouse_id}`}>
                <td><code>{row.sku}</code></td>
                <td>{row.name}</td>
                <td>{warehouses[row.warehouse_id] ?? row.warehouse_id}</td>
                <td style={{ fontWeight: row.quantity <= 0 ? 'bold' : undefined, color: row.quantity <= 0 ? '#c0392b' : undefined }}>
                  {row.quantity}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2>Low Stock Alert</h2>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <label>
          Threshold
          <input
            type="number"
            min={0}
            value={pendingThreshold}
            onChange={(e) => setPendingThreshold(Number(e.target.value))}
            style={{ width: '5rem', marginLeft: '0.5rem' }}
          />
        </label>
        <button type="button" onClick={applyThreshold}>Apply</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Item</th>
            <th>Warehouse</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {lowStock.length === 0 ? (
            <tr><td colSpan={4} className="empty">No items below threshold.</td></tr>
          ) : (
            lowStock.map((row) => (
              <tr key={`${row.item_id}-${row.warehouse_id}`}>
                <td><code>{row.sku}</code></td>
                <td>{row.name}</td>
                <td>{warehouses[row.warehouse_id] ?? row.warehouse_id}</td>
                <td style={{ fontWeight: 'bold', color: '#c0392b' }}>{row.quantity}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {analytics && (
        <>
          <h2>Analytics</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card">
              <h3>Total Inbound</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{analytics.volume.total_inbound}</p>
            </div>
            <div className="card">
              <h3>Total Outbound</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{analytics.volume.total_outbound}</p>
            </div>
            <div className="card">
              <h3>Total Adjustment</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{analytics.volume.total_adjustment}</p>
            </div>
          </div>

          <h3>Top 5 Most Moved Items</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Item</th>
                <th>Movements</th>
                <th>Total Qty</th>
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

          <h3>Top Warehouses by Movement Volume</h3>
          <table>
            <thead>
              <tr>
                <th>Warehouse</th>
                <th>Movements</th>
                <th>Total Qty</th>
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
        </>
      )}
    </>
  );
}
