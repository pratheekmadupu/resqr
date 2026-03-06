import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Printer, Share2, CheckCircle2, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SuccessPage() {
    const qrRef = useRef();

    const handleDownload = () => {
        const canvas = document.getElementById('success-qr-canvas') || qrRef.current.querySelector('canvas');
        if (!canvas) {
            toast.error('QR not ready');
            return;
        }
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `RESQR_TAG_${getUserName().replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR TAG Downloaded!');
    };

    const handlePrint = () => {
        window.print();
    };

    const getQRValue = () => {
        const slug = localStorage.getItem('resqr_active_slug');
        if (!slug) return `${window.location.origin}/e/demo`;
        return `${window.location.origin}/e/${slug}`;
    };

    const getUserName = () => {
        const slug = localStorage.getItem('resqr_active_slug');
        if (!slug) return "Valued User";
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="min-h-screen bg-medical-bg py-24 px-4 text-white font-manrope selection:bg-primary/30">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="mb-8"
                >
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-[0_0_50px_rgba(230,57,70,0.3)]">
                        <CheckCircle2 className="text-primary" size={48} />
                    </div>
                    <Badge className="bg-primary/20 text-primary border-none mb-6 px-6 py-1 font-black italic tracking-[0.3em]">PROTECTION ACTIVATED</Badge>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins">
                        You Are Now <span className="text-primary italic-display">Covered.</span>
                    </h1>
                </motion.div>

                <p className="text-slate-500 font-bold text-sm italic mb-16 uppercase tracking-widest max-w-xl mx-auto">
                    Your encrypted medical profile is live. In an emergency, first responders can now access your critical data in seconds.
                </p>

                <Card className="max-w-sm mx-auto p-12 mb-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border-white/5 overflow-hidden relative group bg-medical-card rounded-[50px]">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

                    <div ref={qrRef} className="bg-white p-6 rounded-[32px] border-8 border-slate-950 inline-block mb-10 transition-all group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        <QRCodeCanvas
                            id="success-qr-canvas"
                            value={getQRValue()}
                            size={220}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                                src: `${import.meta.env.BASE_URL}resqr_icon.png`,
                                x: undefined,
                                y: undefined,
                                height: 45,
                                width: 45,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="text-left space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-500 italic">Vault Status</span>
                            <span className="text-green-500 flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Secured
                            </span>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-500 italic">Identity</span>
                            <span className="text-white italic tracking-tighter truncate ml-4 text-sm">{getUserName()}</span>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto mb-16">
                    <Button className="w-full py-8 text-xl font-black italic rounded-[24px] shadow-2xl shadow-primary/20 bg-primary text-white border-none group hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter" onClick={handleDownload}>
                        <Download size={22} className="mr-2" /> DISPATCH TAG
                    </Button>
                    <Button variant="outline" className="w-full h-20 rounded-[24px] border-white/10 text-slate-300 font-black italic uppercase tracking-widest text-[11px] hover:bg-white/5" onClick={handlePrint}>
                        <Printer size={18} className="mr-2" /> Print Physical Card
                    </Button>
                    <Button variant="ghost" className="col-span-1 sm:col-span-2 text-slate-500 font-black italic uppercase tracking-[0.3em] text-[10px] h-12" onClick={() => {
                        navigator.clipboard.writeText(getQRValue());
                        toast.success('Broadcast Link Copied!');
                    }}>
                        <Share2 size={16} className="mr-2" /> Share Profile Link
                    </Button>
                </div>

                <div className="border-t border-white/5 pt-16 flex flex-col sm:flex-row items-center justify-center gap-8">
                    <Link to="/dashboard" className="w-full sm:w-auto">
                        <Button variant="secondary" className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-white/5 text-white border border-white/10 font-black italic uppercase tracking-widest text-[11px] hover:bg-white/10">
                            GO TO COMMAND HUB <LayoutDashboard size={18} className="ml-3 text-primary" />
                        </Button>
                    </Link>
                    <Link to={getQRValue()} className="w-full sm:w-auto">
                        <Button variant="ghost" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-slate-500 font-black italic uppercase tracking-widest text-[11px] hover:text-white">
                            PREVIEW PUBLIC VAULT <ChevronRight size={18} className="ml-2" />
                        </Button>
                    </Link>
                </div>

                <footer className="mt-24 opacity-20">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR" className="h-10 mx-auto mb-6 invert grayscale" />
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white">
                        Powered by Guardian Blockchain • End-to-End Safety Infrastructure
                    </p>
                </footer>
            </div>
        </div>
    );
}
