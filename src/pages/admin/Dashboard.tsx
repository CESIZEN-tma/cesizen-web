import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Spinner } from '../../shared/components/Spinner';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);
import { adminApi } from '../../services/admin-service/api/adminApi';
import {
  MdPeople,
  MdPerson,
  MdArticle,
  MdSettings,
  MdQuiz,
  MdArrowForward,
  MdLabel,
  MdMenu,
  MdShield,
  MdCheckCircle,
  MdDashboard,
  MdBarChart,
} from 'react-icons/md';
import '../../services/admin-service/css/dashboard.css';
import Icon from '../../shared/components/Icon';
import PagesGraph from '../../services/admin-service/components/PagesGraph';
import type { AdminLogDto, GetUserDto, ConfigurationDto, InformationPageDto, InformationTagDto } from '../../services/admin-service/api/adminTypes';

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
  allUsers: GetUserDto[];
  allConfigurations: ConfigurationDto[];
  allPages: InformationPageDto[];
  allTagsList: InformationTagDto[];
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

function toLocalDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildDailyTimeline(dates: string[], days: number): { date: string; count: number }[] {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const key = toLocalDateKey(d.toISOString());
    return {
      date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      count: dates.filter((iso) => toLocalDateKey(iso) === key).length,
    };
  });
}


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<14 | 30 | 90>(30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, admins, pages, tags, menus, configs, quizzes, logs] = await Promise.all([
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
          allUsers: userList,
          allConfigurations: configs.data,
          allPages: pages.data,
          allTagsList: tags.data,
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

  const userDates = data.allUsers.map((u) => u.memberSince);
  const configDates = data.allConfigurations.map((c) => c.creationTime);

  const registrationsTimeline = buildDailyTimeline(userDates, range);
  const configurationsTimeline = buildDailyTimeline(configDates, range);

  const totalRegistrationsInRange = registrationsTimeline.reduce((s, d) => s + d.count, 0);
  const totalConfigsInRange = configurationsTimeline.reduce((s, d) => s + d.count, 0);

  const userActivationRate = data.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0;
  const quizActivationRate = data.totalQuizzes > 0 ? Math.round((data.activeQuizzes / data.totalQuizzes) * 100) : 0;
  const pagePublishRate = data.totalPages > 0 ? Math.round((data.publishedPages / data.totalPages) * 100) : 0;

  return (
    <div className="admin-page">
      <div className="dashboard">

        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">Overview of CesiZen</p>
          </div>
          <div className="dashboard-tabs">
            <button
              className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Icon icon={MdDashboard} size={16} />
              Overview
            </button>
            <button
              className={`dashboard-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <Icon icon={MdBarChart} size={16} />
              Analytics
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            <div>
              <p className="dashboard-section-title">Key metrics</p>
              <div className="dashboard-kpis">

                <div className="kpi-card" onClick={() => navigate('/users')}>
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

                <div className="kpi-card" onClick={() => navigate('/quizzes')}>
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

                <div className="kpi-card" onClick={() => navigate('/pages')}>
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

                <div className="kpi-card" onClick={() => navigate('/administrators')}>
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

            <div>
              <p className="dashboard-section-title">Content & configuration</p>
              <div className="dashboard-secondary">

                <div className="secondary-card" onClick={() => navigate('/configurations')}>
                  <div className="secondary-icon" style={{ background: 'rgba(88, 204, 2, 0.12)' }}>
                    <Icon icon={MdSettings} size={20} color="#58cc02" />
                  </div>
                  <div className="secondary-content">
                    <div className="secondary-value">{data.totalConfigurations}</div>
                    <div className="secondary-label">Breathing configurations</div>
                  </div>
                  <Icon icon={MdArrowForward} size={18} color="var(--color-gray-400)" />
                </div>

                <div className="secondary-card" onClick={() => navigate('/tags')}>
                  <div className="secondary-icon" style={{ background: 'rgba(255, 150, 0, 0.12)' }}>
                    <Icon icon={MdLabel} size={20} color="#ff9600" />
                  </div>
                  <div className="secondary-content">
                    <div className="secondary-value">{data.totalTags}</div>
                    <div className="secondary-label">Information tags</div>
                  </div>
                  <Icon icon={MdArrowForward} size={18} color="var(--color-gray-400)" />
                </div>

                <div className="secondary-card" onClick={() => navigate('/menus')}>
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

            <div className="dashboard-bottom">

              <div className="activity-card">
                <div className="activity-card-header">
                  <h3>Recent activity</h3>
                  <Link to="/logs">View all logs →</Link>
                </div>
                <div className="activity-list">
                  {data.recentLogs.length === 0 ? (
                    <div className="activity-empty">No recent activity</div>
                  ) : (
                    data.recentLogs.map((log) => (
                      <div className="activity-item" key={log.id}>
                        <div className="activity-dot" style={{ background: getActionDotColor(log.actionCode) }} />
                        <div className="activity-content">
                          <div className="activity-description">{log.description}</div>
                          <div className="activity-meta">
                            <span className={`activity-code ${getActionClass(log.actionCode)}`}>{log.actionCode}</span>
                            <span className="activity-time">{formatRelativeTime(log.creationTime)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

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
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">

            <div className="analytics-controls">
              <p className="dashboard-section-title" style={{ margin: 0 }}>Growth over time</p>
              <div className="range-selector">
                {([14, 30, 90] as const).map((r) => (
                  <button key={r} className={`range-btn ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>
                    {r}d
                  </button>
                ))}
              </div>
            </div>

            <div className="analytics-summary">
              <div className="analytics-summary-card">
                <div className="analytics-summary-value" style={{ color: '#58cc02' }}>+{totalRegistrationsInRange}</div>
                <div className="analytics-summary-label">New users in {range} days</div>
              </div>
              <div className="analytics-summary-card">
                <div className="analytics-summary-value" style={{ color: '#1cb0f6' }}>+{totalConfigsInRange}</div>
                <div className="analytics-summary-label">Configurations in {range} days</div>
              </div>
              <div className="analytics-summary-card">
                <div className="analytics-summary-value" style={{ color: '#ce82ff' }}>{data.totalUsers}</div>
                <div className="analytics-summary-label">Total users</div>
              </div>
              <div className="analytics-summary-card">
                <div className="analytics-summary-value" style={{ color: '#ff9600' }}>{data.totalConfigurations}</div>
                <div className="analytics-summary-label">Total configurations</div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-card-header">
                <h3>User registrations per day</h3>
                <span className="chart-badge" style={{ background: 'rgba(88,204,2,0.12)', color: '#3d9900' }}>
                  {totalRegistrationsInRange} over {range}d
                </span>
              </div>
              <div className="chart-body" style={{ height: 260 }}>
                <Line
                  data={{
                    labels: registrationsTimeline.map((d) => d.date),
                    datasets: [{ label: 'Registrations', data: registrationsTimeline.map((d) => d.count), borderColor: '#58cc02', backgroundColor: 'rgba(88,204,2,0.1)', fill: true, tension: 0.3 }],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-card-header">
                <h3>Configurations created per day</h3>
                <span className="chart-badge" style={{ background: 'rgba(28,176,246,0.12)', color: '#0077bb' }}>
                  {totalConfigsInRange} over {range}d
                </span>
              </div>
              <div className="chart-body" style={{ height: 260 }}>
                <Line
                  data={{
                    labels: configurationsTimeline.map((d) => d.date),
                    datasets: [{ label: 'Configurations', data: configurationsTimeline.map((d) => d.count), borderColor: '#1cb0f6', backgroundColor: 'rgba(28,176,246,0.1)', fill: true, tension: 0.3 }],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-card-header">
                <h3>Pages &amp; tags graph</h3>
                <span className="chart-badge" style={{ background: 'rgba(206,130,255,0.12)', color: '#8800cc' }}>
                  {data.allPages.length} pages · {data.allTagsList.length} tags
                </span>
              </div>
              <div className="chart-body">
                <PagesGraph pages={data.allPages} tags={data.allTagsList} />
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
