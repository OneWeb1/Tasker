import { StoreProvider, ThemeProvider } from '@/app/providers';
import { AppRouter } from '@/app/router';
import { ToastProvider } from '@/shared/ui/Toast';

export default function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}