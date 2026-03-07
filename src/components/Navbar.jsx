import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, User, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const isEmergency = location.pathname.startsWith('/e/');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    if (isEmergency) return null;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/store' },
        { name: 'About Us', path: '/about' },
        { name: 'Free QR', path: '/free-qr' },
        { name: 'Pricing', path: '/#pricing' },
    ];

    if (user) {
        navLinks.push({ name: 'Dashboard', path: '/dashboard' });
    }

    return (
        <nav className="sticky top-0 z-40 bg-medical-bg/80 backdrop-blur-md border-b border-white/5 font-manrope">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between py-4 items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR Logo" style={{ height: '64px', width: 'auto' }} />
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-[13px] font-black text-slate-100/60 hover:text-primary transition-all uppercase tracking-[0.2em]"
                            >
                                {link.name}
                            </Link>
                        ))}
                        {user ? (
                            <div className="flex items-center gap-6 border-l border-white/5 pl-8">
                                <span className="text-[12px] font-black text-slate-100 hidden lg:block uppercase tracking-wider">
                                    {user.displayName || user.email?.split('@')[0]}
                                </span>
                                <Button size="md" variant="ghost" className="text-white opacity-40 hover:text-primary hover:opacity-100 transition-all" onClick={handleLogout}>
                                    <LogOut size={20} />
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button size="md" className="rounded-full px-8 py-6 font-black italic shadow-xl shadow-primary/20 bg-primary text-white border-none text-sm tracking-widest">SIGN IN</Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-white">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-medical-bg border-b border-white/5 py-8 px-6 space-y-6 shadow-2xl">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="block text-base font-black text-slate-100/60 uppercase tracking-widest hover:text-primary transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {user ? (
                        <Button size="lg" className="w-full bg-white/5 text-white border-white/5 rounded-xl font-black italic" onClick={handleLogout}>
                            LOGOUT
                        </Button>
                    ) : (
                        <Link to="/login">
                            <Button size="lg" className="w-full rounded-xl shadow-xl bg-primary text-white border-none font-black italic">SIGN IN</Button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
