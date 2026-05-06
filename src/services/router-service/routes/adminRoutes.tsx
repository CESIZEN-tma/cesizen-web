import React, { Suspense, lazy } from "react";
import AdminLayout from "../../admin-service/components/AdminLayout";
import { Spinner } from "../../../shared/components/Spinner";
import type { RouteConfig } from "../types";
import AdminGuard from "../../admin-service/components/AdminGuard";

const Dashboard = lazy(() => import("../../../pages/admin/Dashboard"));
const Administrators = lazy(
  () => import("../../../pages/admin/Administrators"),
);
const Users = lazy(() => import("../../../pages/admin/Users"));
const InformationPages = lazy(
  () => import("../../../pages/admin/InformationPages"),
);
const InformationTags = lazy(
  () => import("../../../pages/admin/InformationTags"),
);
const NavigationMenus = lazy(
  () => import("../../../pages/admin/NavigationMenus"),
);
const Configurations = lazy(
  () => import("../../../pages/admin/Configurations"),
);
const Quizzes = lazy(() => import("../../../pages/admin/Quizzes"));
const AdminLogs = lazy(() => import("../../../pages/admin/AdminLogs"));
const Sessions = lazy(() => import("../../../pages/admin/Sessions"));

// eslint-disable-next-line react-refresh/only-export-components
const AdminPage: React.FC<{ component: React.ReactNode }> = ({ component }) => (
  <AdminGuard>
    <AdminLayout>
      <Suspense fallback={<Spinner size="large" />}>{component}</Suspense>
    </AdminLayout>
  </AdminGuard>
);

export const adminRoutes: RouteConfig[] = [
  {
    name: "admin-dashboard",
    path: "/",
    layout: null,
    component: <AdminPage component={<Dashboard />} />,
  },
  {
    name: "admin-administrators",
    path: "/administrators",
    layout: null,
    component: <AdminPage component={<Administrators />} />,
  },
  {
    name: "admin-users",
    path: "/users",
    layout: null,
    component: <AdminPage component={<Users />} />,
  },
  {
    name: "admin-pages",
    path: "/pages",
    layout: null,
    component: <AdminPage component={<InformationPages />} />,
  },
  {
    name: "admin-tags",
    path: "/tags",
    layout: null,
    component: <AdminPage component={<InformationTags />} />,
  },
  {
    name: "admin-menus",
    path: "/menus",
    layout: null,
    component: <AdminPage component={<NavigationMenus />} />,
  },
  {
    name: "admin-configurations",
    path: "/configurations",
    layout: null,
    component: <AdminPage component={<Configurations />} />,
  },
  {
    name: "admin-quizzes",
    path: "/quizzes",
    layout: null,
    component: <AdminPage component={<Quizzes />} />,
  },
  {
    name: "admin-logs",
    path: "/logs",
    layout: null,
    component: <AdminPage component={<AdminLogs />} />,
  },
  {
    name: "admin-sessions",
    path: "/sessions",
    layout: null,
    component: <AdminPage component={<Sessions />} />,
  },
];
