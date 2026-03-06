import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ShieldCheck, Zap, ArrowRight, Truck, CreditCard, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const products = [
    {
        id: 'smart-card',
        name: 'RESQR Smart ID Card',
        description: 'Durable PVC card with High-Definition QR and NFC chip embedded. Fits perfectly in any wallet.',
        price: 499,
        originalPrice: 999,
        image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=800&auto=format&fit=crop',
        tag: 'Best Seller',
        features: ['Premium PVC Material', 'Embedded NFC Chip', 'UV Protected QR', 'Lifetime Warranty']
    },
    {
        id: 'silicone-wristband',
        name: 'Medical Grade Wristband',
        description: 'Sleek, waterproof silicone wristband with laser-engraved QR for sports and daily wear.',
        price: 349,
        originalPrice: 699,
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=800&auto=format&fit=crop',
        tag: 'Rugged',
        features: ['Hypoallergenic Silicone', 'Laser Engraved', '100% Waterproof', 'Multiple Sizes']
    },
    {
        id: 'sticker-pack',
        name: 'Emergency Sticker Pack (5pcs)',
        description: 'Weatherproof vinyl stickers for helmets, smartphones, and vehicles. High-visibility design.',
        price: 199,
        originalPrice: 399,
        image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=800&auto=format&fit=crop',
        tag: 'Value Pack',
        features: ['3M Vinyl Base', 'Reflective Coating', 'Scratch Resistant', 'Strong Adhesive']
    },
    {
        id: 'metal-tag',
        name: 'Titanium Medical Tag',
        description: 'Unbreakable laser-etched titanium tag for keys or necklaces. The ultimate emergency companion.',
        price: 799,
        originalPrice: 1499,
        image: 'https://images.unsplash.com/photo-1619121822248-03863a8421bb?q=80&w=800&auto=format&fit=crop',
        tag: 'Elite',
        features: ['Grade A Titanium', 'Lifetime Shine', 'Necklace Chain Included', 'Fire Resistant']
    }
];

export default function StorePage() {
    const [cartCount, setCartCount] = useState(0);

    const handleAddToCart = () => {
        setCartCount(prev => prev + 1);
        // Toast logic would go here
    };

    return (
        <div className="min-h-screen bg-medical-bg text-white font-manrope">
            {/* Store Header */}
            <div className="bg-slate-950/40 border-b border-white/5 pt-32 pb-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <Badge className="bg-primary/20 text-primary border-none mb-8 px-6 py-1 font-black italic tracking-widest">RESQR PHYSICAL GEAR</Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter font-poppins mb-8 leading-none">
                        Wear Your <span className="text-primary italic-display">Safety.</span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-slate-400 text-xl leading-relaxed font-medium">
                        Order your physical RESQR tags today. Our smart cards, wristbands, and stickers bridge the gap between digital identity and physical survival.
                    </p>
                </div>
            </div>

            {/* Product Grid */}
            <section className="py-24 px-4 bg-medical-bg">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                    {products.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-medical-card rounded-[50px] overflow-hidden border border-white/5 shadow-2xl hover:shadow-black/50 transition-all group lg:flex hover:-translate-y-2"
                        >
                            <div className="lg:w-1/2 relative bg-slate-900 overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute top-8 left-8">
                                    <Badge className="bg-slate-900/80 backdrop-blur-md text-white border border-white/10 font-black px-5 py-2 shadow-2xl uppercase tracking-widest text-[10px] italic">
                                        {product.tag}
                                    </Badge>
                                </div>
                            </div>
                            <div className="lg:w-1/2 p-12 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase italic font-poppins mb-6 leading-tight tracking-tight">{product.name}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium italic">"{product.description}"</p>

                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="text-5xl font-black text-white italic font-poppins tracking-tighter">₹{product.price}</div>
                                        <div className="text-xl text-slate-600 line-through font-bold">₹{product.originalPrice}</div>
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] uppercase tracking-widest h-fit py-1">50% OFF</Badge>
                                    </div>

                                    <ul className="space-y-4 mb-12">
                                        {product.features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-tight">
                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Zap size={12} /></div> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    onClick={handleAddToCart}
                                    className="w-full py-8 rounded-2xl font-black text-xl italic shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 bg-primary text-white border-none transition-transform active:scale-95 uppercase tracking-tighter"
                                >
                                    <ShoppingCart size={24} /> BUY NOW <ArrowRight size={24} />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Shopping Benefits */}
            <section className="py-24 bg-slate-950 text-white border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16 text-center">
                    <div className="flex flex-col items-center group">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 text-primary border border-white/5 group-hover:bg-primary/10 transition-colors">
                            <Truck size={36} />
                        </div>
                        <h4 className="font-black uppercase italic tracking-widest mb-3">Fast Delivery</h4>
                        <p className="text-slate-500 text-[10px] font-black px-8 uppercase tracking-[0.2em] leading-relaxed">Pan-India shipping <br /> within 3-5 days.</p>
                    </div>
                    <div className="flex flex-col items-center group">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 text-blue-400 border border-white/5 group-hover:bg-blue-500/10 transition-colors">
                            <RefreshCw size={36} />
                        </div>
                        <h4 className="font-black uppercase italic tracking-widest mb-3">Easy Returns</h4>
                        <p className="text-slate-500 text-[10px] font-black px-8 uppercase tracking-[0.2em] leading-relaxed">No-questions-asked <br /> 7-day return policy.</p>
                    </div>
                    <div className="flex flex-col items-center group">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 text-emerald-400 border border-white/5 group-hover:bg-emerald-500/10 transition-colors">
                            <CreditCard size={36} />
                        </div>
                        <h4 className="font-black uppercase italic tracking-widest mb-3">Secure Payment</h4>
                        <p className="text-slate-500 text-[10px] font-black px-8 uppercase tracking-[0.2em] leading-relaxed">Razorpay encrypted <br /> checkout gateway.</p>
                    </div>
                    <div className="flex flex-col items-center group">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 text-amber-400 border border-white/5 group-hover:bg-amber-500/10 transition-colors">
                            <ShieldCheck size={36} />
                        </div>
                        <h4 className="font-black uppercase italic tracking-widest mb-3">Build Quality</h4>
                        <p className="text-slate-500 text-[10px] font-black px-8 uppercase tracking-[0.2em] leading-relaxed">Premium long-lasting <br /> materials used.</p>
                    </div>
                </div>
            </section>

            {/* Final Call to Action */}
            <section className="py-32 px-4 text-center bg-medical-bg relative overflow-hidden">
                <div className="max-w-5xl mx-auto bg-medical-card p-20 rounded-[80px] shadow-2xl relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 p-16 opacity-[0.03] rotate-12 text-white pointer-events-none">
                        <ShoppingCart size={300} />
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-none px-6 py-1 font-black italic tracking-widest mb-8">EXCLUSIVE BUNDLE</Badge>
                    <h2 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter font-poppins mb-10 leading-none">
                        Bundle & <span className="text-primary italic-display">Save.</span>
                    </h2>
                    <p className="text-slate-400 text-2xl mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
                        Get our "Complete Safety Kit" including a Smart Card, Wristband, and Sticker Pack for just <span className="text-white font-black italic underline decoration-primary underline-offset-8">₹899</span> instead of ₹1047.
                    </p>
                    <Button size="lg" className="px-16 py-10 rounded-full font-black text-3xl italic shadow-2xl shadow-primary/30 uppercase tracking-tighter bg-primary text-white border-none active:scale-95 transition-all">
                        GET THE STARTER KIT
                    </Button>
                </div>
            </section>

            {/* Footer Placeholder for visual consistency */}
            <footer className="py-24 text-center opacity-20">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR" className="h-10 mx-auto mb-6 invert brightness-200" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Official RESQR Merch Store • Secured by SSL</p>
            </footer>
        </div>
    );
}
