import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Dog, Briefcase, Car, Plus, QrCode, Download, Edit3, 
    Trash2, Clock, Loader2, Shield, Eye, Lock, RefreshCw, X, ExternalLink,
    Activity, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle, Phone, MapPin, AtSign
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { QRCodeCanvas } from 'qrcode.react';
import { db, auth } from '../lib/firebase';
import { ref, get, update, remove, onValue, set } from 'firebase/database';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([]);
    const [editData, setEditData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [username, setUsername] = useState('');

    const activeProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

    useEffect(() => {
        if (profiles.length > 0 && !selectedProfileId) {
            setSelectedProfileId(profiles[0].id);
        }
    }, [profiles]);

    useEffect(() => {
        if (activeProfile) {
            setEditData(activeProfile.data || {});
            setUsername(activeProfile.username || '');
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
            const profilesRef = ref(db, `users/${uid}/profiles`);
            unsubscribe = onValue(profilesRef, (snapshot) => {
                const profilesData = snapshot.exists() 
                    ? Object.entries(snapshot.val()).map(([id, p]) => ({ id, ...p })).reverse()
                    : [];
                
                setProfiles(profilesData);
                setLoading(false);
                
                // Redirect users to appropriate page
                if (!snapshot.exists()) {
                    navigate('/create-profile');
                } else {
                    const profileArray = Object.values(snapshot.val());
                    const hasPaidProfile = profileArray.some(p => p.payment_status === 'paid');
                    if (!hasPaidProfile) {
                        navigate('/payment');
                    }
                }
            });
        };
        if (auth.currentUser) init();
        else {
            const timer = setTimeout(() => { if (auth.currentUser) init(); else setLoading(false); }, 1000);
            return () => clearTimeout(timer);
        }
        return () => { if (unsubscribe) unsubscribe(); };
    }, [navigate]);

    const handleSave = async () => {
        try {
            const t = toast.loading("Syncing Secure Identity...");
            const uid = auth.currentUser.uid;
            const pid = activeProfile.id;

            if (username && username !== activeProfile.username) {
                const cleanUser = username.toLowerCase().replace(/[^a-z0-9]/g, '');
                const regRef = ref(db, `usernames/${cleanUser}`);
                const existing = await get(regRef);
                if (existing.exists() && existing.val() !== `${uid}/${pid}`) {
                    toast.error("Username already claimed.", { id: t });
                    return;
                }
                if (activeProfile.username) await remove(ref(db, `usernames/${activeProfile.username.toLowerCase()}`));
                await set(regRef, `${uid}/${pid}`);
                await update(ref(db, `users/${uid}/profiles/${pid}`), { username: cleanUser });
            }

            await update(ref(db, `users/${uid}/profiles/${pid}/data`), editData);
            toast.success("Security Node Updated", { id: t });
            setIsEditing(false);
        } catch (error) { toast.error("Sync Failed"); }
    };

    const handleDownload = async () => {
        try {
            const t = toast.loading("Synthesizing Print-Ready Tag...");
            const canvas = document.getElementById(`qr-${activeProfile.id}`);
            if (!canvas) return;

            const downloadCanvas = document.createElement('canvas');
            const ctx = downloadCanvas.getContext('2d');
            const CANVAS_W = 1200;
            const CANVAS_H = 1500;
            downloadCanvas.width = CANVAS_W;
            downloadCanvas.height = CANVAS_H;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            const logo = new Image();
            logo.src = '/logo2.png';
            await new Promise((resolve) => { logo.onload = resolve; });
            const logoW = 500;
            const logoH = (logo.height / logo.width) * logoW;
            ctx.drawImage(logo, (CANVAS_W - logoW) / 2, 80, logoW, logoH);

            ctx.drawImage(canvas, (CANVAS_W - 800) / 2, logoH + 200, 800, 800);

            // Draw Bottom Text
            ctx.fillStyle = '#111111';
            ctx.font = 'italic 900 90px sans-serif';
            ctx.textAlign = 'center';
            ctx.letterSpacing = "-4px";
            ctx.fillText('SCAN IN EMERGENCY', CANVAS_W / 2, CANVAS_H - 120);

            // Footer Site Name
            ctx.font = 'bold 36px sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.letterSpacing = "4px";
            ctx.fillText('POWERED BY RESQR.CO.IN', CANVAS_W / 2, CANVAS_H - 50);

            const link = document.createElement('a');
            const fileName = `RESQR_${username || activeProfile.id.split('_').pop()}`.toUpperCase();
            link.href = downloadCanvas.toDataURL('image/png', 1.0);
            link.download = `${fileName}.png`;
            link.click();
            toast.success("Tag Downloaded", { id: t });
        } catch (err) { toast.error('Download failed'); }
    };

    if (loading) return <div className="min-h-screen bg-[#040812] flex items-center justify-center text-white italic">SYNCHRONIZING HUB...</div>;
    if (!auth.currentUser) return <div className="min-h-screen bg-[#040812] flex items-center justify-center text-white"><Button onClick={() => navigate('/login')}>RE-AUTHENTICATE</Button></div>;

    const qrValue = username 
        ? `${window.location.origin}/${username}` 
        : `${window.location.origin}/qr/${activeProfile?.id}`;

    const profileName = (activeProfile?.data?.name || auth.currentUser.displayName || 'Guardian').split(' ')[0].toUpperCase();

    return (
        <div className="min-h-screen bg-[#040812] text-white font-manrope selection:bg-primary/30">
            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 space-y-12">
                
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter font-poppins text-white leading-tight">WELCOME BACK, {profileName}</h1>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.3em] mt-2 flex items-center gap-2">System operational • All nodes secure</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="bg-[#11192A] border-white/5 text-slate-400 font-black italic uppercase text-xs h-12 px-8 rounded-2xl hover:bg-slate-800" onClick={handleDownload}><Download size={16} className="mr-2" /> Download Tag</Button>
                        <Button className="bg-primary text-white font-black italic uppercase text-xs h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all border-none" onClick={() => setIsEditing(!isEditing)}><Edit3 size={16} className="mr-2" /> {isEditing ? 'Discard Changes' : 'Edit Profile'}</Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#11192A] p-8 rounded-3xl border border-white/5 flex items-center gap-6 cursor-pointer hover:border-indigo-500/30 transition-all group/stat" onClick={() => document.getElementById('recent-scans')?.scrollIntoView({ behavior: 'smooth' })}><div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover/stat:bg-indigo-500/20 transition-all"><QrCode size={24} /></div><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Scans</p><p className="text-4xl font-black italic uppercase tracking-tight font-poppins text-white">{activeProfile?.scans ? Object.keys(activeProfile.scans).length : 0}</p></div></div>
                    <div className="bg-[#11192A] p-8 rounded-3xl border border-white/5 flex items-center gap-6"><div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20"><User size={24} /></div><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Health Status</p><p className="text-4xl font-black italic uppercase tracking-tighter font-poppins text-emerald-400">Verified</p></div></div>
                    <div className="bg-[#11192A] p-8 rounded-3xl border border-white/5 flex items-center gap-6"><div className="w-14 h-14 bg-[#E63946]/10 rounded-2xl flex items-center justify-center border border-red-500/20"><ShieldCheck size={24} /></div><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Safety Index</p><p className="text-4xl font-black italic uppercase tracking-tighter font-poppins text-white">High</p></div></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-[#11192A] rounded-[50px] border border-white/5 overflow-hidden flex flex-col relative shadow-2xl">
                        <div className="p-12 pb-0 flex justify-between items-start">
                             <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20"><Shield size={24} className="text-primary" /></div><div><h3 className="text-3xl font-black uppercase tracking-tighter font-poppins text-white italic">Emergency Passport</h3><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">ACTIVE MEDICAL IDENTITY</p></div></div>
                             <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">SECURED</span></div>
                        </div>

                        <div className="p-12">
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block text-emerald-400">Ultra-Small URL Link</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500"><AtSign size={16} /></div>
                                            <input className="w-full h-16 bg-[#050B18] border border-white/5 rounded-2xl pl-14 pr-6 font-black italic text-white uppercase tracking-widest focus:border-primary/50 outline-none transition-all placeholder:text-slate-700" placeholder="CHOOSE-USER-ID" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))} />
                                            <p className="text-xs text-slate-500 font-bold mt-2 lowercase">Result: resqr.co.in/{username || 'username'}</p>
                                        </div>
                                    </div>
                                    <Input label="FULL IDENTITY NAME" name="name" value={editData.name || ''} onChange={(e) => setEditData({...editData, name: e.target.value.toUpperCase()})} />
                                    <Input label="BLOOD VECTOR" name="bloodGroup" value={editData.bloodGroup || ''} onChange={(e) => setEditData({...editData, bloodGroup: e.target.value.toUpperCase()})} />
                                    <div className="md:col-span-2"><Input label="CRITICAL HEALTH CONDITIONS" name="healthIssues" value={editData.healthIssues || ''} onChange={(e) => setEditData({...editData, healthIssues: e.target.value})} /></div>
                                    <div className="md:col-span-2"><Input label="VULNERABILITIES / ALLERGIES" name="allergies" value={editData.allergies || ''} onChange={(e) => setEditData({...editData, allergies: e.target.value})} /></div>
                                    <Input label="GUARDIAN NAME" name="emergencyContactName" value={editData.emergencyContactName || ''} onChange={(e) => setEditData({...editData, emergencyContactName: e.target.value.toUpperCase()})} />
                                    <Input label="GUARDIAN RELATION" name="emergencyContactRelation" value={editData.emergencyContactRelation || ''} onChange={(e) => setEditData({...editData, emergencyContactRelation: e.target.value.toUpperCase()})} />
                                    <Input label="GUARDIAN PHONE" name="emergencyContactPhone" value={editData.emergencyContactPhone || ''} onChange={(e) => setEditData({...editData, emergencyContactPhone: e.target.value})} />
                                    <div className="md:col-span-2 flex justify-center pt-6"><Button onClick={handleSave} className="w-full h-16 bg-primary text-white font-black italic uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20">COMMIT RECORDS</Button></div>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-12">
                                    <div className="flex-1 space-y-10">
                                        <div className="space-y-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blood Group</p><p className="text-8xl font-black italic text-[#E63946] font-poppins tracking-tighter leading-none">{activeProfile?.data?.bloodGroup || 'B-'}</p></div>
                                        <div className="space-y-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Medical Conditions</p><div className="bg-[#050B18] p-6 rounded-3xl border border-white/5 italic font-bold text-white/80">{activeProfile?.data?.healthIssues || 'Unknown status'}</div></div>
                                        <div className="space-y-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Allergies</p><div className="bg-red-500/5 p-6 rounded-3xl border border-red-500/10 italic font-bold text-red-400">{activeProfile?.data?.allergies || 'None reported'}</div></div>
                                    </div>
                                    <div className="w-full md:w-80 space-y-8">
                                        <div className="bg-[#050B18] p-8 rounded-[40px] border border-white/5 relative group">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 font-poppins">Emergency Contact</p>
                                            <h4 className="text-3xl font-black italic text-white uppercase font-poppins leading-none mb-1">{activeProfile?.data?.emergencyContactName || 'NANA'}</h4>
                                            <Badge className="bg-red-500/10 text-red-500 border-none px-3 py-1 font-black italic text-[9px] uppercase mb-10">{activeProfile?.data?.emergencyContactRelation || 'PARENT'}</Badge>
                                            <div className="space-y-1 mt-10"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-poppins">Private Contact Node</p><p className="text-3xl font-black italic text-white font-poppins tracking-tighter leading-none">{activeProfile?.data?.emergencyContactPhone?.replace(/\d(?=\d{4})/g, '*') || '**********'}</p></div>
                                            <div className="absolute top-8 right-8 flex flex-col gap-3"><button className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 transition-transform active:scale-95"><Phone size={20} /></button></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-[#050B18] p-5 rounded-[25px] border border-white/5 flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><CheckCircle2 size={18} className="text-emerald-500" /></div><span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] italic">BLOCKCHAIN VERIFIED</span></div>
                                            <div className="bg-[#050B18] p-5 rounded-[25px] border border-white/5 flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20"><Lock size={18} className="text-indigo-500" /></div><span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] italic">ENCRYPTED VAULT</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!isEditing && <button onClick={() => setIsEditing(true)} className="w-full h-24 bg-[#050B18] text-white font-black italic uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-slate-900 transition-all group font-poppins">Update Medical Records <ChevronRight size={24} className="text-primary group-hover:translate-x-2 transition-transform" /></button>}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#11192A] rounded-[50px] border border-white/5 overflow-hidden flex flex-col shadow-2xl">
                            <div className="bg-white p-12 flex flex-col items-center">
                                <img src="/logo2.png" alt="RESQR" className="h-14 w-auto mb-10" />
                                <div className="bg-white p-4 rounded-[25px] shadow-2xl relative mb-10">
                                    <QRCodeCanvas id={`qr-${activeProfile?.id}`} value={qrValue} size={180} level="H" includeMargin={false} imageSettings={{ src: "/resqr_icon.png", height: 40, width: 40, excavate: true }} />
                                </div>
                                <p className="text-xl font-black text-black uppercase tracking-tighter mb-4 italic">SCAN IN EMERGENCY</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">POWERED BY RESQR.CO.IN</p>
                            </div>
                            <div className="bg-[#050B18] p-8 flex flex-col items-center text-center">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 font-poppins leading-relaxed">Personalized Link: <span className="text-emerald-400 lowercase">resqr.co.in/{username || '...'}</span></p>
                                <div className="flex flex-col gap-3 w-full">
                                    <Button onClick={handleDownload} className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-red-600/20">DOWNLOAD TAG <Download size={18} /></Button>
                                    <Link to={username ? `/${username}` : `/qr/${activeProfile?.id}`} target="_blank" className="w-full"><Button variant="outline" className="w-full h-14 bg-transparent text-white border-white/10 font-black italic uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3">Preview Page <ExternalLink size={16} /></Button></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RECENT SCAN ACTIVITY */}
                <div id="recent-scans" className="pt-20 border-t border-white/5 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter font-poppins mb-2">Recent Scanned Locations</h2>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">Track where and when your security nodes were accessed.</p>
                        </div>
                        <div className="hidden md:block">
                             <Badge className="bg-primary/10 text-primary border-none px-4 py-2 font-black italic text-[10px] uppercase tracking-widest">LIVE MONITORING ACTIVE</Badge>
                        </div>
                    </div>

                    {activeProfile?.scans ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(activeProfile.scans)
                                .sort((a, b) => {
                                    const timeA = a[1].timestamp || 0;
                                    const timeB = b[1].timestamp || 0;
                                    return timeB - timeA;
                                })
                                .slice(0, 6)
                                .map(([id, scan]) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={id} 
                                    className="bg-[#11192A] p-8 rounded-[40px] border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-2xl"
                                >
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/5 group-hover:scale-110 transition-transform">
                                            <MapPin size={24} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 font-poppins italic">{scan.date}</p>
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none font-poppins italic">{scan.time}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6 relative z-10">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">Access Point</p>
                                            <p className="text-xl font-black text-white uppercase italic tracking-tight font-poppins group-hover:text-primary transition-colors">
                                                {scan.location || 'Encrypted Node Location'}
                                            </p>
                                        </div>
                                        
                                        {scan.coords ? (
                                            <button 
                                                onClick={() => window.open(`https://www.google.com/maps?q=${scan.coords.lat},${scan.coords.lng}`, '_blank')}
                                                className="w-full py-5 bg-[#050B18] hover:bg-primary text-slate-400 hover:text-white border border-white/5 hover:border-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 italic shadow-inner"
                                            >
                                                <ExternalLink size={16} /> Locate On Grid
                                            </button>
                                        ) : (
                                            <div className="w-full py-5 bg-[#050B18]/50 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] text-slate-700 flex items-center justify-center gap-2 italic">
                                                <Lock size={14} /> Coordinates Masked
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                        <Activity size={120} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 border-2 border-dashed border-white/5 rounded-[50px] flex flex-col items-center justify-center text-slate-700 italic bg-[#11192A]/30 group">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Clock size={32} className="opacity-20 text-white" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No recent scan activity detected on this identity node.</p>
                            <p className="text-[8px] font-bold uppercase tracking-[0.2em] mt-2 opacity-30">Scan your QR tag to initialize tracking.</p>
                        </div>
                    )}
                </div>

                {/* ADDITIONAL IDENTITY NODE - AS REQUESTED */}

                <div className="pt-20 border-t border-white/5 space-y-10">
                    <div className="text-center">
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter font-poppins mb-2">Powering Multiple Identities?</h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">Add another Pet, Vehicle, or Family Member to your ResQR Vault.</p>
                    </div>
                    <button onClick={() => navigate('/create-profile')} className="w-full h-32 border-2 border-dashed border-white/10 rounded-[40px] flex items-center justify-center gap-6 group hover:border-primary/50 transition-all active:scale-95">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                            <Plus size={32} />
                        </div>
                        <div className="text-left">
                            <p className="text-xl font-black italic uppercase tracking-widest group-hover:text-primary transition-all">Create Another Identity Block</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Expansion Node Ready • Secure Setup</p>
                        </div>
                    </button>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
                         {profiles.length > 1 && profiles.map(p => (
                             <button key={p.id} onClick={() => { setSelectedProfileId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`h-16 rounded-2xl border transition-all font-black uppercase italic tracking-widest text-[10px] ${p.id === selectedProfileId ? 'bg-primary border-primary text-white' : 'bg-[#11192A] border-white/5 text-slate-500 hover:border-white/20'}`}>
                                 {p.data?.name || 'Identity Node'}
                             </button>
                         ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
