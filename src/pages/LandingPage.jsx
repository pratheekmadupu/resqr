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
        <div className="overflow-hidden bg-medical-bg font-manrope">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20 pb-20 lg:pt-32 bg-gradient-to-b from-[#F1FAEE] to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-left"
                        >
                            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 text-primary font-bold tracking-wider uppercase text-xs bg-primary/5">
                                <Zap size={14} className="mr-2 inline" /> Life-Saving Identity
                            </Badge>

                            <h1 className="text-5xl md:text-7xl font-extrabold text-secondary font-poppins leading-tight mb-6">
                                Emergency <span className="text-primary italic">QR Identity</span> for Instant Medical Access
                            </h1>

                            <p className="text-xl text-secondary/70 mb-10 leading-relaxed max-w-xl">
                                If an accident happens, a simple QR scan gives first responders your
                                <span className="text-secondary font-bold"> medical info</span>,
                                <span className="text-secondary font-bold"> emergency contacts</span>, and
                                <span className="text-secondary font-bold"> life-saving details</span> instantly.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/create-profile">
                                    <Button size="lg" className="px-10 py-4 rounded-full text-lg shadow-xl shadow-primary/20">
                                        Create Your QR ID
                                    </Button>
                                </Link>
                                <Button
                                    onClick={() => setIsDemoOpen(true)}
                                    variant="outline" size="lg" className="px-10 py-4 rounded-full text-lg border-secondary/10 bg-white hover:bg-secondary/5 font-bold"
                                >
                                    <Play size={20} className="mr-2 fill-current" /> Watch Demo
                                </Button>
                            </div>

                            <div className="mt-12 flex items-center gap-6">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                                            <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <div className="flex text-amber-500 mb-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" />)}
                                    </div>
                                    <p className="font-bold text-secondary">Trusted by {userCount} users</p>
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
                            <div className="relative z-10 bg-white p-8 rounded-[40px] shadow-2xl border border-secondary/5 max-w-md mx-auto">
                                <div className="relative aspect-square bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-secondary/10 overflow-hidden">
                                    <QrCode size={200} className="text-secondary opacity-20" />
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
                                        className="absolute w-16 h-16 object-contain opacity-10"
                                    />
                                </div>
                                <div className="mt-8 flex items-center gap-4 p-4 bg-medical-bg rounded-2xl border border-primary/10 relative">
                                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-secondary">Scanning...</h4>
                                        <p className="text-xs text-secondary/50">Retrieving emergency profile</p>
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

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none mb-4 px-4 py-1">Process</Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-secondary font-poppins mb-6">How It Works</h2>
                        <p className="text-secondary/60 max-w-2xl mx-auto text-lg">Four simple steps to ensure you and your loved ones are protected 24/7.</p>
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
                                className="relative p-8 rounded-3xl bg-medical-bg border border-secondary/5 hover:border-primary/20 transition-all hover:shadow-xl group"
                            >
                                <div className="text-6xl font-black text-secondary/5 absolute top-4 right-8 group-hover:text-primary/10 transition-colors uppercase italic">{item.step}</div>
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-secondary mb-3">{item.title}</h3>
                                <p className="text-secondary/60 leading-relaxed text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="py-24 bg-[#F1FAEE]/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-2xl text-left">
                            <Badge className="bg-secondary/10 text-secondary border-none mb-4 px-4 py-1">Versatility</Badge>
                            <h2 className="text-4xl md:text-5xl font-black text-secondary font-poppins">Protection for Everyone</h2>
                            <p className="mt-4 text-secondary/60 text-lg">The RESQR identity platform adapts to various industries and personal needs.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "For Individuals", icon: <Heart className="text-primary" />, features: ["Medical emergency access", "Personal safety vault"] },
                            { title: "For Elderly People", icon: <Activity className="text-blue-600" />, features: ["Health monitoring aid", "Instant relative alerts"] },
                            { title: "For Travelers", icon: <Plane className="text-green-600" />, features: ["Emergency info abroad", "Worldwide accessible profile"] },
                            { title: "For Schools", icon: <GraduationCap className="text-emerald-600" />, features: ["Student safety identity", "Parental contact portal"] },
                            { title: "For Businesses", icon: <Briefcase className="text-amber-600" />, features: ["Employee safety systems", "Workplace medical record"] },
                            { title: "For Adventure", icon: <Navigation className="text-purple-600" />, features: ["Hiking/Climbing safety", "GPS location relay"] }
                        ].map((useCase, i) => (
                            <motion.div
                                key={i}
                                {...fadeInUp}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-[32px] shadow-lg shadow-secondary/5 border border-secondary/5 group hover:-translate-y-2 transition-transform h-full flex flex-col"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                                    {useCase.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-secondary mb-4">{useCase.title}</h3>
                                <ul className="space-y-3 flex-grow">
                                    {useCase.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-secondary/70 text-sm font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Security Section */}
            <section className="py-24 bg-secondary text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <Badge className="bg-primary hover:bg-primary-dark border-none mb-6 text-white px-4 py-1">Trust & Security</Badge>
                            <h2 className="text-4xl md:text-5xl font-black font-poppins mb-8 leading-tight">Your Data Security is Our Top Priority.</h2>
                            <p className="text-white/60 text-xl leading-relaxed mb-10">
                                We understand the sensitivity of medical data. Our platform uses enterprise-grade
                                security to ensure your information is only accessible when it truly matters.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl text-primary"><Lock size={24} /></div>
                                    <div>
                                        <h4 className="font-bold mb-1">Encrypted Storage</h4>
                                        <p className="text-sm text-white/40">End-to-end data encryption at rest and in transit.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl text-blue-400"><ShieldCheck size={24} /></div>
                                    <div>
                                        <h4 className="font-bold mb-1">SSL Security</h4>
                                        <p className="text-sm text-white/40">Bank-level 256-bit SSL secure connections.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl text-green-400"><Eye size={24} /></div>
                                    <div>
                                        <h4 className="font-bold mb-1">Private Access</h4>
                                        <p className="text-sm text-white/40">Only emergency responders view your info.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl text-amber-400"><Globe size={24} /></div>
                                    <div>
                                        <h4 className="font-bold mb-1">GDPR Compliant</h4>
                                        <p className="text-sm text-white/40">Adhering to global data protection standards.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-white/10 flex items-center flex-wrap gap-8 grayscale opacity-50">
                                <span className="text-xs font-black uppercase tracking-widest text-white/40">Credential Partners</span>
                                <div className="flex gap-6 items-center italic font-black text-sm">
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
                                className="bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-[40px] p-1 border border-white/10"
                            >
                                <div className="bg-secondary rounded-[38px] p-10 text-center">
                                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-8 border border-primary/20 animate-pulse">
                                        <Shield size={48} className="text-primary" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 italic">100% SECURE</h3>
                                    <p className="text-white/50 mb-8 text-sm leading-relaxed">
                                        Over 10,000 users trust RESQR to store their critical medical data securely.
                                        We NEVER sell your data to third parties.
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2 text-xs font-bold">
                                            <CheckCircle2 size={14} className="text-green-500" /> AES-256
                                        </div>
                                        <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2 text-xs font-bold">
                                            <CheckCircle2 size={14} className="text-green-500" /> SSLv3
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Store Preview Section */}
            <section id="pricing" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <Badge className="bg-primary/10 text-primary border-none mb-4 px-4 py-1">Store</Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-secondary font-poppins mb-6">Choose Your Protection</h2>
                        <p className="text-secondary/60 max-w-2xl mx-auto text-lg">Lifetime validity. No subscriptions. One-time investment for life-saving safety.</p>
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
                                    className={`relative p-10 rounded-[40px] border-2 transition-all hover:shadow-2xl flex flex-col ${plan.best ? 'border-primary bg-white ring-8 ring-primary/5' : 'border-secondary/5 bg-medical-bg'}`}
                                >
                                    {plan.best && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/30">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black mb-4 uppercase text-secondary font-poppins">{plan.title}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black text-secondary">₹{plan.price}</span>
                                            <span className="text-secondary/40 text-xs font-bold uppercase">/lifetime</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-10 flex-grow">
                                        {[
                                            "Lifetime Profile",
                                            "Unlimited Edits",
                                            ...(plan.features || [])
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 className="text-green-600" size={12} />
                                                </div>
                                                <span className="text-secondary/70 text-sm font-semibold">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link to="/create-profile">
                                        <Button
                                            variant={plan.best ? 'primary' : 'secondary'}
                                            className={`w-full rounded-2xl py-4 font-bold shadow-lg ${plan.best ? 'shadow-primary/20' : 'shadow-secondary/20 hover:bg-secondary-light'}`}
                                        >
                                            Get Started
                                        </Button>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Emergency Features High-Level */}
            <section className="py-24 bg-gradient-to-r from-secondary to-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="bg-white/5 p-10 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <Navigation size={40} className="text-primary mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Emergency Alerts</h3>
                            <p className="text-white/50 text-sm leading-relaxed mb-6">Instantly notify emergency contacts when your QR is scanned. They receive your live location and a map link.</p>
                            <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-black">Live & Active</Badge>
                        </div>
                        <Link to="/store" className="bg-white/5 p-10 rounded-3xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <QrCode size={40} className="text-blue-400 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">NFC Smart Gear</h3>
                            <p className="text-white/50 text-sm leading-relaxed mb-6">One-tap medical profile access through NFC-enabled wristbands and cards. Visit our shop to order yours.</p>
                            <Badge className="bg-blue-400/20 text-blue-400 border-none text-[10px] uppercase font-black">Shop Gear</Badge>
                        </Link>
                        <div className="bg-white/5 p-10 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <Smartphone size={40} className="text-emerald-400 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Life Dashboard</h3>
                            <p className="text-white/50 text-sm leading-relaxed mb-6">Manage all your medical information and download your QR PDF anytime for print.</p>
                            <Badge className="bg-emerald-400/10 text-emerald-400 border-none text-[10px] uppercase font-black">Active</Badge>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials or Final CTA */}
            <section className="py-32 bg-medical-bg border-t border-secondary/5">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-5xl md:text-6xl font-black text-secondary font-poppins mb-10 leading-tight">Prepare for the unexpected.</h2>
                    <p className="text-secondary/60 text-xl mb-12">
                        Join thousands of proactive individuals who trust RESQR to bridge the gap in emergency communication.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link to="/create-profile">
                            <Button size="lg" className="px-12 py-4 rounded-full text-xl shadow-xl shadow-primary/20">
                                Secure Your Family Now
                            </Button>
                        </Link>
                        <div className="text-left bg-white p-4 rounded-2xl border border-secondary/5 flex items-center gap-4">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300" />
                            </div>
                            <span className="text-xs font-bold text-secondary/60 uppercase tracking-widest leading-none">500+ Profiles <br /> Created Today</span>
                        </div>
                    </div>

                    <div className="mt-20">
                        <PromotedAd />
                    </div>
                </div>
            </section>

            {/* Bottom Floating Stats */}
            <div className="fixed bottom-8 left-8 z-40 hidden xl:block">
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-secondary/5 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest">System Operational</p>
                </div>
            </div>
            {/* Demo Modal */}
            <Modal
                isOpen={isDemoOpen}
                onClose={() => setIsDemoOpen(false)}
                title="RESQR - How it Works"
            >
                <div className="aspect-video w-full bg-slate-100 rounded-2xl overflow-hidden relative group">
                    <img
                        src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop"
                        alt="Emergency Demo"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-secondary/40 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl">
                                <Play size={40} className="fill-white" />
                            </div>
                            <p className="font-black uppercase tracking-widest italic">Demo Video Loading...</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 space-y-4 text-secondary/70 font-medium">
                    <p>In this demo, you'll see how a first responder scans a RESQR tag on a patient's helmet and instantly accesses their medical history and emergency contacts.</p>
                    <ul className="space-y-2 text-sm italic">
                        <li>• Real-time scan alerts sent to family</li>
                        <li>• Instant medical directives display</li>
                        <li>• GPS coordination for paramedics</li>
                    </ul>
                </div>
            </Modal>
        </div>
    );
}

