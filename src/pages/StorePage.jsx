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
        <div className="min-h-screen bg-medical-bg text-secondary font-manrope">
            {/* Store Header */}
            <div className="bg-white border-b border-secondary/5 pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <Badge className="bg-primary/10 text-primary border-none mb-6 px-4 py-1 font-black">RESQR PHYSICAL GEAR</Badge>
                    <h1 className="text-5xl md:text-7xl font-black text-secondary italic uppercase tracking-tighter font-poppins mb-6">
                        Wear Your Safety.
                    </h1>
                    <p className="max-w-2xl mx-auto text-secondary/60 text-xl leading-relaxed">
                        Order your physical RESQR tags today. Our smart cards, wristbands, and stickers bridge the gap between digital identity and physical survival.
                    </p>
                </div>
            </div>

            {/* Product Grid */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
                    {products.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-[40px] overflow-hidden border border-secondary/5 shadow-xl hover:shadow-2xl transition-all group lg:flex"
                        >
                            <div className="lg:w-1/2 relative bg-slate-100 overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-6 left-6">
                                    <Badge className="bg-white/90 backdrop-blur-md text-secondary border-none font-black px-4 py-1 shadow-lg">
                                        {product.tag}
                                    </Badge>
                                </div>
                            </div>
                            <div className="lg:w-1/2 p-10 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-3xl font-black text-secondary uppercase italic font-poppins mb-4 leading-tight">{product.name}</h3>
                                    <p className="text-secondary/60 text-sm leading-relaxed mb-6">{product.description}</p>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="text-4xl font-black text-primary italic font-poppins">₹{product.price}</div>
                                        <div className="text-lg text-secondary/30 line-through font-bold">₹{product.originalPrice}</div>
                                        <Badge className="bg-green-100 text-green-700 border-none font-black">50% OFF</Badge>
                                    </div>

                                    <ul className="space-y-3 mb-10">
                                        {product.features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-2 text-sm font-bold text-secondary/70">
                                                <Zap size={14} className="text-primary" /> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    onClick={handleAddToCart}
                                    className="w-full py-6 rounded-2xl font-black text-lg italic shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                                >
                                    <ShoppingCart size={22} /> BUY NOW <ArrowRight size={22} />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Shopping Benefits */}
            <section className="py-24 bg-secondary text-white border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-primary">
                            <Truck size={32} />
                        </div>
                        <h4 className="font-black uppercase italic tracking-wider mb-2">Fast Delivery</h4>
                        <p className="text-white/40 text-xs font-bold px-8 uppercase tracking-widest leading-relaxed">Pan-India shipping within 3-5 days.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-blue-400">
                            <RefreshCw size={32} />
                        </div>
                        <h4 className="font-black uppercase italic tracking-wider mb-2">Easy Returns</h4>
                        <p className="text-white/40 text-xs font-bold px-8 uppercase tracking-widest leading-relaxed">No-questions-asked 7-day return policy.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-green-400">
                            <CreditCard size={32} />
                        </div>
                        <h4 className="font-black uppercase italic tracking-wider mb-2">Secure Payment</h4>
                        <p className="text-white/40 text-xs font-bold px-8 uppercase tracking-widest leading-relaxed">Razorpay encrypted checkout gateway.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-amber-400">
                            <ShieldCheck size={32} />
                        </div>
                        <h4 className="font-black uppercase italic tracking-wider mb-2">Build Quality</h4>
                        <p className="text-white/40 text-xs font-bold px-8 uppercase tracking-widest leading-relaxed">Premium long-lasting materials used.</p>
                    </div>
                </div>
            </section>

            {/* Final Call to Action */}
            <section className="py-32 px-4 text-center">
                <div className="max-w-4xl mx-auto bg-white p-20 rounded-[60px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 text-secondary">
                        <ShoppingCart size={200} />
                    </div>
                    <h2 className="text-5xl font-black text-secondary italic uppercase tracking-tighter font-poppins mb-6">
                        Bundle & Save.
                    </h2>
                    <p className="text-secondary/60 text-lg mb-10 max-w-xl mx-auto font-medium">
                        Get our "Complete Safety Kit" including a Smart Card, Wristband, and Sticker Pack for just ₹899 instead of ₹1047.
                    </p>
                    <Button size="lg" className="px-12 py-5 rounded-full font-black text-xl shadow-2xl shadow-primary/30">
                        GET THE STARTER KIT
                    </Button>
                </div>
            </section>

            {/* Footer Placeholder for visual consistency */}
            <footer className="py-20 text-center opacity-30">
                <img src="/logo.png" alt="RESQR" className="h-10 mx-auto mb-6 grayscale" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Official RESQR Merch Store • Secured by SSL</p>
            </footer>
        </div>
    );
}
