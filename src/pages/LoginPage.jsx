import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ChevronRight, Github } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auth, db } from '../lib/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    onAuthStateChanged,
    isSignInWithEmailLink,
    signInWithEmailLink
} from 'firebase/auth';
import { ref, update } from 'firebase/database';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Handle Firebase Email Link Sign-in
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let emailForSignIn = window.localStorage.getItem('emailForSignIn');

            // If email is missing, ask user for it
            if (!emailForSignIn) {
                emailForSignIn = window.prompt('Please provide your email for confirmation');
            }

            if (emailForSignIn) {
                const toastId = toast.loading('Verifying your email link...');
                signInWithEmailLink(auth, emailForSignIn, window.location.href)
                    .then(async (result) => {
                        window.localStorage.removeItem('emailForSignIn');
                        await syncUserToDb(result.user);
                        toast.success('Successfully signed in!', { id: toastId });
                        navigate('/dashboard');
                    })
                    .catch((error) => {
                        console.error("Link error:", error);
                        toast.error('The link is invalid or expired.', { id: toastId });
                    });
            }
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && !isSignInWithEmailLink(auth, window.location.href)) {
                navigate('/dashboard');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const syncUserToDb = async (user, displayName) => {
        try {
            await update(ref(db, `users/${user.uid}`), {
                uid: user.uid,
                name: displayName || user.displayName || 'Anonymous',
                email: user.email,
                lastLogin: new Date().toISOString()
            });
        } catch (error) {
            console.error("Database sync error:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(isLogin ? 'Authenticating...' : 'Creating your account...');

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await syncUserToDb(userCredential.user);
                toast.success('Welcome back!', { id: toastId });
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                await syncUserToDb(userCredential.user, name);
                toast.success('Account created successfully!', { id: toastId });
            }
            navigate('/dashboard');
        } catch (error) {
            console.error("Auth error:", error);
            toast.error(error.message || 'Authentication failed', { id: toastId });
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await syncUserToDb(result.user);
            toast.success('Signed in with Google!');
            navigate('/payment');
        } catch (error) {
            console.error("Google auth error:", error);
            toast.error(`Google Sign-in failed: ${error.code || error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-medical-bg flex items-center justify-center p-6 font-manrope selection:bg-primary/30">
            <div className="w-full max-w-xl">
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR Logo" className="relative invert brightness-200 h-16 w-auto" />
                    </Link>
                    <div className="mt-8 space-y-3">
                        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins">
                            {isLogin ? 'Secure <span className="text-primary">Access</span>' : 'Join <span className="text-primary">RESQR</span>'}
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                            {isLogin ? 'Building a safer world through identity' : 'Protect yourself and your family today'}
                        </p>
                    </div>
                </div>

                <Card className="p-10 md:p-14 bg-medical-card border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[40px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Guardian Name</label>
                                <Input
                                    placeholder="e.g. John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Verified Email</label>
                            <Input
                                type="email"
                                placeholder="name@resqr.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon={<Mail size={18} className="text-primary" />}
                                className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Secure Vault Password</label>
                                {isLogin && (
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline italic">
                                        Recovery Required?
                                    </button>
                                )}
                            </div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                icon={<Lock size={18} className="text-primary" />}
                                className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20"
                            />
                        </div>

                        <Button type="submit" className="w-full py-8 text-xl font-black italic rounded-[20px] shadow-2xl shadow-primary/20 bg-primary text-white border-none group hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter">
                            {isLogin ? 'INITIATE SESSION' : 'ACTIVATE PROTECTION'} <ChevronRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-12 relative text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <span className="relative px-6 bg-medical-card text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Global Identity Gate</span>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <button
                            onClick={handleGoogleSignIn}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-black italic uppercase tracking-widest text-[10px] text-white"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" /> Google
                        </button>
                        <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-black italic uppercase tracking-widest text-[10px] text-white">
                            <Github size={18} className="text-primary" /> Github
                        </button>
                    </div>
                </Card>

                <div className="mt-12 text-center">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">
                        {isLogin ? "New to the Guardian Network?" : "Already Protected?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-primary font-black hover:underline ml-2"
                        >
                            {isLogin ? 'EXPAND PROTECTION' : 'SECURE SIGN IN'}
                        </button>
                    </p>
                </div>

                <footer className="mt-16 text-center opacity-20">
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white leading-relaxed">
                        End-to-End Encrypted Session • ISO 27001 Certified Infrastructure • 256-Bit AES Safeguard
                    </p>
                </footer>
            </div>
        </div>
    );
}
