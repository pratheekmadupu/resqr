import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Printer, Share2, CheckCircle2, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SuccessPage() {
    const qrRef = useRef();

    const handleDownload = () => {
        const canvas = qrRef.current.querySelector('canvas');
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = 'RESQR_Emergency_Tag.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code downloaded!');
    };

    const handlePrint = () => {
        window.print();
    };

    const getQRValue = () => {
        const slug = localStorage.getItem('resqr_active_slug');
        if (!slug) return `${window.location.origin}/e/demo`;
        return `${window.location.origin}/e/${slug}`;
    };

    return (
        <div className="min-h-screen bg-slate-950 py-20 px-4 text-white">
            <div className="max-w-3xl mx-auto text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mb-4"
                >
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR Logo" style={{ height: '48px', width: 'auto' }} className="mx-auto" />
                </motion.div>

                <p className="text-xl font-bold text-primary mb-12 uppercase tracking-widest">Emergency QR</p>

                <Card className="max-w-sm mx-auto p-12 mb-12 shadow-2xl border-4 border-slate-900 overflow-hidden relative group bg-slate-900">
                    <div className="absolute top-0 left-0 w-full h-3 bg-primary"></div>

                    <div ref={qrRef} className="bg-white p-4 rounded-xl border border-slate-700 inline-block mb-8 transition-transform group-hover:scale-105">
                        <QRCodeCanvas
                            value={getQRValue()}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
                    </div>

                    <div className="text-left space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-slate-800">
                            <span className="text-xs font-bold text-white uppercase">Profile Status</span>
                            <span className="text-xs font-bold text-green-500 bg-green-950/30 px-2 py-0.5 rounded-full">ACTIVE</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-800">
                            <span className="text-xs font-bold text-white uppercase">Tag ID</span>
                            <span className="text-sm font-bold text-white">#RQ-88219</span>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto mb-12">
                    <Button variant="outline" className="w-full" onClick={handleDownload}>
                        <Download size={18} /> Download
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handlePrint}>
                        <Printer size={18} /> Print Card
                    </Button>
                    <Button variant="ghost" className="col-span-1 sm:col-span-2 text-slate-400" onClick={() => toast.success('Link copied!')}>
                        <Share2 size={18} /> Share Profile Link
                    </Button>
                </div>

                <div className="border-t border-slate-800 pt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="secondary" size="lg">
                            Go to Dashboard <LayoutDashboard size={20} />
                        </Button>
                    </Link>
                    <Link to={getQRValue()}>
                        <Button variant="ghost" size="lg">
                            View Public Page <ChevronRight size={20} />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
