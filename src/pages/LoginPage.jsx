import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ChevronRight, Github } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/dashboard');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(isLogin ? 'Authenticating...' : 'Creating your account...');

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success('Welcome back!', { id: toastId });
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
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
            await signInWithPopup(auth, provider);
            toast.success('Signed in with Google!');
            navigate('/payment');
        } catch (error) {
            console.error("Google auth error:", error);
            toast.error(`Google Sign-in failed: ${error.code || error.message}`);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR Logo" style={{ height: '48px', width: 'auto' }} />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">
                        {isLogin ? 'Secure Access' : 'Join RESQR'}
                    </h1>
                    <p className="text-white mt-2">
                        {isLogin ? 'Enter your credentials to continue' : 'Protect yourself and your family today'}
                    </p>
                </div>

                <Card className="p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        )}
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            icon={<Mail size={18} />}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            icon={<Lock size={18} />}
                        />

                        {isLogin && (
                            <div className="text-right">
                                <button type="button" className="text-sm font-semibold text-primary hover:underline">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <Button type="submit" className="w-full py-4 text-lg">
                            {isLogin ? 'Sign In' : 'Create Account'} <ChevronRight size={20} />
                        </Button>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-900 text-white font-medium italic">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button
                            onClick={handleGoogleSignIn}
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors font-semibold text-white"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" /> Google
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors font-semibold text-white">
                            <Github size={18} /> Github
                        </button>
                    </div>
                </Card>

                <p className="mt-8 text-center text-white font-medium">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary font-bold hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
}
