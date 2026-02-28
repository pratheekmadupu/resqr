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
        { name: 'Pricing', path: '/#pricing' },
    ];

    if (user) {
        navLinks.push({ name: 'Dashboard', path: '/dashboard' });
    }

    return (
        <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between py-2 items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="RESQR Logo" style={{ height: '48px', width: 'auto' }} />
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-sm font-medium text-white hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                        {user ? (
                            <div className="flex items-center gap-4 border-l border-slate-800 pl-8">
                                <span className="text-sm font-bold text-white hidden lg:block">
                                    {user.displayName || user.email?.split('@')[0]}
                                </span>
                                <Button size="sm" variant="ghost" className="text-white opacity-60 hover:text-white" onClick={handleLogout}>
                                    <LogOut size={18} />
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button size="sm" variant="secondary">Sign In</Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-800 py-4 px-4 space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="block text-base font-medium text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {user ? (
                        <Button size="md" variant="secondary" className="w-full bg-slate-800 text-white border-none" onClick={handleLogout}>
                            Logout
                        </Button>
                    ) : (
                        <Link to="/login">
                            <Button size="md" variant="secondary" className="w-full">Sign In</Button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
