import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Activity, Smartphone, CreditCard, Heart, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import PromotedAd from '../components/PromotedAd';

export default function LandingPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const defaultProducts = [
        { title: "Digital QR", price: "99", features: ["Digital Dashboard", "Instant Access"], best: true },
        { title: "QR Band", price: "299", features: ["Waterproof Silicon", "Wearable Safety"] },
        { title: "QR Bracelet", price: "399", features: ["Stainless Steel", "Premium Finish"] },
        { title: "Key Chain", price: "199", features: ["Durable TPU", "Attach to Keys"] }
    ];

    useEffect(() => {
        const prodRef = ref(db, 'config/products');
        const unsub = onValue(prodRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                setProducts(list);
            } else {
                setProducts(defaultProducts);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <div className="overflow-hidden bg-slate-950">
            {/* Hero Section */}
            <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-40 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-8 border border-primary/20"
                        >
                            <Zap size={16} />
                            <span className="italic">STAY SAFE, STAY PROTECTED</span>
                        </motion.div>

                        <motion.h1
                            {...fadeInUp}
                            className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-6 italic"
                        >
                            Seconds decide <span className="text-primary">survival</span>
                        </motion.h1>

                        <motion.p
                            {...fadeInUp}
                            transition={{ delay: 0.2 }}
                            className="max-w-2xl mx-auto text-xl text-white opacity-80 mb-10 leading-relaxed"
                        >
                            RESQR (<span className="text-primary font-bold">resqr.co.in</span>) is the official emergency QR identity platform designed to provide instant access to life-saving information during accidents.
                        </motion.p>

                        <motion.div
                            {...fadeInUp}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link to="/create-profile">
                                <Button size="lg" className="w-full sm:w-auto font-black italic">
                                    Get Your QR Now <ChevronRight size={20} />
                                </Button>
                            </Link>
                            <Link to="/#how-it-works">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-800 text-white font-bold">
                                    How it works
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Hero Decorative Shapes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20 pointer-events-none overflow-hidden text-white">
                    <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[140px]" />
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-20 bg-slate-950 border-y border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: <Activity className="text-primary" size={32} />,
                                title: "Information Gap",
                                desc: "Paramedics spend precious minutes identifying medical history and allergies."
                            },
                            {
                                icon: <Shield className="text-primary" size={32} />,
                                title: "Safety Shield",
                                desc: "Your medical conditions, blood group, and emergency contacts are always ready."
                            },
                            {
                                icon: <Heart className="text-primary" size={32} />,
                                title: "Family First",
                                desc: "Instantly notify your family with your location the moment your tag is scanned."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-sm hover:border-primary/20 transition-all group"
                            >
                                <div className="mb-6 p-4 bg-slate-950 inline-block rounded-2xl border border-slate-800 group-hover:bg-primary group-hover:text-white transition-colors">{item.icon}</div>
                                <h3 className="text-xl font-black mb-4 text-white uppercase italic tracking-tighter">{item.title}</h3>
                                <p className="text-white opacity-70 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4 text-white uppercase italic tracking-tighter">Simple, Transparent Pricing</h2>
                        <p className="text-white opacity-60 text-lg">Choose your protection type. Lifetime validity included.</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="text-primary animate-spin" size={48} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map((plan, i) => (
                                <div key={i} className={`relative p-8 rounded-3xl border-2 ${plan.best ? 'border-primary bg-slate-900 shadow-2xl scale-105 z-10' : 'border-slate-800 bg-slate-950'} overflow-hidden flex flex-col transition-all hover:scale-105 hover:z-20`}>
                                    {plan.best && (
                                        <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest">
                                            Base Plan
                                        </div>
                                    )}

                                    <div className="mb-6 text-white">
                                        <h3 className="text-xl font-black mb-2 uppercase italic tracking-tighter text-white">{plan.title}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-white">₹{plan.price}</span>
                                            <span className="text-white opacity-40 text-xs font-bold uppercase">/lifetime</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-grow">
                                        {[
                                            "Lifetime Profile",
                                            "Unlimited Edits",
                                            ...(plan.features || [])
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <CheckCircle2 className="text-primary shrink-0" size={16} />
                                                <span className="text-white opacity-80 text-sm font-medium">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link to="/create-profile">
                                        <Button variant={plan.best ? 'primary' : 'outline'} className={`w-full font-black italic ${!plan.best ? 'bg-slate-900 border-slate-800' : ''}`}>
                                            Select
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="mt-12 text-center text-white opacity-40 text-sm italic">All physical products include a digital QR setup. Secure payment via Razorpay.</p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-slate-900 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h2 className="text-5xl font-black mb-6 italic text-white underline decoration-primary decoration-4 underline-offset-8 uppercase tracking-tighter">Prepare for the unexpected.</h2>
                    <p className="text-white opacity-70 text-xl mb-12 max-w-2xl mx-auto">
                        Join thousands who trust RESQR for their family's safety.
                    </p>
                    <div className="flex justify-center flex-wrap gap-12 pt-6">
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl font-black text-primary italic">50k+</div>
                            <div className="text-xs font-bold text-white opacity-50 uppercase tracking-widest">Users Trust Us</div>
                        </div>
                        <div className="w-px h-16 bg-slate-800 hidden sm:block"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl font-black text-primary italic">100%</div>
                            <div className="text-xs font-bold text-white opacity-50 uppercase tracking-widest">Private & Secure</div>
                        </div>
                        <div className="w-px h-16 bg-slate-800 hidden sm:block"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl font-black text-primary italic">24/7</div>
                            <div className="text-xs font-bold text-white opacity-50 uppercase tracking-widest">Instant Access</div>
                        </div>
                    </div>
                    <div className="mt-16 max-w-4xl mx-auto">
                        <PromotedAd />
                    </div>
                </div>
            </section>
        </div>
    );
}
