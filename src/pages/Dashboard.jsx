import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Dog, Briefcase, Car, Plus, QrCode, Download, Edit3, 
    Trash2, Clock, Loader2, Shield, Eye, Lock, RefreshCw, X, ExternalLink,
    Activity, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle, Phone, MapPin
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
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
            const t = toast.loading("Syncing Secure Identity...");
            await update(ref(db, `users/${auth.currentUser.uid}/profiles/${activeProfile.id}/data`), editData);
            toast.success("Security Node Updated", { id: t });
            setIsEditing(false);
        } catch (error) { toast.error("Sync Failed"); }
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
            ctx.font = '900 60px Arial'; ctx.textAlign = 'center';
            ctx.fillText('RESQR', downloadCanvas.width / 2, padding + 30);
            ctx.font = '900 24px Arial'; ctx.fillStyle = '#111111';
            ctx.fillText('SCAN IN EMERGENCY', downloadCanvas.width / 2, downloadCanvas.height - 30);
            const link = document.createElement('a');
            link.href = downloadCanvas.toDataURL('image/png');
            link.download = `RESQR_TAG.png`;
            link.click();
        } catch (err) { toast.error('Download failed'); }
    };

    if (loading) return <div className="min-h-screen bg-[#040812] flex items-center justify-center text-white italic">SYNCHRONIZING HUB...</div>;
    if (!auth.currentUser) return <div className="min-h-screen bg-[#040812] flex items-center justify-center"><Button onClick={() => navigate('/login')}>RE-AUTHENTICATE</Button></div>;

    const profileName = (activeProfile?.data?.name || auth.currentUser.displayName || 'Guardian').split(' ')[0].toUpperCase();

    return (
        <div className="min-h-screen bg-[#040812] text-white font-manrope selection:bg-primary/30">
            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 space-y-12">
                
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter font-poppins text-white leading-tight">
                            WELCOME BACK, {profileName}
                        </h1>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                             System operational • All nodes secure
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="bg-[#11192A] border-white/5 text-slate-400 font-black italic uppercase text-xs h-12 px-8 rounded-2xl hover:bg-slate-800" onClick={handleDownload}>
                            <Download size={16} className="mr-2" /> Download Tag
                        </Button>
                        <Button className="bg-primary text-white font-black italic uppercase text-xs h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all border-none" onClick={() => setIsEditing(!isEditing)}>
                            <Edit3 size={16} className="mr-2" /> {isEditing ? 'Discard Changes' : 'Edit Profile'}
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#11192A] p-8 rounded-3xl border border-white/5 flex items-center gap-6">
                        <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20"><QrCode size={24} /></div>
                        <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Scans</p><p className="text-4xl font-black italic uppercase tracking-tight font-poppins text-white">{activeProfile?.scans ? Object.keys(activeProfile.scans).length : 0}</p></div>
                    </div>
                    <div className="bg-[#11192A] p-8 rounded-3xl border border-white/5 flex items-center gap-6">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20"><User size={24} /></div>
                        <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Health Status</p><p className="text-4xl font-black italic uppercase tracking-tighter font-poppins text-emerald-400">Verified</p></div>
                    </div>
                    <div className="bg-[#11192A] p-8 rounded-3xl border border-white/5 flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#E63946] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/20"><ShieldCheck size={24} /></div>
                        <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Safety Index</p><p className="text-4xl font-black italic uppercase tracking-tighter font-poppins text-white">High</p></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* PASSPORT SECTION - DARK THEME AS REQUESTED */}
                    <div className="lg:col-span-2 bg-[#11192A] rounded-[50px] border border-white/5 overflow-hidden flex flex-col relative shadow-2xl">
                        <div className="p-12 pb-0 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20"><Shield size={24} className="text-primary" /></div>
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter font-poppins text-white italic">Emergency Passport</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">ACTIVE MEDICAL IDENTITY</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">SECURED</span>
                            </div>
                        </div>

                        <div className="p-12">
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
                                    <Input label="FULL IDENTITY NAME" name="name" value={editData.name || ''} onChange={(e) => setEditData({...editData, name: e.target.value.toUpperCase()})} />
                                    <Input label="BLOOD VECTOR" name="bloodGroup" value={editData.bloodGroup || ''} onChange={(e) => setEditData({...editData, bloodGroup: e.target.value.toUpperCase()})} />
                                    <div className="md:col-span-2"><Input label="CRITICAL HEALTH CONDITIONS" name="healthIssues" value={editData.healthIssues || ''} onChange={(e) => setEditData({...editData, healthIssues: e.target.value})} /></div>
                                    <div className="md:col-span-2"><Input label="VULNERABILITIES / ALLERGIES" name="allergies" value={editData.allergies || ''} onChange={(e) => setEditData({...editData, allergies: e.target.value})} /></div>
                                    <Input label="GUARDIAN IDENTIFIER" name="emergencyContactName" value={editData.emergencyContactName || ''} onChange={(e) => setEditData({...editData, emergencyContactName: e.target.value.toUpperCase()})} />
                                    <Input label="COMMS LINK (PHONE)" name="emergencyContactPhone" value={editData.emergencyContactPhone || ''} onChange={(e) => setEditData({...editData, emergencyContactPhone: e.target.value})} />
                                    <div className="md:col-span-2 flex justify-center pt-6">
                                        <Button onClick={handleSave} className="w-full h-16 bg-primary text-white font-black italic uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20">COMMIT RECORDS</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-12">
                                    {/* Left Fields */}
                                    <div className="flex-1 space-y-10">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blood Group</p>
                                            <p className="text-8xl font-black italic text-[#E63946] font-poppins tracking-tighter leading-none">{activeProfile?.data?.bloodGroup || 'B-'}</p>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Medical Conditions</p>
                                            <div className="bg-[#050B18] p-6 rounded-3xl border border-white/5 italic font-bold text-white/80">
                                                {activeProfile?.data?.healthIssues || 'Unknown status'}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Allergies</p>
                                            <div className="bg-red-500/5 p-6 rounded-3xl border border-red-500/10 italic font-bold text-red-400">
                                                {activeProfile?.data?.allergies || 'None reported'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section */}
                                    <div className="w-full md:w-80 space-y-8">
                                        <div className="bg-[#050B18] p-8 rounded-[40px] border border-white/5 relative group">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Emergency Contact</p>
                                            <h4 className="text-3xl font-black italic text-white uppercase font-poppins leading-none mb-1">{activeProfile?.data?.emergencyContactName || 'NANA'}</h4>
                                            <Badge className="bg-red-500/10 text-red-500 border-none px-3 py-1 font-black italic text-[9px] uppercase mb-10">PARENT</Badge>
                                            
                                            <div className="space-y-1 mt-10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Family Number</p>
                                                <p className="text-3xl font-black italic text-white font-poppins tracking-tighter leading-none">{activeProfile?.data?.emergencyContactPhone || '9985309102'}</p>
                                            </div>
                                            
                                            <div className="absolute top-8 right-8 flex flex-col gap-3">
                                                <button className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20"><Phone size={20} /></button>
                                                <button className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-500/20"><MapPin size={20} /></button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-[#050B18] p-5 rounded-[25px] border border-white/5 flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><CheckCircle2 size={18} className="text-emerald-500" /></div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] italic">BLOCKCHAIN VERIFIED</span>
                                            </div>
                                            <div className="bg-[#050B18] p-5 rounded-[25px] border border-white/5 flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20"><Lock size={18} className="text-indigo-500" /></div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] italic">ENCRYPTED VAULT</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="w-full h-24 bg-[#050B18] text-white font-black italic uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-slate-900 transition-all group">
                                Update Medical Records <ChevronRight size={24} className="text-primary group-hover:translate-x-2 transition-transform" />
                            </button>
                        )}
                    </div>

                    {/* LIVE IDENTITY TAG */}
                    <div className="space-y-6">
                        <div className="bg-[#11192A] rounded-[50px] border border-white/5 overflow-hidden flex flex-col shadow-2xl">
                            <div className="bg-[#E63946] text-white text-center py-5 text-[10px] font-black uppercase tracking-[0.4em] italic">Live Identity Tag</div>
                            <div className="p-10 flex flex-col items-center">
                                <div className="bg-white p-6 rounded-[35px] shadow-2xl relative inline-block mx-auto mb-10 group cursor-pointer hover:scale-105 transition-transform">
                                    <QRCodeCanvas id={`qr-${activeProfile?.id}`} value={`${window.location.origin}/qr/${activeProfile?.id}`} size={180} level="H" includeMargin={true} imageSettings={{ src: "/resqr_icon.png", height: 40, width: 40, excavate: true }} />
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center max-w-[200px] leading-relaxed mb-6">Linked directly to your public digital identification vault.</p>
                                <Link to={`/qr/${activeProfile?.id}`} target="_blank" className="w-full">
                                    <Button className="w-full h-16 bg-[#050B18] text-white font-black italic uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-[#0a1225] flex items-center justify-center gap-3">Preview Page <ExternalLink size={18} /></Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

