import Login from "../../../pages/Login";
import NotFound from "../../../pages/NotFound";
import ConfirmAccount from "../../../pages/ConfirmAccount";
import type { RouteConfig } from "../types";

export const publicRoutes: RouteConfig[] = [
  {
    name: "login",
    path: "/login",
    layout: null,
    component: <Login />,
  },
  {
    name: "confirm-account",
    path: "/confirm-account",
    layout: null,
    component: <ConfirmAccount />,
  },
  { name: "error", path: "*", layout: null, component: <NotFound /> },
];
