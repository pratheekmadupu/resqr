import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProfileCreation from './pages/ProfileCreation';
import PaymentPage from './pages/PaymentPage';
import SuccessPage from './pages/SuccessPage';
import EmergencyPage from './pages/EmergencyPage';
import AdminPanel from './pages/AdminPanel';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-white">
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create-profile" element={<ProfileCreation />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                    <Route path="/e/:id" element={<EmergencyPage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
