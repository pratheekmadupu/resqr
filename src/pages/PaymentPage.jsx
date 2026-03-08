import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Lock, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { ref, onValue, update, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function PaymentPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const DEFAULT_PRODUCTS = [
        { id: 'digital', title: 'Digital QR', price: 99, best: true },
        { id: 'band', title: 'QR Band', price: 299, best: false },
        { id: 'bracelet', title: 'QR Bracelet', price: 399, best: false },
        { id: 'keychain', title: 'Key Chain', price: 199, base: false }
    ];

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                toast.error("Please login to proceed to payment.");
                navigate('/login?redirect_to=/payment');
            }
        });

        const prodRef = ref(db, 'config/products');
        const unsub = onValue(prodRef, (snapshot) => {
            const data = snapshot.val();
            let list = [];
            if (data) {
                list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
            } else {
                list = DEFAULT_PRODUCTS;
            }
            setProducts(list);
            const best = list.find(p => p.best) || list[0];
            setSelectedProduct(best);
            setLoading(false);
        }, (error) => {
            console.error("Firebase load error:", error);
            setProducts(DEFAULT_PRODUCTS);
            setSelectedProduct(DEFAULT_PRODUCTS[0]);
            setLoading(false);
        });

        // Robust fallback if Firebase hangs
        const timer = setTimeout(() => {
            setLoading(currentLoading => {
                if (currentLoading) {
                    setProducts(DEFAULT_PRODUCTS);
                    setSelectedProduct(DEFAULT_PRODUCTS.find(p => p.best) || DEFAULT_PRODUCTS[0]);
                    return false;
                }
                return currentLoading;
            });
        }, 2000);

        return () => {
            unsubscribeAuth();
            unsub();
            clearTimeout(timer);
        };
    }, [navigate]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!selectedProduct) {
            toast.error("Please select a product first.");
            return;
        }

        const res = await loadRazorpayScript();

        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            return;
        }

        const options = {
            key: "rzp_live_SOcgE2ruRvreG4", // Hardcoded Live Key ID as requested
            amount: selectedProduct.price * 100, // Amount in paise
            currency: "INR",
            name: "RESQR",
            description: `Payment for ${selectedProduct.title}`,
            image: `${window.location.origin}/logo.png`,
            handler: async function (response) {
                try {
                    let activeSlug = localStorage.getItem('resqr_active_slug');
                    const currentUser = auth.currentUser;

                    if (!activeSlug && currentUser) {
                        // Try to find the slug associated with this UID
                        const profilesRef = ref(db, 'profiles');
                        const profilesSnapshot = await get(profilesRef);
                        if (profilesSnapshot.exists()) {
                            const profiles = profilesSnapshot.val();
                            const entry = Object.entries(profiles).find(([slug, data]) => data.uid === currentUser.uid);
                            if (entry) {
                                activeSlug = entry[0];
                                localStorage.setItem('resqr_active_slug', activeSlug);
                            }
                        }
                    }

                    if (activeSlug) {
                        const profileRef = ref(db, `profiles/${activeSlug}`);
                        await update(profileRef, {
                            payment_status: 'paid',
                            payment_id: response.razorpay_payment_id,
                            order_id: response.razorpay_order_id,
                            payment_date: new Date().toISOString(),
                            last_updated: new Date().toISOString()
                        });
                        console.log("Payment Success and Profile Updated for:", activeSlug);
                    } else if (currentUser) {
                        // Fallback: Create a slug based on email or UID if nothing else works
                        const fallbackSlug = currentUser.email ? currentUser.email.split('@')[0] : currentUser.uid.substring(0, 8);
                        const profileRef = ref(db, `profiles/${fallbackSlug}`);
                        await update(profileRef, {
                            payment_status: 'paid',
                            payment_id: response.razorpay_payment_id,
                            uid: currentUser.uid,
                            email: currentUser.email
                        });
                        localStorage.setItem('resqr_active_slug', fallbackSlug);
                    }

                    toast.success('Payment successful! Your Identity is now live.');
                    navigate('/success');
                } catch (error) {
                    console.error("Error updating profile after payment:", error);
                    toast.error("Payment was successful but profile update failed. Please contact support.");
                    navigate('/success');
                }
            },
            prefill: {
                name: "",
                email: "",
                contact: "",
                method: "upi" // Default to UPI as requested
            },
            notes: {
                payment_type: "live_transaction",
                product_id: selectedProduct.id
            },
            config: {
                display: {
                    blocks: {
                        banks: {
                            name: "All Payment Methods",
                            instruments: [
                                { method: "upi" },
                                { method: "card" },
                                { method: "netbanking" },
                                { method: "wallet" }
                            ]
                        }
                    },
                    sequence: ["block.banks"],
                    preferences: { show_default_blocks: true }
                }
            },
            theme: {
                color: "#e11d48" // matches primary red
            }
        };

        try {
            console.log("Initializing Razorpay with key:", options.key);
            if (!options.key) {
                throw new Error("Razorpay Key ID is missing. Check your environment variables.");
            }
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Razorpay Payment Failed:", response.error);
                toast.error('Payment failed: ' + response.error.description);
            });
            rzp.open();
        } catch (error) {
            console.error("Razorpay Initialization Error:", error);
            toast.error(`Initialization Error: ${error.message || "Please check console"}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="text-primary animate-spin" size={48} />
            </div>
        );
    }

    if (!selectedProduct) return null;

    const subtotal = selectedProduct.price / 1.18;
    const gst = selectedProduct.price - subtotal;

    return (
        <div className="min-h-screen bg-medical-bg py-24 px-4 text-white font-manrope selection:bg-primary/30">
            <div className="max-w-6xl mx-auto">
                <header className="mb-16 text-center space-y-4">
                    <Badge className="bg-primary/20 text-primary border-none mb-4 px-6 py-1 font-black italic tracking-widest">SECURE CHECKOUT</Badge>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins">
                        Fuel Your <span className="text-primary italic-display">Safety</span> Network.
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] italic max-w-xl mx-auto">One-time activation fee for lifetime medical data accessibility and smart emergency broadcasting.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="p-10 bg-medical-card border-white/5 rounded-[40px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                            <h3 className="text-[10px] font-black text-slate-500 uppercase italic tracking-[0.4em] mb-10">01. Select Your Gear Variant</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {products.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedProduct(p)}
                                        className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-40 group relative overflow-hidden ${selectedProduct.id === p.id
                                            ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(230,57,70,0.2)]'
                                            : 'border-white/5 bg-slate-950/50 text-slate-500 hover:border-white/10 hover:bg-slate-950'
                                            }`}
                                    >
                                        {p.best && (
                                            <div className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl italic">Popular</div>
                                        )}
                                        <p className="text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{p.title}</p>
                                        <div className="mt-auto">
                                            <p className={`text-2xl font-black italic ${selectedProduct.id === p.id ? 'text-white' : 'text-slate-600 group-hover:text-primary transition-colors'}`}>₹{p.price}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-0 overflow-hidden border border-white/5 bg-medical-card shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[40px] relative">
                            <div className="bg-slate-950/80 border-b border-white/5 p-8 flex items-center justify-between backdrop-blur-xl">
                                <div className="flex items-center gap-4 text-white">
                                    <div className="bg-primary/20 p-3 rounded-2xl text-primary border border-primary/20 shadow-lg shadow-primary/20">
                                        <Zap size={22} />
                                    </div>
                                    <div>
                                        <h2 className="font-black italic uppercase tracking-tighter text-2xl leading-none">Strategic Payment</h2>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic mt-1">Encrypted Transaction Hub</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <ShieldCheck className="text-green-500" size={16} />
                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Verified</span>
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                <div className="p-8 rounded-[30px] border-2 border-primary bg-primary/5 cursor-pointer relative group overflow-hidden transition-all hover:bg-primary/10">
                                    <div className="absolute top-0 right-0 p-3 bg-primary text-white text-[8px] font-black uppercase tracking-[0.3em] italic rounded-bl-2xl">Recommended Gateway</div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-8 h-8 rounded-full border-4 border-primary bg-slate-950 shadow-lg shadow-primary/30 flex items-center justify-center p-1">
                                            <div className="w-full h-full bg-primary rounded-full" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Razorpay Instant Dispatch</h3>
                                            <p className="text-[10px] text-slate-500 uppercase font-black italic tracking-widest mt-1">UPI • Cards • Netbanking • Wallets</p>
                                        </div>
                                        <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-8 h-8 grayscale invert brightness-200" />
                                    </div>
                                </div>

                                <Button className="w-full py-10 text-3xl font-black italic rounded-[30px] shadow-2xl shadow-primary/30 bg-primary text-white border-none group hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter" onClick={handlePayment}>
                                    INITIATE TRANSFER ₹{selectedProduct.price} <ChevronRight size={32} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                <div className="flex items-center justify-center gap-8 pt-4 opacity-30">
                                    <div className="flex items-center gap-3 text-[9px] font-black text-white uppercase tracking-[0.4em]">
                                        <Lock size={12} /> SSL Secured
                                    </div>
                                    <div className="flex items-center gap-3 text-[9px] font-black text-white uppercase tracking-[0.4em]">
                                        <ShieldCheck size={12} /> PCI DSS Compliant
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <Card className="bg-medical-card border-white/5 rounded-[40px] shadow-2xl p-10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                            <h3 className="text-[10px] font-black mb-10 text-slate-500 uppercase tracking-[0.4em] italic text-center">Payload Summary</h3>
                            <div className="space-y-8">
                                <div className="flex justify-between items-start pb-8 border-b border-white/5">
                                    <div className="space-y-2">
                                        <span className="font-black text-white uppercase italic text-2xl tracking-tighter leading-none">{selectedProduct.title}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">LIFETIME ACCESS GRANTED</span>
                                        </div>
                                    </div>
                                    <span className="font-black text-3xl italic text-white font-poppins">₹{selectedProduct.price}</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                        <span>Subtotal (Net)</span>
                                        <span className="text-slate-300">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                        <span>Taxation (18% GST)</span>
                                        <span className="text-slate-300">₹{gst.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Total Payable</span>
                                        <span className="text-4xl font-black italic text-primary font-poppins tracking-tighter shadow-primary/20 drop-shadow-lg">₹{selectedProduct.price}</span>
                                    </div>
                                </div>

                                <div className="mt-8 p-6 bg-slate-950 rounded-2xl border border-white/5 text-[10px] font-bold text-slate-500 italic leading-relaxed text-center">
                                    Digital activation occurs instantly upon successful transaction confirmation. Physical tracking logs will be updated within 12 hours.
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
