import Home from "../../../pages/Home";
import Login from "../../../pages/Login";
import NotFound from "../../../pages/NotFound";
import type { RouteConfig } from "../types";

export const publicRoutes: RouteConfig[] = [
  {
    name: "home",
    path: "/",
    layout: "default",
    header: true,
    footer: true,
    component: <Home />,
  },
  {
    name: "login",
    path: "/login",
    layout: null,
    component: <Login />,
  },
  { name: "error", path: "*", layout: null, component: <NotFound /> },
];
