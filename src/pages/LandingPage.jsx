import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, ChevronRight, Activity, Heart, Zap, CheckCircle2,
    Loader2, Smartphone, CreditCard, Users, Lock, Eye,
    Navigation, Briefcase, GraduationCap, Plane, User, Phone,
    QrCode, MapPin, Star, ShieldCheck, Globe
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import PromotedAd from '../components/PromotedAd';
import { Modal } from '../components/ui/Modal';
import { Play } from 'lucide-react';

export default function LandingPage() {
    const [products, setProducts] = useState([]);
    const [userCount, setUserCount] = useState('10,000+');
    const [loading, setLoading] = useState(true);
    const [isDemoOpen, setIsDemoOpen] = useState(false);

    const defaultProducts = [
        { title: "Digital QR", price: "99", features: ["Digital Dashboard", "Instant Access"], best: true },
        { title: "QR Band", price: "299", features: ["Waterproof Silicon", "Wearable Safety"] },
        { title: "QR Bracelet", price: "399", features: ["Stainless Steel", "Premium Finish"] },
        { title: "Key Chain", price: "199", features: ["Durable TPU", "Attach to Keys"] }
    ];

    useEffect(() => {
        // Fetch Authenticated User Count
        const usersRef = ref(db, 'users');
        const unsubUsers = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const count = Object.keys(data).length;
                setUserCount((count + 10000).toLocaleString() + '+');
            }
        });

        // Fetch Products
        const prodRef = ref(db, 'config/products');
        const unsubProducts = onValue(prodRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                setProducts(list);
            } else {
                setProducts(defaultProducts);
            }
            setLoading(false);
        });

        return () => {
            unsubUsers();
            unsubProducts();
        };
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    const staggerContainer = {
        initial: {},
        whileInView: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="overflow-hidden bg-medical-bg font-manrope text-slate-100">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20 pb-20 lg:pt-32 bg-slate-950/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-left"
                        >
                            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 text-primary font-bold tracking-wider uppercase text-xs bg-primary/20">
                                <Zap size={14} className="mr-2 inline" /> Life-Saving Identity
                            </Badge>

                            <h1 className="text-5xl md:text-7xl font-extrabold text-white font-poppins leading-tight mb-6">
                                Emergency <span className="text-primary italic">AI Identity</span> for Instant Medical Access
                            </h1>

                            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                                If an accident happens, our
                                <span className="text-white font-bold"> AI Assistant</span> summarizes your
                                <span className="text-white font-bold"> medical info</span> and provides
                                <span className="text-white font-bold"> life-saving instructions</span> for responders instantly.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/create-profile">
                                    <Button size="lg" className="px-10 py-6 rounded-3xl text-lg shadow-xl shadow-primary/20 bg-primary text-white border-none font-black italic uppercase tracking-tighter">
                                        SECURE PREMIUM ID
                                    </Button>
                                </Link>
                                <Link to="/free-qr">
                                    <Button
                                        variant="outline" size="lg" className="px-10 py-6 rounded-3xl text-lg border-white/10 bg-white/5 text-white hover:bg-white/10 font-black italic uppercase tracking-tighter"
                                    >
                                        Try FREE QR
                                    </Button>
                                </Link>
                            </div>

                            <div className="mt-12 flex items-center gap-6">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-sm">
                                            <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <div className="flex text-amber-500 mb-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" />)}
                                    </div>
                                    <p className="font-bold text-slate-400">Trusted by {userCount} users</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative"
                        >
                            {/* QR Scanning Animation Visual */}
                            <div className="relative z-10 bg-medical-card p-8 rounded-[40px] shadow-2xl border border-white/5 max-w-md mx-auto">
                                <div className="relative aspect-square bg-slate-950/50 rounded-3xl flex items-center justify-center border-2 border-dashed border-white/5 overflow-hidden">
                                    <QrCode size={200} className="text-white opacity-10" />
                                    <motion.div
                                        animate={{ y: [0, 200, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(230,57,70,0.8)] z-20"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-48 h-48 border-2 border-primary/30 rounded-2xl animate-pulse" />
                                    </div>
                                    <img
                                        src={`${import.meta.env.BASE_URL}logo.png`}
                                        alt="Logo"
                                        className="absolute w-16 h-16 object-contain opacity-10 invert"
                                    />
                                </div>
                                <div className="mt-8 flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-primary/10 relative">
                                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white uppercase italic text-sm tracking-widest">Scanning...</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Retrieving emergency profile</p>
                                    </div>
                                    {/* Floating Alert */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute -top-12 -right-8 bg-primary text-white text-[10px] font-black px-3 py-2 rounded-xl shadow-lg shadow-primary/30 uppercase tracking-widest whitespace-nowrap"
                                    >
                                        Alert Sent to Family!
                                    </motion.div>
                                </div>
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 opacity-30">
                                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                                <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-[120px]" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* VIRAL SECTION - STARTUP GROWTH */}
            <section className="bg-primary/5 py-12 border-b border-primary/10">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <QrCode size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Need immediate protection?</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Create a basic temporary ID in under 30 seconds for free.</p>
                        </div>
                    </div>
                    <Link to="/free-qr">
                        <Button className="px-12 py-6 rounded-2xl bg-white text-primary hover:bg-slate-100 border-none font-black italic uppercase tracking-widest shadow-xl">
                            Generate Free QR ID
                        </Button>
                    </Link>
                </div>
            </section>

            {/* AI FEATURE SHOWCASE */}
            <section className="py-24 bg-medical-bg relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div {...fadeInUp}>
                            <Badge className="bg-indigo-500/20 text-indigo-300 border-none px-4 py-1 font-black italic mb-6">NEXT-GEN TECH</Badge>
                            <h2 className="text-4xl md:text-6xl font-black text-white font-poppins italic uppercase tracking-tighter leading-none mb-8">
                                AI-Powered <br /> <span className="text-indigo-400">Tactical Response.</span>
                            </h2>
                            <p className="text-slate-400 text-xl font-medium leading-relaxed mb-10">
                                RESQR isn't just a database. Our AI Assistant analyzes your conditions and provides immediate, context-aware instructions for first-responders.
                            </p>

                            <div className="space-y-6">
                                {[
                                    "Dynamic First-Aid Summaries",
                                    "Condition-Specific Alerts (Diabetic, Cardiac, etc.)",
                                    "Nearest Trauma Care Logic",
                                    "Encrypted Neural Stream Protocol"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        </div>
                                        <span className="text-slate-200 text-sm font-black uppercase tracking-widest italic">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <div className="relative">
                            <div className="bg-indigo-500/10 p-12 rounded-[50px] border border-indigo-500/20 backdrop-blur-3xl">
                                <div className="space-y-6">
                                    <div className="bg-slate-950/80 p-8 rounded-3xl border border-white/5 relative">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Zap size={16} className="text-indigo-400" />
                                            <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">AI Analysis Node</span>
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-tighter text-slate-400 italic">"User is Diabetic. Do not administer sugar if unconscious. Paramedics alerted."</p>
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/80 p-8 rounded-3xl border border-white/5 opacity-40">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 italic">Awaiting scanner vector output...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-slate-950/40 relative border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none mb-4 px-4 py-1 font-black italic">PROCESS</Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-white font-poppins mb-6 italic uppercase tracking-tighter">How It Works</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">Four simple steps to ensure you and your loved ones are protected 24/7.</p>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {[
                            { step: "01", title: "Create Your Profile", icon: <User className="text-primary" />, desc: "Sign up and create your secure emergency medical vault in under 2 minutes." },
                            { step: "02", title: "Add Emergency Details", icon: <Activity className="text-primary" />, desc: "Include blood group, allergies, medications, and life-saving contacts." },
                            { step: "03", title: "Generate QR Code", icon: <QrCode className="text-primary" />, desc: "Get your unique QR code instantly for digital use or print it on physical gear." },
                            { step: "04", title: "Responders Scan It", icon: <Smartphone className="text-primary" />, desc: "In an emergency, responders scan your tag to access your profile and notify family." }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeInUp}
                                className="relative p-8 rounded-3xl bg-medical-card border border-white/5 hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-black/50 group"
                            >
                                <div className="text-6xl font-black text-white/5 absolute top-4 right-8 group-hover:text-primary/10 transition-colors uppercase italic">{item.step}</div>
                                <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="py-24 bg-medical-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-2xl text-left">
                            <Badge className="bg-white/10 text-slate-400 border-none mb-4 px-4 py-1 font-black italic">VERSATILITY</Badge>
                            <h2 className="text-4xl md:text-5xl font-black text-white font-poppins italic uppercase tracking-tighter">Protection for Everyone</h2>
                            <p className="mt-4 text-slate-500 text-lg font-medium leading-relaxed">The RESQR identity platform adapts to various industries and personal needs.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "For Individuals", icon: <Heart className="text-primary" />, features: ["Medical emergency access", "Personal safety vault"] },
                            { title: "For Elderly People", icon: <Activity className="text-blue-400" />, features: ["Health monitoring aid", "Instant relative alerts"] },
                            { title: "For Travelers", icon: <Plane className="text-emerald-400" />, features: ["Emergency info abroad", "Worldwide accessible profile"] },
                            { title: "For Schools", icon: <GraduationCap className="text-cyan-400" />, features: ["Student safety identity", "Parental contact portal"] },
                            { title: "For Businesses", icon: <Briefcase className="text-amber-400" />, features: ["Employee safety systems", "Workplace medical record"] },
                            { title: "For Adventure", icon: <Navigation className="text-purple-400" />, features: ["Hiking/Climbing safety", "GPS location relay"] }
                        ].map((useCase, i) => (
                            <motion.div
                                key={i}
                                {...fadeInUp}
                                transition={{ delay: i * 0.1 }}
                                className="bg-medical-card p-10 rounded-[40px] shadow-2xl shadow-black/50 border border-white/5 group hover:-translate-y-2 transition-transform h-full flex flex-col"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                    {useCase.icon}
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tight">{useCase.title}</h3>
                                <ul className="space-y-4 flex-grow">
                                    {useCase.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-slate-400 text-sm font-bold uppercase tracking-wide">
                                            <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Security Section */}
            <section className="py-24 bg-slate-950 text-white relative overflow-hidden border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <Badge className="bg-primary text-white border-none mb-6 px-6 py-1 font-black italic">TRUST & SECURITY</Badge>
                            <h2 className="text-4xl md:text-5xl font-black font-poppins mb-8 leading-tight italic uppercase tracking-tighter">Your Data Security is Our Top Priority.</h2>
                            <p className="text-slate-400 text-xl leading-relaxed mb-10 font-medium">
                                We understand the sensitivity of medical data. Our platform uses enterprise-grade
                                security to ensure your information is only accessible when it truly matters.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                                <div className="flex items-start gap-4 p-6 bg-white/5 rounded-[30px] border border-white/5">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><Lock size={24} /></div>
                                    <div>
                                        <h4 className="font-black uppercase tracking-widest text-xs mb-1">Encrypted Vaults</h4>
                                        <p className="text-[10px] text-white/40 font-bold uppercase">End-to-end data encryption.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-6 bg-white/5 rounded-[30px] border border-white/5">
                                    <div className="p-3 bg-blue-400/10 rounded-xl text-blue-400"><ShieldCheck size={24} /></div>
                                    <div>
                                        <h4 className="font-black uppercase tracking-widest text-xs mb-1">SSL Security</h4>
                                        <p className="text-[10px] text-white/40 font-bold uppercase">256-bit SSL connections.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-6 bg-white/5 rounded-[30px] border border-white/5">
                                    <div className="p-3 bg-emerald-400/10 rounded-xl text-emerald-400"><Eye size={24} /></div>
                                    <div>
                                        <h4 className="font-black uppercase tracking-widest text-xs mb-1">Private Access</h4>
                                        <p className="text-[10px] text-white/40 font-bold uppercase">Responder-only viewing.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-6 bg-white/5 rounded-[30px] border border-white/5">
                                    <div className="p-3 bg-amber-400/10 rounded-xl text-amber-400"><Globe size={24} /></div>
                                    <div>
                                        <h4 className="font-black uppercase tracking-widest text-xs mb-1">GDPR Compliant</h4>
                                        <p className="text-[10px] text-white/40 font-bold uppercase">Global safety standards.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-white/10 flex items-center flex-wrap gap-8 grayscale opacity-30">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Credential Partners</span>
                                <div className="flex gap-10 items-center italic font-black text-[10px] uppercase tracking-widest">
                                    <span>HOSPITAL NETWORK</span>
                                    <span>MED-CERTIFIED</span>
                                    <span>DOCTOR'S CHOICE</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-[50px] p-1 border border-white/10"
                            >
                                <div className="bg-slate-900 rounded-[48px] p-16 text-center shadow-2xl">
                                    <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-primary/10 mb-8 border border-primary/20 animate-pulse">
                                        <Shield size={56} className="text-primary" />
                                    </div>
                                    <h3 className="text-4xl font-black mb-4 italic uppercase tracking-tighter">100% SECURE</h3>
                                    <p className="text-slate-400 mb-10 text-lg font-medium leading-relaxed">
                                        Over 10,000 users trust RESQR to store their critical medical data securely.
                                        We NEVER sell your data.
                                    </p>
                                    <div className="flex justify-center gap-6">
                                        <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                                            <CheckCircle2 size={16} className="text-emerald-500" /> AES-256
                                        </div>
                                        <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                                            <CheckCircle2 size={16} className="text-emerald-500" /> SSLv3
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Store Preview Section */}
            <section id="pricing" className="py-24 bg-medical-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <Badge className="bg-white/10 text-slate-400 border-none mb-4 px-6 py-1 font-black italic">STORE</Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-white font-poppins mb-6 italic uppercase tracking-tighter">Choose Your Protection</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">Lifetime validity. No subscriptions. One-time investment for life-saving safety.</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="text-primary animate-spin" size={48} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((plan, i) => (
                                <motion.div
                                    key={i}
                                    {...fadeInUp}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative p-10 rounded-[60px] border-2 transition-all hover:shadow-2xl flex flex-col hover:scale-[1.02] ${plan.best ? 'border-primary bg-medical-card shadow-2xl shadow-primary/10 ring-8 ring-primary/5' : 'border-white/5 bg-medical-card'}`}
                                >
                                    {plan.best && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-10">
                                        <h3 className="text-2xl font-black mb-4 uppercase text-white font-poppins italic tracking-tight">{plan.title}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-black text-white italic">₹{plan.price}</span>
                                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">/lifetime</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-5 mb-12 flex-grow">
                                        {[
                                            "Lifetime Profile",
                                            "Unlimited Edits",
                                            ...(plan.features || [])
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-4">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 className="text-emerald-500" size={14} />
                                                </div>
                                                <span className="text-slate-400 text-sm font-bold uppercase tracking-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link to="/create-profile">
                                        <Button
                                            variant={plan.best ? 'primary' : 'outline'}
                                            className={`w-full rounded-full py-8 text-lg font-black italic shadow-2xl transition-all border-none ${plan.best ? 'bg-primary text-white shadow-primary/20' : 'bg-white/5 text-white hover:bg-white/10 shadow-black/20'}`}
                                        >
                                            GET STARTED
                                        </Button>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Emergency Features High-Level */}
            <section className="py-24 bg-slate-950 border-t border-white/5 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="bg-medical-card p-12 rounded-[40px] border border-white/5 backdrop-blur-sm group hover:border-primary/20 transition-all">
                            <Navigation size={48} className="text-primary mb-8 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 font-poppins">Emergency Alerts</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">Instantly notify emergency contacts when your QR is scanned. They receive your live location and a map link.</p>
                            <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-black px-4 py-1 italic">LIVE & ACTIVE</Badge>
                        </div>
                        <Link to="/store" className="bg-medical-card p-12 rounded-[40px] border border-white/5 backdrop-blur-sm group hover:border-blue-500/20 transition-all">
                            <QrCode size={48} className="text-blue-400 mb-8 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 font-poppins">NFC Smart Gear</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">One-tap medical profile access through NFC-enabled wristbands and cards. Visit our shop to order yours.</p>
                            <Badge className="bg-blue-400/20 text-blue-400 border-none text-[10px] uppercase font-black px-4 py-1 italic">SHOP GEAR</Badge>
                        </Link>
                        <div className="bg-medical-card p-12 rounded-[40px] border border-white/5 backdrop-blur-sm group hover:border-emerald-500/20 transition-all">
                            <Smartphone size={48} className="text-emerald-400 mb-8 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 font-poppins">Life Dashboard</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">Manage all your medical information and download your QR PDF anytime for print.</p>
                            <Badge className="bg-emerald-400/20 text-emerald-400 border-none text-[10px] uppercase font-black px-4 py-1 italic">ACTIVE SYSTEM</Badge>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-32 bg-medical-bg border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none italic font-black text-[20vw] select-none text-white whitespace-nowrap overflow-hidden">
                    SECURED BY RESQR • 24/7 PROTECTION
                </div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-6xl md:text-8xl font-black text-white font-poppins mb-10 leading-none italic uppercase tracking-tighter">Prepare for <br /> the <span className="text-primary italic-display">Unexpected.</span></h2>
                    <p className="text-slate-400 text-2xl mb-16 font-medium leading-relaxed">
                        Join thousands of proactive individuals who trust RESQR to bridge the gap in emergency communication.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                        <Link to="/create-profile">
                            <Button size="lg" className="px-16 py-10 rounded-full text-3xl font-black italic uppercase shadow-2xl shadow-primary/30 transition-transform active:scale-95 bg-primary text-white border-none">
                                SECURE YOUR FAMILY
                            </Button>
                        </Link>
                        <div className="text-left bg-medical-card p-6 rounded-[30px] border border-white/5 flex items-center gap-6 shadow-2xl">
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800" />
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-tight">12.5k+ PROFILES <br /> ACTIVE WORLDWIDE</span>
                        </div>
                    </div>

                    <div className="mt-24">
                        <PromotedAd />
                    </div>
                </div>
            </section>

            {/* Bottom Floating Stats */}
            <div className="fixed bottom-8 left-8 z-40 hidden xl:block">
                <div className="bg-medical-card/80 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.4em]">SYSTEM OPERATIONAL</p>
                </div>
            </div>

            {/* Demo Modal */}
            <Modal
                isOpen={isDemoOpen}
                onClose={() => setIsDemoOpen(false)}
                title="RESQR - HOW IT WORKS"
            >
                <div className="aspect-video w-full bg-slate-950 rounded-[30px] overflow-hidden relative group border border-white/10 shadow-2xl">
                    <img
                        src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop"
                        alt="Emergency Demo"
                        className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl shadow-primary/50 cursor-pointer hover:scale-110 transition-transform">
                                <Play size={44} className="fill-white ml-2" />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter font-poppins">Watch the Demo Video</h3>
                            <p className="font-bold text-[10px] uppercase tracking-[0.4em] opacity-50 mt-2">Connecting to Emergency Stream...</p>
                        </div>
                    </div>
                </div>
                <div className="mt-10 space-y-6 text-slate-400 font-medium leading-relaxed">
                    <p className="text-lg">In this demo, you'll see how a first responder scans a RESQR tag on a patient's helmet and instantly accesses their medical history and emergency contacts.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-8 rounded-[30px] border border-white/5">
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-white">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Zap size={16} /></div>
                            Real-time scan alerts
                        </div>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-white">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500"><Activity size={16} /></div>
                            Medical diagnostics
                        </div>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-white">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><Navigation size={16} /></div>
                            GPS location relay
                        </div>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-white">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500"><Lock size={16} /></div>
                            Encrypted Privacy
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

