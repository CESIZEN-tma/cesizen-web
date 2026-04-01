import Login from "../../../pages/Login";
import NotFound from "../../../pages/NotFound";
import type { RouteConfig } from "../types";

export const publicRoutes: RouteConfig[] = [
  {
    name: "login",
    path: "/login",
    layout: null,
    component: <Login />,
  },
  { name: "error", path: "*", layout: null, component: <NotFound /> },
];
