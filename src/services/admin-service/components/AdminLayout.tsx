import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../../shared/hooks/useAuth';
import {
  MdDashboard,
  MdPeople,
  MdPerson,
  MdArticle,
  MdLabel,
  MdMenu as MdMenuIcon,
  MdSettings,
  MdQuiz,
  MdHistory,
  MdDevices,
  MdLogout,
  MdClose,
  MdLightMode,
  MdDarkMode,
} from 'react-icons/md';
import '../css/admin-layout.css';
import Icon from '../../../shared/components/Icon';
import { useCurrentTheme, toggleTheme } from '../../../shared/hooks/useTheme';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface JwtPayload {
  email: string;
  nameid: string;
}

interface MenuItem {
  path: string;
  label: string;
  icon: any;
}

const menuItems: MenuItem[] = [
  { path: '/', label: 'Dashboard', icon: MdDashboard },
  { path: '/administrators', label: 'Administrators', icon: MdPerson },
  { path: '/users', label: 'Users', icon: MdPeople },
  { path: '/pages', label: 'Information Pages', icon: MdArticle },
  { path: '/tags', label: 'Information Tags', icon: MdLabel },
  { path: '/menus', label: 'Navigation Menus', icon: MdMenuIcon },
  { path: '/configurations', label: 'Configurations', icon: MdSettings },
  { path: '/quizzes', label: 'Quizzes', icon: MdQuiz },
  { path: '/logs', label: 'Admin Logs', icon: MdHistory },
  { path: '/sessions', label: 'Sessions', icon: MdDevices },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentTheme = useCurrentTheme();

  const getAdminEmail = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        return decoded.email;
      }
    } catch {
      return 'Admin';
    }
    return 'Admin';
  };

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">CesiZen Admin</h2>
          <button
            className="admin-sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Icon icon={sidebarOpen ? MdClose : MdMenuIcon} size={24} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon icon={item.icon} size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-mobile-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <Icon icon={MdMenuIcon} size={24} />
            </button>
            <button
              className="admin-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <Icon icon={currentTheme === 'dark' ? MdLightMode : MdDarkMode} size={22} />
            </button>
          </div>

          <div className="admin-header-right">
            <span className="admin-user-email">{getAdminEmail()}</span>
            <button className="admin-logout-btn" onClick={handleLogout}>
              <Icon icon={MdLogout} size={20} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
