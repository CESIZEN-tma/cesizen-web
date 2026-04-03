import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import type { RouteConfig } from "./types";
import { publicRoutes } from "./routes/publicRoutes";
import { adminRoutes } from "./routes/adminRoutes";

const renderRoute = (route: RouteConfig) => {
  const { layout, component, path, header, footer } = route;
  const routeElement =
    layout === "default" ? (
      <Layout
        config={{
          header: header,
          footer: footer,
        }}
      >
        {component}
      </Layout>
    ) : (
      component
    );

  return <Route key={path} path={path} element={routeElement} />;
};

const RouterService = () => {
  const allRoutes = [...publicRoutes, ...adminRoutes];

  return (
    <BrowserRouter>
      <Routes>{allRoutes.map(renderRoute)}</Routes>
    </BrowserRouter>
  );
};

export default RouterService;
