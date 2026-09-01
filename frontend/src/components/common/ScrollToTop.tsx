import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component: Ensures that whenever a user navigates to a new page or changes query params,
 * the window instantly scrolls to the very top (x: 0, y: 0), preventing landing at the footer.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname, search]);

  return null;
};
