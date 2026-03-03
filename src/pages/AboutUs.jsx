import { motion } from 'framer-motion';
import { Shield, Smartphone, Heart, Activity, CheckCircle2, QrCode } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden border-b border-slate-900">
                <div className="absolute top-0 right-0 p-24 opacity-5 rotate-12">
                    <Shield size={400} />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6 max-w-3xl mx-auto"
                    >
                        <Badge variant="primary" className="px-6 py-2 uppercase tracking-[0.3em] italic font-black">
                            WHO WE ARE
                        </Badge>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                            Your <span className="text-primary">Digital</span> Health Guardian
                        </h1>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed italic">
                            RESQR is the next-gen emergency identification system,
                            designed to bridge the gap between responders and critical medical data when every second counts.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Benefit 1: Real-time Data */}
            <section className="py-24 border-b border-slate-900">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="order-2 lg:order-1"
                        >
                            <img
                                src={`${import.meta.env.BASE_URL}about_scan.png`}
                                alt="Emergency Scan in Action"
                                className="rounded-[40px] shadow-2xl border-4 border-slate-900 hover:scale-[1.02] transition-transform duration-700"
                            />
                        </motion.div>

                        <div className="space-y-8 order-1 lg:order-2">
                            <div className="space-y-4">
                                <Badge variant="outline" className="text-primary border-primary font-black italic">FEATURE 01</Badge>
                                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Zero-Delay Scans</h2>
                                <p className="text-lg text-slate-400 font-medium leading-relaxed italic">
                                    In an emergency, paramedics don't have time to search for paperwork.
                                    A simple scan of a RESQR tag reveals your **Blood Group**, **Allergies**,
                                    and **Chronic Conditions** instantly on their phone.
                                </p>
                            </div>

                            <ul className="space-y-4 font-bold text-slate-300">
                                {[
                                    'Universal Compatibility - Works on any smartphone',
                                    'Offline Access - Basic info available instantly',
                                    'Encrypted Storage - Only vital info shown to public'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="text-primary" size={20} /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefit 2: Data Control */}
            <section className="py-24 bg-slate-900/30 border-b border-slate-900">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Badge variant="outline" className="text-primary border-primary font-black italic">FEATURE 02</Badge>
                                <h2 className="text-5xl font-black italic uppercase tracking-tighter text-right">Centralized Records</h2>
                                <p className="text-lg text-slate-400 font-medium leading-relaxed italic text-right">
                                    Manage your medical history, primary physician details, and emergency contacts
                                    from a single, secure digital dashboard. Change your info once, and it updates
                                    globaly on your live QR tag.
                                </p>
                            </div>

                            <div className="flex justify-end gap-10">
                                <div className="text-center">
                                    <div className="text-4xl font-black text-white">100%</div>
                                    <div className="text-[10px] uppercase font-black tracking-widest text-primary">Private</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-black text-white">24/7</div>
                                    <div className="text-[10px] uppercase font-black tracking-widest text-primary">Uptime</div>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                        >
                            <img
                                src={`${import.meta.env.BASE_URL}about_data.png`}
                                alt="Security Dashboard"
                                className="rounded-[40px] shadow-2xl border-4 border-slate-900 hover:rotate-2 transition-transform duration-700"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-center text-4xl font-black italic uppercase tracking-tighter mb-16">
                        Why Choose <span className="text-primary italic-display">RESQR?</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Smartphone size={40} />,
                                title: "GPS Tracking",
                                desc: "Auto-broadcasts your GPS coordinates to family the moment your tag is scanned by an emergency worker."
                            },
                            {
                                icon: <Heart size={40} />,
                                title: "Vital Integrity",
                                desc: "Securely store life-saving data like Blood Type, Organ Donor status, and crucial drug allergies."
                            },
                            {
                                icon: <Activity size={40} />,
                                title: "Universal Sync",
                                desc: "Your RESQR profile works across all platforms, from NFC chips to QR printed stickers."
                            }
                        ].map((box, i) => (
                            <Card key={i} className="bg-slate-900/50 border-slate-800 p-10 hover:border-primary/50 transition-all group">
                                <div className="p-4 bg-slate-950 rounded-2xl w-fit mb-6 text-primary group-hover:scale-110 transition-transform">
                                    {box.icon}
                                </div>
                                <h3 className="text-2xl font-bold uppercase italic italic-display mb-4">{box.title}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed italic">{box.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 relative overflow-hidden bg-primary/10">
                <div className="max-w-3xl mx-auto text-center space-y-8 px-4">
                    <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">
                        Don't leave your <span className="text-primary">Safety</span> to chance.
                    </h2>
                    <p className="text-slate-400 text-xl italic font-bold">
                        Join thousands of users who have secured their peace of mind with the smartest medical ID on the market.
                    </p>
                    <div className="pt-8">
                        <Button className="px-12 py-8 italic font-black text-2xl shadow-2xl shadow-primary/40">
                            SECURE YOUR TAG NOW <QrCode className="ml-2" />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
