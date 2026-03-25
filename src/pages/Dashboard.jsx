import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    User, Dog, Briefcase, Car, Plus, QrCode, Download, Edit3, 
    Trash2, Clock, Loader2, Shield, Eye, Lock, RefreshCw, X, ExternalLink
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
    const [viewScansProfile, setViewScansProfile] = useState(null);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const qrRef = useRef(null);

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

    // Initial load & migrate
    useEffect(() => {
        let unsubscribe;
        const init = async () => {
            if (!auth.currentUser) {
                setLoading(false);
                return;
            }
            
            const uid = auth.currentUser.uid;
            
            // 1. Try Migration
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
                            const newProfileRef = ref(db, `users/${uid}/profiles/${newId}`);
                            const checkSnap = await get(newProfileRef);
                            if (!checkSnap.exists()) {
                                await update(newProfileRef, {
                                    category: 'people',
                                    data: { 
                                        ...data, 
                                        name: data.name || 'Medical Profile',
                                        bloodGroup: data.bloodGroup || '--',
                                        healthIssues: data.medicalConditions || data.healthIssues || 'None reported',
                                        emergencyContactName: data.emergencyContactName || data.eName || '',
                                        emergencyContactPhone: data.emergencyContactPhone || data.ePhone || '',
                                        emergencyContactRelation: data.emergencyContactRelation || data.eRelation || 'Emergency Contact'
                                    },
                                    payment_status: data.payment_status || 'paid',
                                    migrated: true,
                                    legacyId: oldId,
                                    createdAt: data.createdAt || new Date().toISOString(),
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Migration error:", err);
            }

            // 2. Listen
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
            }, (error) => {
                setLoading(false);
            });
        };

        if (auth.currentUser) init();
        else {
            const timer = setTimeout(() => {
                if (auth.currentUser) init();
                else setLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
        return () => { if (unsubscribe) unsubscribe(); };
    }, []);

    const handleDelete = async (profileId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await remove(ref(db, `users/${auth.currentUser.uid}/profiles/${profileId}`));
            toast.success("Identity Neutralized.");
            if (selectedProfileId === profileId) setSelectedProfileId(null);
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleDownload = (profileId, name) => {
        try {
            const canvas = document.getElementById(`qr-${profileId}`);
            if (!canvas) return toast.error('Render error');

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
            ctx.fillStyle = '#000000';
            ctx.fillText('SCAN IN EMERGENCY', downloadCanvas.width / 2, downloadCanvas.height - 30);

            const link = document.createElement('a');
            link.href = downloadCanvas.toDataURL('image/png');
            link.download = `RESQR_TAG.png`;
            link.click();
        } catch (err) {
            toast.error('Download failed');
        }
    };

    const handleSaveInline = async () => {
        try {
            const t = toast.loading("Syncing Identity...");
            await update(ref(db, `users/${auth.currentUser.uid}/profiles/${activeProfile.id}/data`), editData);
            toast.success("Network Updated", { id: t });
        } catch (error) {
            toast.error("Sync failed");
        }
    };

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white italic">LOGGING IN TO NETWORK...</div>;
    if (!auth.currentUser) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Button onClick={() => navigate('/login')}>RE-AUTHENTICATE</Button></div>;

    return (
        <div className="min-h-screen bg-slate-950 py-24 px-4 text-white font-manrope">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
                    <div>
                        <Badge className="bg-primary/20 text-primary border-none mb-4 px-6 py-1 font-black italic tracking-widest uppercase text-[10px]">IDENTITY HUB</Badge>
                        <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins">DASHBOARD</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[9px] mt-4 flex items-center gap-2">PRIVATE SECURE SUBSYSTEM</p>
                    </div>
                    <Button className="rounded-2xl font-black px-10 py-6 bg-primary text-white border-none italic uppercase tracking-tighter" onClick={() => navigate('/create-profile')}>
                        <Plus size={24} className="mr-3" /> NEW IDENTITY
                    </Button>
                </header>

                {profiles.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-[40px] border border-white/5">
                        <h2 className="text-3xl font-black mb-6 italic uppercase">NO IDENTITIES FOUND</h2>
                        <Button onClick={() => navigate('/create-profile')} className="bg-primary">CREATE YOUR FIRST QR</Button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-10">
                        {profiles.length > 1 && (
                            <div className="w-full lg:w-72 space-y-4">
                                {profiles.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => setSelectedProfileId(p.id)}
                                        className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all ${selectedProfileId === p.id ? 'bg-primary text-white' : 'bg-slate-900/50 text-slate-500'}`}
                                    >
                                        <div className="shrink-0"><QrCode size={16} /></div>
                                        <div className="truncate text-[10px] font-black uppercase tracking-widest">{p.data.name || p.data.petName || p.data.vehicleNumber || 'PROFILE'}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex-1 flex flex-col xl:flex-row gap-10 bg-slate-900 border border-white/5 p-10 rounded-[50px] shadow-2xl">
                            {activeProfile && (
                                <div className="flex-1 space-y-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge className="bg-primary/20 text-primary border-none px-4 py-1 font-black italic text-[9px] mb-2 uppercase tracking-widest">{activeProfile.category}</Badge>
                                            <h2 className="text-5xl font-black italic uppercase tracking-tighter">{activeProfile.data.name || activeProfile.data.petName || activeProfile.data.vehicleNumber}</h2>
                                        </div>
                                        <button onClick={() => handleDelete(activeProfile.id)} className="p-3 text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={24} /></button>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-10">
                                        {/* PHYSICAL QR PREVIEW */}
                                        <div className="bg-white p-6 rounded-[30px] shadow-2xl shrink-0">
                                            <div className="text-center mb-4"><p className="text-[10px] font-black text-red-600 uppercase tracking-widest">RESQR</p></div>
                                            <QRCodeCanvas
                                                id={`qr-${activeProfile.id}`}
                                                value={`${window.location.origin}/qr/${activeProfile.id}`}
                                                size={180}
                                                level="H"
                                                includeMargin={true}
                                                imageSettings={{ src: "/resqr_icon.png", height: 40, width: 40, excavate: true }}
                                            />
                                            <div className="mt-4 text-center"><p className="text-[9px] font-bold text-black uppercase tracking-widest italic">Emergency ID</p></div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-8 rounded-[40px] border border-white/5 shadow-inner">
                                            {activeProfile.category === 'people' ? (
                                                <>
                                                    <Input label="FULL NAME" name="name" value={editData.name || ''} onChange={handleEditChange} />
                                                    <Input label="BLOOD GROUP" name="bloodGroup" value={editData.bloodGroup || ''} onChange={handleEditChange} />
                                                    <div className="md:col-span-2"><Input label="HEALTH CONDITIONS" name="healthIssues" value={editData.healthIssues || ''} onChange={handleEditChange} /></div>
                                                    <div className="md:col-span-2"><Input label="ALLERGIES" name="allergies" value={editData.allergies || ''} onChange={handleEditChange} /></div>
                                                    <Input label="GUARDIAN NAME" name="emergencyContactName" value={editData.emergencyContactName || ''} onChange={handleEditChange} />
                                                    <Input label="GUARDIAN PHONE" name="emergencyContactPhone" value={editData.emergencyContactPhone || ''} onChange={handleEditChange} />
                                                </>
                                            ) : activeProfile.category === 'pets' ? (
                                                <>
                                                    <Input label="PET NAME" name="petName" value={editData.petName || ''} onChange={handleEditChange} />
                                                    <Input label="OWNER PHONE" name="ownerContact" value={editData.ownerContact || ''} onChange={handleEditChange} />
                                                </>
                                            ) : activeProfile.category === 'valuables' ? (
                                                <>
                                                    <Input label="ITEM NAME" name="itemName" value={editData.itemName || ''} onChange={handleEditChange} />
                                                    <Input label="OWNER PHONE" name="ownerContact" value={editData.ownerContact || ''} onChange={handleEditChange} />
                                                </>
                                            ) : (
                                                <>
                                                    <Input label="PLATE NUMBER" name="vehicleNumber" value={editData.vehicleNumber || ''} onChange={handleEditChange} />
                                                    <Input label="OWNER NAME" name="contactNumber" value={editData.ownerName || ''} onChange={handleEditChange} />
                                                </>
                                            )}
                                            <div className="md:col-span-2 pt-4">
                                                <Button onClick={handleSaveInline} className="w-full bg-primary py-6 rounded-2xl font-black italic tracking-widest text-sm border-none shadow-xl shadow-primary/20">SAVE CHANGES</Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <Button onClick={() => handleDownload(activeProfile.id, activeProfile.data.name || 'QR')} className="flex-1 bg-white/5 text-white hover:bg-white/10 rounded-2xl h-16 font-black uppercase italic tracking-widest text-xs border border-white/5">
                                            <Download size={18} className="mr-3" /> DOWNLOAD PHYSICAL QR
                                        </Button>
                                        <Button onClick={() => setViewScansProfile(activeProfile)} className="flex-1 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-2xl h-16 font-black uppercase italic tracking-widest text-xs border border-indigo-500/10">
                                            <Clock size={18} className="mr-3" /> VIEW SCANS ({activeProfile.scans ? Object.keys(activeProfile.scans).length : 0})
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* MOBILE PREVIEW */}
                            <div className="w-full xl:w-[320px] shrink-0 flex flex-col items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 mb-6">LIVE RESPONDER PREVIEW</h4>
                                <div className="w-full aspect-[9/19] bg-slate-950 rounded-[48px] border-[6px] border-slate-800 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-xl z-20" />
                                    <iframe 
                                        src={`${window.location.origin}/qr/${activeProfile?.id}`}
                                        className="w-full h-full border-none pointer-events-none"
                                        title="Live Preview"
                                    />
                                    <Link to={`/qr/${activeProfile?.id}`} target="_blank" className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-primary/90 text-white text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl">OPEN LIVE</Link>
                                </div>
                                <p className="text-[8px] text-slate-600 font-bold mt-4 uppercase tracking-widest text-center">PUBLIC EMERGENCY PROFILE LINK</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={!!viewScansProfile} onClose={() => setViewScansProfile(null)} title="Scan Logs">
                {viewScansProfile && (
                     <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {viewScansProfile.scans ? Object.entries(viewScansProfile.scans).reverse().map(([id, scan]) => (
                            <div key={id} className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0"><Clock size={16} /></div>
                                <div className="min-w-0">
                                    <p className="font-black text-white italic truncate">{scan.location}</p>
                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{scan.date} • {scan.time}</p>
                                </div>
                            </div>
                        )) : <p className="text-center text-slate-500 italic py-10 font-bold uppercase tracking-widest text-[10px]">No Scans Detected</p>}
                        <Button className="w-full mt-4 bg-slate-800" onClick={() => setViewScansProfile(null)}>Close Intel</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
