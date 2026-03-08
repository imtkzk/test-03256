import React from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewApplication from './pages/NewApplication';
import ApplicationDetail from './pages/ApplicationDetail';
import SearchTrademarks from './pages/SearchTrademarks';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <div className="logo-icon">TM</div>
            <div>
              <div className="logo-text">トレマル</div>
              <div className="logo-sub">商標登録かんたんナビ</div>
            </div>
          </Link>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              ホーム
            </NavLink>
            <NavLink to="/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              新規出願
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              商標検索
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewApplication />} />
          <Route path="/application/:id" element={<ApplicationDetail />} />
          <Route path="/search" element={<SearchTrademarks />} />
        </Routes>
      </main>

      <footer className="footer">
        トレマル - 商標登録かんたんナビ &copy; 2026
      </footer>
    </div>
  );
}
