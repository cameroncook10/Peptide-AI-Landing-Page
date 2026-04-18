import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import CinematicPage from './components/CinematicPage';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import CCPA from './components/CCPA';
import Support from './components/Support';
import Affiliate from './components/Affiliate';

function HomePage() {
  return (
    <>
      <div className="scroll-progress" />
      <Nav />
      <CinematicPage />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/ccpa" element={<CCPA />} />
        <Route path="/support" element={<Support />} />
        <Route path="/affiliates" element={<Affiliate />} />
      </Routes>
    </BrowserRouter>
  );
}
