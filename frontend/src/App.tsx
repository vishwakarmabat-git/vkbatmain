import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppRoutes } from '@/routes/AppRoutes';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RealtimeProvider } from '@/realtime/RealtimeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: '#181821',
                  border: '1px solid #24242D',
                  color: '#F4F4F5',
                  fontFamily: 'Work Sans, sans-serif',
                },
              }}
            />
          </BrowserRouter>
        </RealtimeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
