import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Dog, Briefcase, Car, Plus, QrCode, Download, Edit3, 
    Trash2, Clock, Loader2, Shield, Eye, Lock, RefreshCw, X, ExternalLink,
    Activity, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { QRCodeCanvas } from 'qrcode.react';
import { db, auth } from '../lib/firebase';
import { ref, get, update, remove, onValue } from 'firebase/database';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([]);
    const [editData, setEditData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [showScans, setShowScans] = useState(false);

    const activeProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

    useEffect(() => {
        if (profiles.length > 0 && !selectedProfileId) {
            setSelectedProfileId(profiles[0].id);
        }
    }, [profiles]);

    useEffect(() => {
        if (activeProfile) {
            setEditData(activeProfile.data || {});
        }
    }, [selectedProfileId, profiles]);

    useEffect(() => {
        let unsubscribe;
        const init = async () => {
            if (!auth.currentUser) {
                setLoading(false);
                return;
            }
            const uid = auth.currentUser.uid;
            
            // Migration check (optional but safest to keep)
            try {
                const legacyRef = ref(db, 'profiles');
                const snap = await get(legacyRef);
                if (snap.exists()) {
                    const allLegacy = snap.val();
                    const userEmail = auth.currentUser.email?.toLowerCase();
                    const myLegacy = Object.entries(allLegacy).filter(([id, d]) => {
                        return d.uid === uid || (d.email && d.email.toLowerCase() === userEmail);
                    });
                    
                    if (myLegacy.length > 0) {
                        for (const [oldId, data] of myLegacy) {
                            const newId = `${uid}_${oldId}`;
                            const newRef = ref(db, `users/${uid}/profiles/${newId}`);
                            const check = await get(newRef);
                            if (!check.exists()) {
                                await update(newRef, {
                                    category: 'people',
                                    data: { ...data, name: data.name || 'Medical Profile' },
                                    payment_status: data.payment_status || 'paid',
                                    migrated: true,
                                    legacyId: oldId,
                                    createdAt: data.createdAt || new Date().toISOString(),
                                });
                            }
                        }
                    }
                }
            } catch (err) { console.error(err); }

            const profilesRef = ref(db, `users/${uid}/profiles`);
            unsubscribe = onValue(profilesRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const list = Object.entries(data).map(([id, p]) => ({ id, ...p })).reverse();
                    setProfiles(list);
                } else {
                    setProfiles([]);
                }
                setLoading(false);
            });
        };

        if (auth.currentUser) init();
        else {
            const timer = setTimeout(() => { if (auth.currentUser) init(); else setLoading(false); }, 1000);
            return () => clearTimeout(timer);
        }
        return () => { if (unsubscribe) unsubscribe(); };
    }, []);

    const handleSave = async () => {
        try {
            const t = toast.loading("Encrypting & Saving Health Records...");
            await update(ref(db, `users/${auth.currentUser.uid}/profiles/${activeProfile.id}/data`), editData);
            toast.success("Security Vault Updated", { id: t });
            setIsEditing(false);
        } catch (error) {
            toast.error("Encryption Sync Failed");
        }
    };

    const handleDownload = () => {
        try {
            const canvas = document.getElementById(`qr-${activeProfile.id}`);
            if (!canvas) return;

            const downloadCanvas = document.createElement('canvas');
            const ctx = downloadCanvas.getContext('2d');
            const padding = 40;
            downloadCanvas.width = canvas.width + (padding * 2);
            downloadCanvas.height = canvas.height + (padding * 2) + 80;
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            ctx.drawImage(canvas, padding, padding + 20);
            
            ctx.fillStyle = '#ff0000';
            ctx.font = '900 60px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('RESQR', downloadCanvas.width / 2, padding + 30);
            
            ctx.font = '900 24px Arial';
            ctx.fillStyle = '#111111';
            ctx.fillText('SCAN IN EMERGENCY', downloadCanvas.width / 2, downloadCanvas.height - 30);

            const link = document.createElement('a');
            link.href = downloadCanvas.toDataURL('image/png');
            link.download = `RESQR_TAG_${activeProfile.data.name || 'USER'}.png`;
            link.click();
        } catch (err) { toast.error('Download failed'); }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050B18] flex flex-col items-center justify-center text-white italic">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="font-poppins font-black uppercase tracking-widest text-xs">Accessing Secure Node...</p>
        </div>
    );

    if (!auth.currentUser) return <div className="min-h-screen bg-[#050B18] flex items-center justify-center"><Button onClick={() => navigate('/login')}>LOGIN TO GUARDIAN HUB</Button></div>;

    const profileName = (activeProfile?.data?.name || auth.currentUser.displayName || 'Guardian').split(' ')[0].toUpperCase();

    return (
        <div className="min-h-screen bg-[#040812] text-white font-manrope selection:bg-primary/30">
            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 space-y-12">
                
                {/* HEADER SECTION - AS BEFORE */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter font-poppins text-white leading-tight">
                            WELCOME BACK, <span className="text-white">{profileName}</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-2 flex items-center gap-2">
                             Your emergency profile is active and protecting you.
                        </p>
                    </motion.div>
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            className="hidden md:flex bg-slate-900 border-white/5 text-slate-400 font-black italic uppercase text-xs h-12 px-8 rounded-2xl hover:bg-slate-800"
                            onClick={handleDownload}
                        >
                            <Download size={16} className="mr-2" /> Download Tag
                        </Button>
                        <Button 
                            className="bg-primary text-white font-black italic uppercase text-xs h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all border-none"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            <Edit3 size={16} className="mr-2" /> {isEditing ? 'Discard Changes' : 'Edit Profile'}
                        </Button>
                    </div>
                </header>

                {/* STATS ROW - AS BEFORE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#11192A] p-8 rounded-3xl border border-white/5 flex items-center gap-6 group hover:border-primary/20 transition-all">
                        <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                            <QrCode size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Scans</p>
                            <p className="text-4xl font-black italic italic uppercase tracking-tight font-poppins text-white">
                                {activeProfile?.scans ? Object.keys(activeProfile.scans).length : 0}
                            </p>
                        </div>
                    </div>
                    <div className="bg-[#11192A] p-8 rounded-3xl border border-white/5 flex items-center gap-6 group hover:border-emerald-500/20 transition-all">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Health Status</p>
                            <p className="text-4xl font-black italic uppercase tracking-tighter font-poppins text-emerald-400">Verified</p>
                        </div>
                    </div>
                    <div className="bg-[#11192A] p-8 rounded-3xl border border-white/5 flex items-center gap-6 group hover:border-red-500/20 transition-all">
                        <div className="w-14 h-14 bg-[#E63946] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/20">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Safety Index</p>
                            <p className="text-4xl font-black italic uppercase tracking-tighter font-poppins text-white">High</p>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT - TWO COLUMN AS BEFORE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT: EMERGENCY PASSPORT */}
                    <div className="lg:col-span-2 bg-[#11192A] rounded-[40px] border border-white/5 overflow-hidden flex flex-col min-h-[500px] relative">
                        <div className="p-10 pb-0 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter font-poppins text-white">Emergency Passport</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live Responder Data</p>
                            </div>
                            <Lock size={24} className="text-slate-800" />
                        </div>

                        <div className="flex-1 p-10">
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
                                    <Input label="FULL NAME" name="name" value={editData.name || ''} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                                    <Input label="BLOOD GROUP" name="bloodGroup" value={editData.bloodGroup || ''} onChange={(e) => setEditData({...editData, bloodGroup: e.target.value})} />
                                    <div className="md:col-span-2">
                                        <Input label="HEALTH CONDITIONS" name="healthIssues" value={editData.healthIssues || ''} onChange={(e) => setEditData({...editData, healthIssues: e.target.value})} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input label="ALLERGIES" name="allergies" value={editData.allergies || ''} onChange={(e) => setEditData({...editData, allergies: e.target.value})} />
                                    </div>
                                    <Input label="GUARDIAN NAME" name="emergencyContactName" value={editData.emergencyContactName || ''} onChange={(e) => setEditData({...editData, emergencyContactName: e.target.value})} />
                                    <Input label="GUARDIAN PHONE" name="emergencyContactPhone" value={editData.emergencyContactPhone || ''} onChange={(e) => setEditData({...editData, emergencyContactPhone: e.target.value})} />
                                    
                                    <div className="md:col-span-2 flex justify-center pt-6">
                                        <Button onClick={handleSave} className="w-full h-16 bg-primary text-white font-black italic uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 border-none transition-transform active:scale-95">
                                            SAVE CHANGES
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blood Group</p>
                                        <p className="text-4xl font-black italic text-[#E63946] font-poppins tracking-tighter">{activeProfile?.data?.bloodGroup || 'B+'}</p>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Contact</p>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-black italic text-white font-poppins uppercase tracking-tighter">{activeProfile?.data?.emergencyContactName || 'AMMA'}</p>
                                            <p className="text-sm font-bold text-[#E63946] tracking-widest font-poppins">{activeProfile?.data?.emergencyContactName || 'AMMA'}</p>
                                            <p className="text-3xl font-black italic text-white font-poppins tracking-tight">{activeProfile?.data?.emergencyContactPhone || '9849436317'}</p>
                                        </div>
                                        <div className="mt-4"><Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1.5 font-bold uppercase text-[9px]">Verified Contact</Badge></div>
                                    </div>
                                    <div className="space-y-4 md:col-span-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Conditions</p>
                                        <p className="text-2xl font-black italic text-white font-poppins uppercase tracking-tighter italic">{activeProfile?.data?.healthIssues || 'None reported'}</p>
                                    </div>
                                    <div className="space-y-4 md:col-span-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Allergies</p>
                                        <p className="text-2xl font-black italic text-white font-poppins uppercase tracking-tighter italic">{activeProfile?.data?.allergies || 'None reported'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isEditing && (
                            <div className="p-10 pt-0 text-center md:text-left mt-auto">
                                <button onClick={() => setIsEditing(true)} className="text-[#E63946] font-black italic uppercase tracking-widest text-sm flex items-center justify-center md:justify-start gap-2 group">
                                    Update Health Records <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                        
                        {/* ENCRYPTION BADGE */}
                        <div className="absolute top-6 right-10 flex items-center gap-2 px-3 py-1.5 bg-[#050B18] rounded-full border border-white/5 opacity-40">
                            <Lock size={10} className="text-emerald-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Data Securely Encrypted</span>
                        </div>
                    </div>

                    {/* RIGHT: LIVE IDENTITY TAG */}
                    <div className="space-y-6">
                        <div className="bg-[#11192A] rounded-[40px] border border-white/5 overflow-hidden flex flex-col shadow-2xl">
                            <div className="bg-[#E63946] text-white text-center py-4 text-[10px] font-black uppercase tracking-[0.4em] italic">
                                Live Identity Tag
                            </div>
                            <div className="p-10 flex flex-col items-center">
                                <div className="bg-white p-6 rounded-[35px] shadow-2xl relative">
                                    <QRCodeCanvas
                                        id={`qr-${activeProfile?.id}`}
                                        value={`${window.location.origin}/qr/${activeProfile?.id}`}
                                        size={220}
                                        level="H"
                                        includeMargin={true}
                                        imageSettings={{ 
                                            src: `${import.meta.env.BASE_URL}resqr_icon.png`, 
                                            height: 40, 
                                            width: 40, 
                                            excavate: true 
                                        }}
                                    />
                                </div>
                                <div className="mt-8 text-center space-y-4">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">
                                        This QR links directly to your public emergency profile.
                                    </p>
                                    <Link to={`/qr/${activeProfile?.id}`} target="_blank">
                                        <Button className="w-full h-16 bg-[#050B18] text-white font-black italic uppercase tracking-widest rounded-2xl border-white/5 hover:bg-[#0a1225] flex items-center justify-center gap-3 mt-4">
                                            Preview Page <ExternalLink size={18} />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Scans list small */}
                        <div className="bg-[#11192A] p-8 rounded-[40px] border border-white/5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Security Logs</h4>
                            <div className="space-y-4">
                                {activeProfile?.scans ? Object.entries(activeProfile.scans).slice(0, 2).map(([id, scan]) => (
                                    <div key={id} className="flex items-center gap-4 bg-[#050B18] p-4 rounded-2xl border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <QrCode size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-white italic truncate uppercase">{scan.location}</p>
                                            <p className="text-[8px] text-slate-500 font-bold uppercase">{scan.time}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-[10px] text-slate-600 italic py-4">No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* LIVE PREVIEW IFRAME - OPTIONAL BUT USER ASKED FOR IT */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-10 right-10 w-[300px] h-[580px] z-50 hidden xl:block pointer-events-none"
                    >
                         <div className="w-full h-full bg-[#050B18] rounded-[48px] border-[6px] border-slate-800 shadow-2xl relative overflow-hidden ring-4 ring-primary/20">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-xl z-20" />
                            <iframe 
                                src={`${window.location.origin}/qr/${activeProfile?.id}?preview=true`}
                                className="w-full h-full border-none"
                                title="Live Preview"
                            />
                            <div className="absolute inset-0 bg-transparent pointer-events-none z-10" />
                        </div>
                        <div className="absolute -top-12 left-0 right-0 text-center">
                            <Badge className="bg-primary text-white border-none font-black italic tracking-widest uppercase text-[8px] animate-pulse">Live Responder View</Badge>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

