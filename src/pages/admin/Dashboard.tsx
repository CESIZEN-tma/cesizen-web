import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Spinner } from '../../shared/components/Spinner';
import { adminApi } from '../../services/admin-service/api/adminApi';
import {
  MdPeople,
  MdPerson,
  MdArticle,
  MdSettings,
  MdQuiz,
  MdArrowForward,
  MdDevices,
  MdLabel,
  MdMenu,
  MdShield,
  MdCheckCircle,
} from 'react-icons/md';
import '../../services/admin-service/css/dashboard.css';
import Icon from '../../shared/components/Icon';
import type { AdminLogDto, GetUserDto } from '../../services/admin-service/api/adminTypes';

interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalAdmins: number;
  totalPages: number;
  publishedPages: number;
  totalTags: number;
  totalMenus: number;
  totalConfigurations: number;
  totalQuizzes: number;
  activeQuizzes: number;
  recentLogs: AdminLogDto[];
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: '#58cc02',
  UPDATE: '#1cb0f6',
  DELETE: '#ff4b4b',
  LOGIN: '#ce82ff',
};

function getActionClass(code: string): string {
  const key = Object.keys(ACTION_COLORS).find((k) => code.toUpperCase().includes(k));
  return key ? `action-${key}` : 'action-UPDATE';
}

function getActionDotColor(code: string): string {
  const key = Object.keys(ACTION_COLORS).find((k) => code.toUpperCase().includes(k));
  return key ? ACTION_COLORS[key] : '#1cb0f6';
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, admins, pages, tags, menus, configs, quizzes, logs] =
          await Promise.all([
            adminApi.users.getAll(),
            adminApi.administrators.getAll(),
            adminApi.pages.getAll(),
            adminApi.tags.getAll(),
            adminApi.menus.getAll(),
            adminApi.configurations.getAll(),
            adminApi.quizzes.getAll(),
            adminApi.logs.getAll(),
          ]);

        const userList: GetUserDto[] = users.data;
        const logList: AdminLogDto[] = logs.data;

        setData({
          totalUsers: userList.length,
          activeUsers: userList.filter((u) => u.active && u.accountActivated).length,
          lockedUsers: userList.filter((u) => u.lockedUntil && new Date(u.lockedUntil) > new Date()).length,
          totalAdmins: admins.data.length,
          totalPages: pages.data.length,
          publishedPages: pages.data.filter((p: any) => p.status === 'Published').length,
          totalTags: tags.data.length,
          totalMenus: menus.data.length,
          totalConfigurations: configs.data.length,
          totalQuizzes: quizzes.data.length,
          activeQuizzes: quizzes.data.filter((q: any) => q.active).length,
          recentLogs: logList
            .sort((a, b) => new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime())
            .slice(0, 8),
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (!data) return null;

  const userActivationRate = data.totalUsers > 0
    ? Math.round((data.activeUsers / data.totalUsers) * 100)
    : 0;

  const quizActivationRate = data.totalQuizzes > 0
    ? Math.round((data.activeQuizzes / data.totalQuizzes) * 100)
    : 0;

  const pagePublishRate = data.totalPages > 0
    ? Math.round((data.publishedPages / data.totalPages) * 100)
    : 0;

  return (
    <div className="admin-page">
      <div className="dashboard">

        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Overview of your CesiZen platform</p>
        </div>

        {/* Primary KPIs */}
        <div>
          <p className="dashboard-section-title">Key metrics</p>
          <div className="dashboard-kpis">

            <div className="kpi-card" onClick={() => navigate('/admin/users')}>
              <div className="kpi-card-top">
                <div className="kpi-icon" style={{ background: 'rgba(88, 204, 2, 0.12)' }}>
                  <Icon icon={MdPeople} size={22} color="#58cc02" />
                </div>
                <span className={`kpi-badge ${data.lockedUsers === 0 ? 'active' : 'inactive'}`}>
                  {data.lockedUsers === 0 ? 'All clear' : `${data.lockedUsers} locked`}
                </span>
              </div>
              <div className="kpi-value">{data.totalUsers}</div>
              <div className="kpi-label">Total users</div>
              <div className="health-bar-container">
                <div className="health-bar" style={{ width: `${userActivationRate}%`, background: '#58cc02' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                {data.activeUsers} active · {userActivationRate}% activation rate
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/admin/quizzes')}>
              <div className="kpi-card-top">
                <div className="kpi-icon" style={{ background: 'rgba(206, 130, 255, 0.12)' }}>
                  <Icon icon={MdQuiz} size={22} color="#ce82ff" />
                </div>
                <span className={`kpi-badge ${data.activeQuizzes > 0 ? 'active' : 'inactive'}`}>
                  {data.activeQuizzes} active
                </span>
              </div>
              <div className="kpi-value">{data.totalQuizzes}</div>
              <div className="kpi-label">Quizzes</div>
              <div className="health-bar-container">
                <div className="health-bar" style={{ width: `${quizActivationRate}%`, background: '#ce82ff' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                {quizActivationRate}% published
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/admin/pages')}>
              <div className="kpi-card-top">
                <div className="kpi-icon" style={{ background: 'rgba(255, 150, 0, 0.12)' }}>
                  <Icon icon={MdArticle} size={22} color="#ff9600" />
                </div>
                <span className={`kpi-badge ${data.publishedPages > 0 ? 'active' : 'inactive'}`}>
                  {data.publishedPages} published
                </span>
              </div>
              <div className="kpi-value">{data.totalPages}</div>
              <div className="kpi-label">Information pages</div>
              <div className="health-bar-container">
                <div className="health-bar" style={{ width: `${pagePublishRate}%`, background: '#ff9600' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                {pagePublishRate}% published
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/admin/administrators')}>
              <div className="kpi-card-top">
                <div className="kpi-icon" style={{ background: 'rgba(28, 176, 246, 0.12)' }}>
                  <Icon icon={MdPerson} size={22} color="#1cb0f6" />
                </div>
                <span className="kpi-badge active">Team</span>
              </div>
              <div className="kpi-value">{data.totalAdmins}</div>
              <div className="kpi-label">Administrators</div>
              <div className="health-bar-container">
                <div className="health-bar" style={{ width: '100%', background: '#1cb0f6' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                {data.totalAdmins} account{data.totalAdmins !== 1 ? 's' : ''} with access
              </div>
            </div>

          </div>
        </div>

        {/* Secondary stats */}
        <div>
          <p className="dashboard-section-title">Content & configuration</p>
          <div className="dashboard-secondary">

            <div className="secondary-card" onClick={() => navigate('/admin/configurations')}>
              <div className="secondary-icon" style={{ background: 'rgba(88, 204, 2, 0.12)' }}>
                <Icon icon={MdSettings} size={20} color="#58cc02" />
              </div>
              <div className="secondary-content">
                <div className="secondary-value">{data.totalConfigurations}</div>
                <div className="secondary-label">Breathing configurations</div>
              </div>
              <Icon icon={MdArrowForward} size={18} color="var(--color-gray-400)" />
            </div>

            <div className="secondary-card" onClick={() => navigate('/admin/tags')}>
              <div className="secondary-icon" style={{ background: 'rgba(255, 150, 0, 0.12)' }}>
                <Icon icon={MdLabel} size={20} color="#ff9600" />
              </div>
              <div className="secondary-content">
                <div className="secondary-value">{data.totalTags}</div>
                <div className="secondary-label">Information tags</div>
              </div>
              <Icon icon={MdArrowForward} size={18} color="var(--color-gray-400)" />
            </div>

            <div className="secondary-card" onClick={() => navigate('/admin/menus')}>
              <div className="secondary-icon" style={{ background: 'rgba(28, 176, 246, 0.12)' }}>
                <Icon icon={MdMenu} size={20} color="#1cb0f6" />
              </div>
              <div className="secondary-content">
                <div className="secondary-value">{data.totalMenus}</div>
                <div className="secondary-label">Navigation menus</div>
              </div>
              <Icon icon={MdArrowForward} size={18} color="var(--color-gray-400)" />
            </div>

          </div>
        </div>

        {/* Activity + Health */}
        <div className="dashboard-bottom">

          {/* Recent activity */}
          <div className="activity-card">
            <div className="activity-card-header">
              <h3>Recent activity</h3>
              <Link to="/admin/logs">View all logs →</Link>
            </div>
            <div className="activity-list">
              {data.recentLogs.length === 0 ? (
                <div className="activity-empty">No recent activity</div>
              ) : (
                data.recentLogs.map((log) => (
                  <div className="activity-item" key={log.id}>
                    <div
                      className="activity-dot"
                      style={{ background: getActionDotColor(log.actionCode) }}
                    />
                    <div className="activity-content">
                      <div className="activity-description">{log.description}</div>
                      <div className="activity-meta">
                        <span className={`activity-code ${getActionClass(log.actionCode)}`}>
                          {log.actionCode}
                        </span>
                        <span className="activity-time">{formatRelativeTime(log.creationTime)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System health */}
          <div className="health-card">
            <div className="health-card-header">
              <h3>Platform health</h3>
            </div>
            <div className="health-list">

              <div className="health-item">
                <div className="health-item-left">
                  <div className="status-dot" style={{ background: '#58cc02' }} />
                  <span className="health-item-label">API</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon icon={MdCheckCircle} size={16} color="#58cc02" />
                  <span className="health-item-value" style={{ color: '#58cc02' }}>Operational</span>
                </div>
              </div>

              <div className="health-item">
                <div className="health-item-left">
                  <div className="status-dot" style={{ background: '#1cb0f6' }} />
                  <span className="health-item-label">Administrators</span>
                </div>
                <span className="health-item-value">{data.totalAdmins}</span>
              </div>

              <div className="health-item">
                <div className="health-item-left">
                  <div className="status-dot" style={{ background: data.lockedUsers > 0 ? '#ff9600' : '#58cc02' }} />
                  <span className="health-item-label">Locked accounts</span>
                </div>
                <span className="health-item-value" style={{ color: data.lockedUsers > 0 ? '#ff9600' : undefined }}>
                  {data.lockedUsers}
                </span>
              </div>

              <div className="health-item">
                <div className="health-item-left">
                  <div className="status-dot" style={{ background: '#ff9600' }} />
                  <span className="health-item-label">Inactive users</span>
                </div>
                <span className="health-item-value">{data.totalUsers - data.activeUsers}</span>
              </div>

              <div className="health-item">
                <div className="health-item-left">
                  <Icon icon={MdShield} size={16} color="var(--color-gray-400)" />
                  <span className="health-item-label">Admin logs total</span>
                </div>
                <span className="health-item-value">{data.recentLogs.length > 0 ? '✓' : '—'}</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
