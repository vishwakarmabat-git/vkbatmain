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
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
            <Toaster
              position={isMobile ? 'top-center' : 'top-right'}
              theme="dark"
              offset={isMobile ? '85px' : '24px'}
              mobileOffset={{ top: '85px', left: '16px', right: '16px' }}
              duration={2400}
              toastOptions={{
                style: {
                  background: 'rgba(20, 20, 28, 0.95)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(212, 175, 55, 0.15)',
                  color: '#F4F4F5',
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '13px',
                  borderRadius: '14px',
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
