import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProfileCreation from './pages/ProfileCreation';
import PaymentPage from './pages/PaymentPage';
import SuccessPage from './pages/SuccessPage';
import EmergencyPage from './pages/EmergencyPage';
import QRScanPage from './pages/QRScanPage';
import AdminPanel from './pages/AdminPanel';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactUs from './pages/ContactUs';
import LegalPage from './pages/LegalPage';
import AboutUs from './pages/AboutUs';
import ViralQR from './pages/ViralQR';

function App() {
    const location = useLocation();
    const isScanPage = location.pathname.startsWith('/e/') || location.pathname.startsWith('/qr/') || location.pathname.startsWith('/u/') || (location.pathname.length > 1 && !['dashboard', 'create-profile', 'payment', 'success', 'admin', 'login', 'contact', 'legal', 'about', 'free-qr', 'viral-id'].includes(location.pathname.split('/')[1]));

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-white">
            {!isScanPage && <Navbar />}
            <main className={`flex-grow ${isScanPage ? 'pt-0' : ''}`}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/free-qr" element={<ViralQR />} />
                    <Route path="/viral-id" element={<ViralQR />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create-profile" element={<ProfileCreation />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                    <Route path="/e/:id" element={<EmergencyPage />} />
                    <Route path="/qr/:profileId" element={<QRScanPage />} />
                    <Route path="/u/:username" element={<QRScanPage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/p/:username" element={<QRScanPage />} />
                    <Route path="/u/:username" element={<QRScanPage />} />
                    <Route path="/:username" element={<QRScanPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            {!isScanPage && <Footer />}
        </div>
    );
}

export default App;
