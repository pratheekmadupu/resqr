import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Lock, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
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
        { id: 'keychain', title: 'Key Chain', price: 199, best: false }
    ];

    useEffect(() => {
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
            unsub();
            clearTimeout(timer);
        };
    }, []);

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
            key: "rzp_test_SLGOWC1cclhN5N", // Provided Key ID
            amount: selectedProduct.price * 100, // Amount in paise
            currency: "INR",
            name: "RESQR",
            description: `Payment for ${selectedProduct.title}`,
            image: `${import.meta.env.BASE_URL}logo.png`,
            handler: function (response) {
                // In a production app, you would verify this payment on your backend
                // with the provide Key Secret: jvT42j5JAg3lmqEeoWVM8bXl
                toast.success('Payment successful!');
                navigate('/success');
            },
            prefill: {
                name: "",
                email: "",
                contact: ""
            },
            notes: {
                address: "RESQR Corporate Office"
            },
            theme: {
                color: "#e11d48" // matches primary red
            }
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error('Payment failed: ' + response.error.description);
            });
            rzp.open();
        } catch (error) {
            console.error("Razorpay error:", error);
            toast.error("Failed to initialize payment. Please try again.");
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
        <div className="min-h-screen bg-slate-950 py-10 px-4 text-white">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter">Complete Your Protection</h1>
                    <p className="text-white opacity-60 max-w-lg mx-auto">One-time payment for your selected safety gear. Lifetime validity included.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-8 bg-slate-900 border-slate-800">
                            <h3 className="font-black text-white uppercase italic tracking-widest text-sm mb-6 opacity-60">1. Select Physical Product</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {products.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedProduct(p)}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-32 ${selectedProduct.id === p.id
                                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5'
                                            : 'border-slate-800 bg-slate-950 text-white opacity-40 hover:opacity-100 hover:border-slate-700'
                                            }`}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-widest">{p.title}</p>
                                        <p className="text-2xl font-black italic">₹{p.price}</p>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-0 overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                            <div className="bg-slate-950 border-b border-slate-800 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-white">
                                    <div className="bg-primary/20 p-2 rounded-xl text-primary border border-primary/20">
                                        <Zap size={20} />
                                    </div>
                                    <h2 className="font-black italic uppercase tracking-tighter text-xl">Secure Checkout</h2>
                                </div>
                                <ShieldCheck className="text-primary" size={24} />
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="p-6 rounded-2xl border-2 border-primary bg-primary/5 cursor-pointer relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest">Recommended</div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full border-4 border-primary bg-slate-950 shadow-lg shadow-primary/20"></div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-white italic">Pay with Razorpay</h3>
                                            <p className="text-xs text-white opacity-40 uppercase font-bold">Cards, UPI, Netbanking, Wallets</p>
                                        </div>
                                        <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-6 h-6 grayscale invert" />
                                    </div>
                                </div>

                                <Button className="w-full py-8 text-2xl font-black italic shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform" onClick={handlePayment}>
                                    Pay ₹{selectedProduct.price} <ChevronRight size={24} />
                                </Button>

                                <div className="flex items-center justify-center gap-6 pt-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-white opacity-30 uppercase tracking-[0.2em]">
                                        <Lock size={14} /> 256-bit AES Encryption
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="sticky top-24 bg-slate-900 border-slate-800">
                            <h3 className="text-sm font-black mb-8 text-white uppercase tracking-[0.3em] opacity-40 text-center">Order Summary</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-6 border-b border-slate-800">
                                    <div className="flex flex-col">
                                        <span className="font-black text-white uppercase italic text-lg">{selectedProduct.title}</span>
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">LIFETIME VALIDITY</span>
                                    </div>
                                    <span className="font-black text-2xl italic text-white font-mono">₹{selectedProduct.price}</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold text-white opacity-40 uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-white opacity-40 uppercase tracking-widest">
                                        <span>GST (18%)</span>
                                        <span className="font-mono">₹{gst.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-white uppercase tracking-widest">Total Payable</span>
                                        <span className="text-3xl font-black italic text-primary font-mono">₹{selectedProduct.price}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
