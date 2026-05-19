import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ItemsPage from './pages/ItemsPage';
import WarehousesPage from './pages/WarehousesPage';
import MovementsPage from './pages/MovementsPage';
import CreateMovementPage from './pages/CreateMovementPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/items" replace />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/warehouses" element={<WarehousesPage />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route path="/movements/new" element={<CreateMovementPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
