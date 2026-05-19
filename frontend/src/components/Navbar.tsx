import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <span className="brand">Inventory System</span>
      <NavLink to="/items">Items</NavLink>
      <NavLink to="/warehouses">Warehouses</NavLink>
      <NavLink to="/movements">Movements</NavLink>
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/movements/new" className="record-btn">+ Record</NavLink>
    </nav>
  );
}
