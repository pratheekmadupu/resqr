import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, RefreshCcw, Truck, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function LegalPage() {
    const [activeTab, setActiveTab] = useState('privacy');

    const tabs = [
        { id: 'privacy', label: 'Privacy Policy', icon: <Shield size={18} /> },
        { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={18} /> },
        { id: 'refunds', label: 'Refund & Cancellation', icon: <RefreshCcw size={18} /> },
        { id: 'shipping', label: 'Shipping & Delivery', icon: <Truck size={18} /> },
    ];

    const content = {
        privacy: (
            <div className="space-y-6">
                <h2 className="text-3xl font-black italic text-primary underline decoration-primary decoration-4 underline-offset-8 uppercase tracking-tighter mb-8">Privacy Policy</h2>
                <div className="space-y-4 text-white opacity-70 leading-relaxed text-sm">
                    <p className="font-bold text-white opacity-100 italic">Effective Date: March 1, 2026</p>
                    <p>At **RESQR** (resqr.co.in), we prioritize your safety and the privacy of your sensitive medical data. This policy outlines how we handle your personal information.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">1. Information Collection</h3>
                    <p>We collect medical details, emergency contacts, and personal identifiers provided by you to create your RESQR profile. This information is only accessed when your QR tag is explicitly scanned.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">2. Data Security</h3>
                    <p>Your profiles are stored using industry-standard **256-bit AES encryption**. We do not sell or trade your personal medical history with third-party advertising networks.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">3. User Control</h3>
                    <p>You have full control over your data. You can edit or deactivate your profile at any time through our secure dashboard.</p>
                </div>
            </div>
        ),
        terms: (
            <div className="space-y-6">
                <h2 className="text-3xl font-black italic text-primary underline decoration-primary decoration-4 underline-offset-8 uppercase tracking-tighter mb-8">Terms & Conditions</h2>
                <div className="space-y-4 text-white opacity-70 leading-relaxed text-sm">
                    <p className="font-bold text-white opacity-100 italic">Version 1.2 — February 2026</p>
                    <p>By using RESQR, you agree to the following terms governing our safety services.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">1. Professional Disclaimer</h3>
                    <p>RESQR is an information-sharing platform. We are NOT a medical emergency service. While we provide instant access to data for first responders, we cannot guarantee the specific actions taken by medical personnel upon scanning your tag.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">2. Accuracy of Information</h3>
                    <p>The user is solely responsible for the accuracy of the medical information and contacts stored in their profile. We recommend regular updates to ensure safety.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">3. Profile Ownership</h3>
                    <p>The digital profile remains active for the lifetime of the service, subject to a one-time activation fee. Physical tags remain your property once delivered.</p>
                </div>
            </div>
        ),
        refunds: (
            <div className="space-y-6">
                <h2 className="text-3xl font-black italic text-primary underline decoration-primary decoration-4 underline-offset-8 uppercase tracking-tighter mb-8">Refund & Cancellation</h2>
                <div className="space-y-4 text-white opacity-70 leading-relaxed text-sm">
                    <p>We strive for complete satisfaction with our safety products.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">1. Cancellation</h3>
                    <p>Digital QR services can be cancelled within 24 hours for a full refund if the profile has not been activated. Physical product orders can be cancelled before they enter the shipping stage.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">2. Refunds</h3>
                    <p>Refunds are processed within 5-7 business days to the original payment source. Due to the personalized nature of QR tags, physical products are only eligible for refund if received in a damaged condition.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">3. Damaged Products</h3>
                    <p>If you receive a defective QR band or bracelet, contact support@resqr.co.in within 48 hours for a free replacement.</p>
                </div>
            </div>
        ),
        shipping: (
            <div className="space-y-6">
                <h2 className="text-3xl font-black italic text-primary underline decoration-primary decoration-4 underline-offset-8 uppercase tracking-tighter mb-8">Shipping & Delivery</h2>
                <div className="space-y-4 text-white opacity-70 leading-relaxed text-sm">
                    <p>We deliver safety across India and internationally.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">1. Processing Time</h3>
                    <p>All physical products are dispatched within 2 business days of order confirmation. Custom engravings may take an additional 24 hours.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">2. Shipping Duration</h3>
                    <p>Domestic shipping (India): 3-5 business days. Remote areas may take up to 7 business days.</p>
                    <h3 className="text-lg font-black text-white italic underline decoration-primary/30 decoration-2 underline-offset-4 uppercase tracking-widest mt-6">3. Delivery Partners</h3>
                    <p>We work with BlueDart, Delhivery, and India Post to ensure secure and trackable delivery of your RESQR tags.</p>
                </div>
            </div>
        ),
    };

    return (
        <div className="min-h-screen bg-medical-bg py-24 px-4 text-white font-manrope">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-16">
                    <Badge className="bg-primary/20 text-primary border-none px-6 py-1 font-black italic tracking-widest mb-6">TRANSPARENCY HUB</Badge>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none font-poppins mb-6">
                        Legal & <span className="text-primary italic-display">Compliance</span>
                    </h1>
                </header>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Navigation Sidebar */}
                    <aside className="lg:w-80 space-y-3">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-6 py-5 rounded-[20px] transition-all font-black italic uppercase tracking-[0.1em] text-[11px] ${activeTab === tab.id
                                    ? 'bg-medical-card border-2 border-primary text-white shadow-2xl shadow-primary/10'
                                    : 'bg-medical-card/40 border-2 border-white/5 text-slate-500 hover:text-white hover:border-white/10'
                                    }`}
                            >
                                <span className="flex items-center gap-4">
                                    <div className={`${activeTab === tab.id ? 'text-primary' : 'text-slate-600'}`}>
                                        {tab.icon}
                                    </div>
                                    {tab.label}
                                </span>
                                <ChevronRight size={16} className={activeTab === tab.id ? 'text-primary translate-x-1' : 'opacity-0'} />
                            </button>
                        ))}

                        <div className="mt-12 p-8 bg-slate-950 rounded-[30px] border border-white/5 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                <Shield size={120} />
                            </div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 italic">Security Badge</h4>
                            <p className="text-slate-500 text-xs font-bold leading-relaxed">
                                All legal documents are digitally signed and timestamped for chain of custody protection.
                            </p>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1">
                        <Card className="p-10 md:p-16 bg-medical-card border-white/5 shadow-2xl rounded-[40px] relative overflow-hidden h-full min-h-[600px]">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    {content[activeTab]}
                                </motion.div>
                            </AnimatePresence>
                        </Card>
                    </main>
                </div>
            </div>
        </div>
    );
}
