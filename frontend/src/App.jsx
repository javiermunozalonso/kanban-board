import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import BoardListPage from './pages/BoardListPage';
import BoardDetailPage from './pages/BoardDetailPage';
import DashboardPage from './pages/DashboardPage';
import './styles/index.css';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <NavLink to="/" className="navbar-logo">
          ⚡ KanbanFlow
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Boards
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<BoardListPage />} />
        <Route path="/board/:boardId" element={<BoardDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
