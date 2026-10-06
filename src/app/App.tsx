import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { LocaleProvider } from '../state/locale';
import { SalesProvider } from '../state/sales';
import { LandingPage } from '../pages/landing/LandingPage';
import { DoorProvider } from './door';
import { ToastProvider } from './toast';

/* /garage is a separate page and a separate download: three.js, the garage scene and the checkout
   never load for someone who only reads the landing. */
const GaragePage = lazy(() => import('../pages/garage/GaragePage'));
const PrivacyPage = lazy(() => import('../pages/legal/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/legal/TermsPage'));

function GarageFallback() {
  return <div id="taller" aria-busy="true" />;
}

export function App() {
  return (
    <LocaleProvider>
      <SalesProvider>
        <ToastProvider>
          <BrowserRouter>
            <DoorProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/garage/:partId?" element={<Suspense fallback={<GarageFallback />}><GaragePage /></Suspense>} />
                <Route path="/aviso-de-privacidad" element={<Suspense><PrivacyPage /></Suspense>} />
                <Route path="/terminos" element={<Suspense><TermsPage /></Suspense>} />
                <Route path="*" element={<LandingPage />} />
              </Routes>
            </DoorProvider>
          </BrowserRouter>
        </ToastProvider>
      </SalesProvider>
    </LocaleProvider>
  );
}
