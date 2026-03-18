import React, { Suspense, lazy } from 'react';
import AdminLayout from '../../admin-service/components/AdminLayout';
import AdminGuard from '../../admin-service/components/AdminGuard';
import { Spinner } from '../../../shared/components/Spinner';
import type { RouteConfig } from '../types';

const Dashboard = lazy(() => import('../../../pages/admin/Dashboard'));
const Administrators = lazy(() => import('../../../pages/admin/Administrators'));
const Users = lazy(() => import('../../../pages/admin/Users'));
const InformationPages = lazy(() => import('../../../pages/admin/InformationPages'));
const InformationTags = lazy(() => import('../../../pages/admin/InformationTags'));
const NavigationMenus = lazy(() => import('../../../pages/admin/NavigationMenus'));
const Configurations = lazy(() => import('../../../pages/admin/Configurations'));
const Quizzes = lazy(() => import('../../../pages/admin/Quizzes'));
const AdminLogs = lazy(() => import('../../../pages/admin/AdminLogs'));
const Sessions = lazy(() => import('../../../pages/admin/Sessions'));

const AdminPage: React.FC<{ component: React.ReactNode }> = ({ component }) => (
  <AdminGuard>
    <AdminLayout>
      <Suspense fallback={<Spinner size="large" />}>
        {component}
      </Suspense>
    </AdminLayout>
  </AdminGuard>
);

export const adminRoutes: RouteConfig[] = [
  {
    name: 'admin-dashboard',
    path: '/admin',
    layout: null,
    component: <AdminPage component={<Dashboard />} />,
  },
  {
    name: 'admin-administrators',
    path: '/admin/administrators',
    layout: null,
    component: <AdminPage component={<Administrators />} />,
  },
  {
    name: 'admin-users',
    path: '/admin/users',
    layout: null,
    component: <AdminPage component={<Users />} />,
  },
  {
    name: 'admin-pages',
    path: '/admin/pages',
    layout: null,
    component: <AdminPage component={<InformationPages />} />,
  },
  {
    name: 'admin-tags',
    path: '/admin/tags',
    layout: null,
    component: <AdminPage component={<InformationTags />} />,
  },
  {
    name: 'admin-menus',
    path: '/admin/menus',
    layout: null,
    component: <AdminPage component={<NavigationMenus />} />,
  },
  {
    name: 'admin-configurations',
    path: '/admin/configurations',
    layout: null,
    component: <AdminPage component={<Configurations />} />,
  },
  {
    name: 'admin-quizzes',
    path: '/admin/quizzes',
    layout: null,
    component: <AdminPage component={<Quizzes />} />,
  },
  {
    name: 'admin-logs',
    path: '/admin/logs',
    layout: null,
    component: <AdminPage component={<AdminLogs />} />,
  },
  {
    name: 'admin-sessions',
    path: '/admin/sessions',
    layout: null,
    component: <AdminPage component={<Sessions />} />,
  },
];
