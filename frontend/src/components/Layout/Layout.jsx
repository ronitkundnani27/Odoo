import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Settings, 
  Users, 
  Wrench, 
  Calendar, 
  BarChart3, 
  Menu, 
  X,
  Home
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Equipment', href: '/equipment', icon: Settings },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Requests', href: '/requests', icon: Wrench },
    { name: 'Kanban Board', href: '/kanban', icon: BarChart3 },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="layout">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">GearGuard</h2>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link ${isActive(item.href) ? 'nav-link-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <button 
            className="menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          
          <div className="topbar-title">
            {navigation.find(nav => nav.href === location.pathname)?.name || 'GearGuard'}
          </div>

          <div className="topbar-actions">
            <span className="user-info">Admin User</span>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;