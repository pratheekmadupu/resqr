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
        { name: 'Pricing', path: '/#pricing' },
    ];

    if (user) {
        navLinks.push({ name: 'Dashboard', path: '/dashboard' });
    }

    return (
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-secondary/5 font-manrope">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between py-2 items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR Logo" style={{ height: '48px', width: 'auto' }} />
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-sm font-bold text-secondary/70 hover:text-primary transition-colors uppercase tracking-wider"
                            >
                                {link.name}
                            </Link>
                        ))}
                        {user ? (
                            <div className="flex items-center gap-4 border-l border-secondary/10 pl-8">
                                <span className="text-sm font-bold text-secondary hidden lg:block">
                                    {user.displayName || user.email?.split('@')[0]}
                                </span>
                                <Button size="sm" variant="ghost" className="text-secondary opacity-60 hover:text-primary" onClick={handleLogout}>
                                    <LogOut size={18} />
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button size="sm" variant="secondary" className="rounded-full px-6 font-bold shadow-sm">Sign In</Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-secondary">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-secondary/5 py-4 px-4 space-y-4 shadow-xl">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="block text-base font-bold text-secondary uppercase tracking-widest"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {user ? (
                        <Button size="md" variant="secondary" className="w-full bg-secondary text-white border-none rounded-xl" onClick={handleLogout}>
                            Logout
                        </Button>
                    ) : (
                        <Link to="/login">
                            <Button size="md" variant="secondary" className="w-full rounded-xl shadow-lg">Sign In</Button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
