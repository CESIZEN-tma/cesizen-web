import "./App.css";
import RouterService from "./services/router-service/RouterService";
import { useTheme } from "./shared/hooks/useTheme";
import { ToastConfig } from "./shared/configs/toastConfig";
import "@xyflow/react/dist/style.css";

function App() {
  useTheme();
  return (
    <>
      <RouterService />
      <ToastConfig />
    </>
  );
}

export default App;
