import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export default function ContactUs() {
    return (
        <div className="min-h-screen bg-medical-bg py-32 px-4 text-white font-manrope">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Badge className="bg-primary/20 text-primary border-none px-6 py-1 font-black uppercase tracking-widest italic">SUPPORT HUB</Badge>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none font-poppins">
                            How Can We <span className="text-primary italic-display">Help?</span>
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium">
                            Our team is standing by to ensure your safety network remains unbreakable. Contact us for technical support or partnerships.
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <Card className="p-10 bg-medical-card border-white/5 shadow-2xl rounded-[40px]">
                            <div className="space-y-10">
                                <div className="flex items-start gap-6">
                                    <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-lg shadow-primary/5">
                                        <Mail size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-2">Email Channels</h3>
                                        <p className="font-bold text-lg text-white">support@resqr.co.in</p>
                                        <p className="font-bold text-lg text-white">partners@resqr.co.in</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className="p-4 bg-white/5 rounded-2xl text-slate-300 shadow-lg shadow-black/5">
                                        <Phone size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-2">Voice Support</h3>
                                        <p className="font-bold text-lg text-white">+91 (800) RESQR-ID</p>
                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-2 bg-primary/10 px-3 py-1 rounded-full w-fit italic">24/7 EMERGENCY LINE</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 shadow-lg shadow-blue-500/5">
                                        <MapPin size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-2">Physical HQ</h3>
                                        <p className="font-bold text-lg text-white">Corporate Hub, Level 4</p>
                                        <p className="text-slate-400 font-medium">Bangalore, IN 560001</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-10 bg-slate-950 text-white rounded-[40px] shadow-2xl relative overflow-hidden border border-white/5">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <MessageSquare size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-black italic uppercase tracking-tighter text-2xl mb-4">Instant Chat.</h3>
                                <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                                    Prefer WhatsApp? Our specialists are active for quick profile setup and store inquiries.
                                </p>
                                <Button className="w-full py-6 rounded-2xl font-black italic bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-xl shadow-emerald-500/20 uppercase tracking-widest">
                                    CHAT ON WHATSAPP <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-10 md:p-16 bg-medical-card border-white/5 shadow-2xl rounded-[60px] relative">
                            <form className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Guardian Name</label>
                                        <input className="w-full bg-slate-950/50 border border-white/5 rounded-3xl p-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-600 text-white" placeholder="Full name" required />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Secure Email</label>
                                        <input className="w-full bg-slate-950/50 border border-white/5 rounded-3xl p-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-600 text-white" type="email" placeholder="email@example.com" required />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Inquiry Subject</label>
                                    <input className="w-full bg-slate-950/50 border border-white/5 rounded-3xl p-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-600 text-white" placeholder="How can we assist you?" required />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Detailed Message</label>
                                    <textarea
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-[40px] p-8 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none h-48 transition-all placeholder:text-slate-600 resize-none text-white"
                                        placeholder="Type your message here..."
                                        required
                                    ></textarea>
                                </div>
                                <Button className="w-full py-10 text-2xl font-black italic rounded-full gap-4 hover:scale-[1.01] transition-all shadow-2xl shadow-primary/30 bg-primary text-white border-none uppercase tracking-tighter">
                                    <Send size={28} /> SECURE SEND
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>

            <footer className="mt-32 text-center opacity-20">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR" className="h-10 mx-auto mb-6 invert brightness-200" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Secure Communication Channel • PGP Encrypted</p>
            </footer>
        </div>
    );
}
