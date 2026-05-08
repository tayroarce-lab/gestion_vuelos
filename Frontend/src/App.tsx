import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router/AppRouter';
import Toast from './components/common/Toast';
import { useToast } from './hooks/useToast';

function AppContent() {
  const { toasts, remove } = useToast();
  return (
    <>
      <AppRouter />
      <Toast toasts={toasts} onRemove={remove} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
