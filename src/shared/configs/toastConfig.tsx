import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// eslint-disable-next-line react-refresh/only-export-components
export const showSuccess = (message: string) => toast.success(message);
// eslint-disable-next-line react-refresh/only-export-components
export const showError = (message: string) => toast.error(message);
// eslint-disable-next-line react-refresh/only-export-components
export const showInfo = (message: string) => toast.info(message);
// eslint-disable-next-line react-refresh/only-export-components
export const showWarning = (message: string) => toast.warning(message);

export const ToastConfig = () => (
  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme={document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'}
  />
);
