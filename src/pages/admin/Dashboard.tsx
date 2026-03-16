import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../shared/components/Card';
import { Spinner } from '../../shared/components/Spinner';
import { Icon } from '../../shared/components/Icon';
import { adminApi } from '../../services/admin-service/api/adminApi';
import {
  MdPeople,
  MdPerson,
  MdArticle,
  MdLabel,
  MdMenu,
  MdSettings,
  MdQuiz,
  MdArrowForward,
} from 'react-icons/md';
import '../../services/admin-service/css/dashboard.css';

interface Stats {
  users: number;
  administrators: number;
  pages: number;
  tags: number;
  menus: number;
  configurations: number;
  quizzes: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, admins, pages, tags, menus, configs, quizzes] = await Promise.all([
          adminApi.users.getAll(),
          adminApi.administrators.getAll(),
          adminApi.pages.getAll(),
          adminApi.tags.getAll(),
          adminApi.menus.getAll(),
          adminApi.configurations.getAll(),
          adminApi.quizzes.getAll(),
        ]);

        setStats({
          users: users.data.length,
          administrators: admins.data.length,
          pages: pages.data.length,
          tags: tags.data.length,
          menus: menus.data.length,
          configurations: configs.data.length,
          quizzes: quizzes.data.length,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = stats
    ? [
        { label: 'Users', value: stats.users, icon: MdPeople, color: '#58cc02', path: '/admin/users' },
        { label: 'Administrators', value: stats.administrators, icon: MdPerson, color: '#1cb0f6', path: '/admin/administrators' },
        { label: 'Pages', value: stats.pages, icon: MdArticle, color: '#ce82ff', path: '/admin/pages' },
        { label: 'Tags', value: stats.tags, icon: MdLabel, color: '#ff9600', path: '/admin/tags' },
        { label: 'Menus', value: stats.menus, icon: MdMenu, color: '#1cb0f6', path: '/admin/menus' },
        { label: 'Configurations', value: stats.configurations, icon: MdSettings, color: '#58cc02', path: '/admin/configurations' },
        { label: 'Quizzes', value: stats.quizzes, icon: MdQuiz, color: '#ce82ff', path: '/admin/quizzes' },
      ]
    : [];

  const quickLinks = [
    { label: 'Manage Users', path: '/admin/users', icon: MdPeople },
    { label: 'Create Page', path: '/admin/pages', icon: MdArticle },
    { label: 'Configure Menus', path: '/admin/menus', icon: MdMenu },
    { label: 'View Logs', path: '/admin/logs', icon: MdArrowForward },
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        {statCards.map((stat) => (
          <Card key={stat.label} hoverable onClick={() => navigate(stat.path)}>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                <Icon icon={stat.icon} size={32} color="white" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2 style={{ marginTop: '40px', marginBottom: '20px', fontSize: '1.5rem' }}>Quick Links</h2>
      <div className="dashboard-links">
        {quickLinks.map((link) => (
          <Card key={link.path} hoverable onClick={() => navigate(link.path)}>
            <div className="quick-link">
              <Icon icon={link.icon} size={24} color="var(--color-primary)" />
              <span>{link.label}</span>
              <Icon icon={MdArrowForward} size={20} color="var(--color-gray-500)" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
