import Home from "../../../pages/Home";
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
  { name: "error", path: "*", layout: null, component: <NotFound /> },
];
