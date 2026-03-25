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
    
    // Modal states
    const [editProfile, setEditProfile] = useState(null);
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

    // Initial load & migrate
    useEffect(() => {
        let unsubscribe;
        const init = async () => {
            if (!auth.currentUser) {
                setLoading(false);
                return;
            }
            
            const uid = auth.currentUser.uid;
            
            // 1. Try Migration first to ensure no data is lost
            try {
                const legacyRef = ref(db, 'profiles');
                const snap = await get(legacyRef);
                if (snap.exists()) {
                    const allLegacy = snap.val();
                    const userEmail = auth.currentUser.email?.toLowerCase();
                    
                    // Match by UID or Email
                    const myLegacy = Object.entries(allLegacy).filter(([id, d]) => {
                        return d.uid === uid || (d.email && d.email.toLowerCase() === userEmail);
                    });
                    
                    if (myLegacy.length > 0) {
                        console.log(`Found ${myLegacy.length} legacy profiles for migration.`);
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
                                console.log(`Migrated profile: ${oldId} -> ${newId}`);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Migration error:", err);
            }

            // 2. Listen to new structure
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
                console.error("Dashboard error:", error);
                setLoading(false);
            });
        };

        if (auth.currentUser) {
            init();
        } else {
            // Wait a moment for auth state to initialize
            const timer = setTimeout(() => {
                if (auth.currentUser) init();
                else setLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const handleDelete = async (profileId) => {
        if (!window.confirm("Are you sure you want to delete this QR profile? This will break any printed QR codes permanently.")) return;
        
        try {
            const t = toast.loading("Deleting Profile...");
            await remove(ref(db, `users/${auth.currentUser.uid}/profiles/${profileId}`));
            toast.success("Profile deleted successfully", { id: t });
        } catch (error) {
            toast.error("Failed to delete profile");
        }
    };

    const handleDownload = (profileId, name) => {
        try {
            const canvas = document.getElementById(`qr-${profileId}`);
            if (!canvas) {
                toast.error('QR code not rendered yet');
                return;
            }

            const downloadCanvas = document.createElement('canvas');
            const ctx = downloadCanvas.getContext('2d');
            const padding = 40;
            
            downloadCanvas.width = canvas.width + (padding * 2);
            downloadCanvas.height = canvas.height + (padding * 2) + 60;
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            
            // Draw QR
            ctx.drawImage(canvas, padding, padding);
            
            // Draw Text
            ctx.fillStyle = '#ff0000'; // PURE RED
            ctx.font = '900 60px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('RESQR', downloadCanvas.width / 2, padding / 2 + 30);
            
            ctx.font = '900 24px Arial';
            ctx.fillStyle = '#000000';
            ctx.fillText('SCAN IN EMERGENCY', downloadCanvas.width / 2, downloadCanvas.height - 30);

            const url = downloadCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = `RESQR_${name.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('QR Code Downloaded!');
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Failed to download');
        }
    };

    const openEditModal = (profile) => {
        setEditProfile(profile);
        setEditData(profile.data || {});
    };

    const handleSaveInline = async () => {
        try {
            const t = toast.loading("Saving changes...");
            const updates = {};
            updates[`users/${auth.currentUser.uid}/profiles/${activeProfile.id}/data`] = editData;
            updates[`users/${auth.currentUser.uid}/profiles/${activeProfile.id}/last_updated`] = new Date().toISOString();
            
            await update(ref(db), updates);
            toast.success("Security Node Updated", { id: t });
        } catch (error) {
            toast.error("Save failed");
        }
    };

    useEffect(() => {
        if (activeProfile) {
            setEditData(activeProfile.data || {});
        }
    }, [selectedProfileId, profiles]);

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="text-primary animate-spin" size={48} />
                <p className="ml-4 text-white uppercase tracking-widest font-black italic">Loading Hub...</p>
            </div>
        );
    }

    if (!auth.currentUser) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Shield size={64} className="text-primary mb-6" />
                <h2 className="text-3xl font-black text-white uppercase mb-4 italic tracking-tighter">Access Denied</h2>
                <Button onClick={() => navigate('/login')}>Login to Continue</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-24 px-4 text-white font-manrope">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
                    <div>
                        <Badge className="bg-primary/20 text-primary border-none mb-4 px-6 py-1 font-black italic tracking-widest uppercase text-[10px]">
                            GUARDIAN HUB
                        </Badge>
                    <div>
                        <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins">
                            DASHBOARD
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[9px] mt-4 flex items-center gap-2">
                            PRIVATE SECURE SUBSYSTEM
                        </p>
                    </div>
                    </div>
                    <div>
                        <Button 
                            className="rounded-2xl font-black shadow-2xl px-10 py-6 bg-primary text-white border-none text-lg italic uppercase tracking-tighter hover:scale-[1.05] transition-all" 
                            onClick={() => navigate('/create-profile')}
                        >
                            <Plus size={24} className="mr-3" /> CREATE NEW QR
                        </Button>
                    </div>
                </header>

                {profiles.length === 0 ? (
                    // ... [Empty State Code remains or is improved]
                    <div className="space-y-12 animate-in fade-in duration-700">
                        {/* [Rest of the empty state from previous step] */}
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins mb-4">
                                START NEW QR
                            </h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Select a category below to secure your identity.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { id: 'people', title: 'People', icon: <User />, desc: 'Emergency Medical Profile', color: 'text-red-500', bg: 'bg-red-500/10' },
                                { id: 'pets', title: 'Pets', icon: <Dog />, desc: 'Lost Pet Identification', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { id: 'valuables', title: 'Valuables', icon: <Briefcase />, desc: 'Lost & Found Recovery', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { id: 'vehicles', title: 'Vehicles', icon: <Car />, desc: 'Emergency Owner Contact', color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
                            ].map((c) => (
                                <button key={c.id} onClick={() => navigate('/create-profile')} className="bg-slate-900 border border-white/5 p-8 rounded-[40px] flex flex-col items-center text-center group hover:border-white/20 transition-all hover:-translate-y-2">
                                    <div className={`${c.bg} ${c.color} w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl transition-transform group-hover:scale-110`}>{c.icon}</div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">{c.title}</h3>
                                    <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{c.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Sidebar List (If multiple) */}
                        {profiles.length > 1 && (
                            <div className="w-full lg:w-72 space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-4">Your Identities</h3>
                                <div className="space-y-2">
                                    {profiles.map(p => (
                                        <button 
                                            key={p.id}
                                            onClick={() => setSelectedProfileId(p.id)}
                                            className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all ${selectedProfileId === p.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                                        >
                                            <div className="shrink-0"><QrCode size={16} /></div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold uppercase tracking-widest truncate">{p.data.name || p.data.petName || p.data.vehicleNumber}</p>
                                                <p className={`text-[8px] uppercase font-black italic opacity-60`}>{p.category}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col xl:flex-row gap-10 bg-slate-900/50 p-8 rounded-[50px] border border-white/5">
                            {/* LEFT: EDIT FORM */}
                            {activeProfile && (
                                <div className="flex-1 space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge className="bg-primary/20 text-primary border-none px-4 py-1 font-black italic text-[9px] mb-2 uppercase tracking-widest">Managing {activeProfile.category}</Badge>
                                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">{activeProfile.data.name || activeProfile.data.petName || activeProfile.data.vehicleNumber}</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleDelete(activeProfile.id)} className="p-3 text-slate-500 hover:text-red-500 bg-slate-950 rounded-xl border border-white/5 transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-8 rounded-[30px] border border-white/5 shadow-inner">
                                        {activeProfile.category === 'people' && (
                                            <>
                                                <Input label="Identity Name" name="name" value={editData.name || ''} onChange={handleEditChange} />
                                                <Input label="Blood Vector" name="bloodGroup" value={editData.bloodGroup || ''} onChange={handleEditChange} />
                                                <div className="md:col-span-2">
                                                    <Input label="Strategic Health Conditions" name="healthIssues" value={editData.healthIssues || ''} onChange={handleEditChange} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Input label="Critical Allergies" name="allergies" value={editData.allergies || ''} onChange={handleEditChange} />
                                                </div>
                                                <Input label="Guardian Contact" name="emergencyContactName" value={editData.emergencyContactName || ''} onChange={handleEditChange} />
                                                <Input label="Comms Link (Phone)" name="emergencyContactPhone" value={editData.emergencyContactPhone || ''} onChange={handleEditChange} />
                                            </>
                                        )}
                                        {/* Other categories would follow same pattern */}
                                        {activeProfile.category !== 'people' && (
                                            <p className="text-slate-500 italic text-sm">Dynamic editor for {activeProfile.category} is active. Update details below.</p>
                                        )}
                                        {activeProfile.category === 'pets' && (
                                             <>
                                                <Input label="Pet Name" name="petName" value={editData.petName || ''} onChange={handleEditChange} />
                                                <Input label="Owner Phone" name="ownerContact" value={editData.ownerContact || ''} onChange={handleEditChange} />
                                             </>
                                        )}
                                        {activeProfile.category === 'valuables' && (
                                             <>
                                                <Input label="Valuable Item" name="itemName" value={editData.itemName || ''} onChange={handleEditChange} />
                                                <Input label="Recovery Message" name="message" value={editData.message || ''} onChange={handleEditChange} />
                                             </>
                                        )}
                                        {activeProfile.category === 'vehicles' && (
                                             <>
                                                <Input label="License Plate" name="vehicleNumber" value={editData.vehicleNumber || ''} onChange={handleEditChange} />
                                                <Input label="Owner Name" name="ownerName" value={editData.ownerName || ''} onChange={handleEditChange} />
                                             </>
                                        )}
                                        
                                        <div className="md:col-span-2 pt-4">
                                            <Button onClick={handleSaveInline} className="w-full bg-primary py-6 rounded-2xl font-black italic tracking-widest text-sm shadow-xl shadow-primary/20 border-none">
                                                SAVE IDENTITY UPDATE
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <Button onClick={() => handleDownload(activeProfile.id, activeProfile.data.name || 'QR')} className="flex-1 bg-white/5 text-white hover:bg-white/10 rounded-2xl py-6 font-black uppercase italic tracking-widest text-xs border border-white/5">
                                            <Download size={18} className="mr-3" /> Download Physical QR
                                        </Button>
                                        <Button onClick={() => setViewScansProfile(activeProfile)} className="flex-1 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-2xl py-6 font-black uppercase italic tracking-widest text-xs border border-indigo-500/20">
                                            <Clock size={18} className="mr-3" /> View Scan History
                                        </Button>
                                        <div className="hidden">
                                            <QRCodeCanvas
                                                id={`qr-${activeProfile.id}`}
                                                value={`${window.location.origin}/qr/${activeProfile.id}`}
                                                size={500}
                                                level="H"
                                                includeMargin={true}
                                                imageSettings={{
                                                    src: `${import.meta.env.BASE_URL}resqr_icon.png`,
                                                    height: 100,
                                                    width: 100,
                                                    excavate: true,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* RIGHT: LIVE PREVIEW FRAME */}
                            <div className="w-full xl:w-[400px] flex flex-col items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6">Live Responder View</h4>
                                <div className="relative w-full aspect-[9/19] max-w-[320px] bg-slate-950 rounded-[60px] border-[8px] border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
                                    {/* Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />
                                    {/* Dynamic Iframe for Preview */}
                                    <iframe 
                                        src={`${window.location.origin}/qr/${activeProfile?.id}`}
                                        className="w-full h-full border-none pointer-events-none"
                                        title="QR Preview"
                                    />
                                    {/* Link Overlay */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                                        <Link to={`/qr/${activeProfile?.id}`} target="_blank" className="bg-primary/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 shadow-xl flex items-center gap-2">
                                            <ExternalLink size={10} /> Open Live Profile
                                        </Link>
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-600 font-bold mt-6 text-center uppercase tracking-widest max-w-[200px]">This is exactly what responders see when they scan your tag.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* RECENT ACTIVITY FEED - RESTORED AS BEFORE */}
                {profiles.length > 0 && (
                    <div className="pt-12 border-t border-white/5">
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <Clock size={24} className="text-primary" /> Recent System Activity
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profiles.flatMap(p => 
                                p.scans ? Object.entries(p.scans).map(([sid, scan]) => ({ ...scan, profileName: p.data.name || p.data.petName || p.data.itemName || p.data.vehicleNumber })) : []
                            )
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .slice(0, 6)
                            .map((scan, i) => (
                                <div key={i} className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <QrCode size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{scan.profileName}</p>
                                        <p className="text-white font-bold truncate uppercase italic text-sm">{scan.location}</p>
                                        <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-1">{scan.date} • {scan.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* EDIT MODAL */}
            <Modal isOpen={!!editProfile} onClose={() => setEditProfile(null)} title={`Edit ${editProfile?.category || ''} Profile`}>
                {editProfile && (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {editProfile.category === 'people' && (
                            <>
                                <Input label="Full Name" name="name" value={editData.name || ''} onChange={handleEditChange} />
                                <Input label="Blood Group" name="bloodGroup" value={editData.bloodGroup || ''} onChange={handleEditChange} />
                                <Input label="Health Issues" name="healthIssues" value={editData.healthIssues || ''} onChange={handleEditChange} />
                                <Input label="Allergies" name="allergies" value={editData.allergies || ''} onChange={handleEditChange} />
                                <Input label="Emergency Contact Name" name="emergencyContactName" value={editData.emergencyContactName || ''} onChange={handleEditChange} />
                                <Input label="Relation" name="emergencyContactRelation" value={editData.emergencyContactRelation || ''} onChange={handleEditChange} />
                                <Input label="Emergency Contact Phone" name="emergencyContactPhone" value={editData.emergencyContactPhone || ''} onChange={handleEditChange} />
                            </>
                        )}
                        {editProfile.category === 'pets' && (
                            <>
                                <Input label="Pet Name" name="petName" value={editData.petName || ''} onChange={handleEditChange} />
                                <Input label="Pet Type" name="petType" value={editData.petType || ''} onChange={handleEditChange} />
                                <Input label="Owner Contact" name="ownerContact" value={editData.ownerContact || ''} onChange={handleEditChange} />
                                <Input label="Vaccination Info" name="vaccinationInfo" value={editData.vaccinationInfo || ''} onChange={handleEditChange} />
                                <Input label="Reward" name="reward" value={editData.reward || ''} onChange={handleEditChange} />
                            </>
                        )}
                        {editProfile.category === 'valuables' && (
                            <>
                                <Input label="Valuable Name" name="itemName" value={editData.itemName || ''} onChange={handleEditChange} />
                                <Input label="Owner Contact" name="ownerContact" value={editData.ownerContact || ''} onChange={handleEditChange} />
                                <Input label="Message" name="message" value={editData.message || ''} onChange={handleEditChange} />
                                <Input label="Reward" name="reward" value={editData.reward || ''} onChange={handleEditChange} />
                            </>
                        )}
                        {editProfile.category === 'vehicles' && (
                            <>
                                <Input label="Vehicle Number" name="vehicleNumber" value={editData.vehicleNumber || ''} onChange={handleEditChange} />
                                <Input label="Owner Name" name="ownerName" value={editData.ownerName || ''} onChange={handleEditChange} />
                                <Input label="Contact Number" name="contactNumber" value={editData.contactNumber || ''} onChange={handleEditChange} />
                                <Input label="Emergency Backup" name="emergencyContact" value={editData.emergencyContact || ''} onChange={handleEditChange} />
                            </>
                        )}
                        <div className="pt-4 flex gap-4">
                            <Button variant="outline" className="flex-1" onClick={() => setEditProfile(null)}>Cancel</Button>
                            <Button className="flex-1 bg-primary border-none shadow-lg shadow-primary/20" onClick={handleSaveEdit}>Save Changes</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* SCANS MODAL */}
            <Modal isOpen={!!viewScansProfile} onClose={() => setViewScansProfile(null)} title="Intelligence Logs">
                {viewScansProfile && (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {viewScansProfile.scans ? (
                            Object.entries(viewScansProfile.scans).reverse().map(([id, scan], i) => (
                                <div key={id} className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex flex-shrink-0 items-center justify-center">
                                        <Clock size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-white uppercase italic tracking-tight truncate">{scan.location}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{scan.date} • {scan.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <QrCode size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
                                <p className="text-slate-500 font-bold uppercase italic tracking-widest text-xs">No Scans Recorded Yet</p>
                            </div>
                        )}
                        <Button className="w-full mt-4 bg-slate-800" onClick={() => setViewScansProfile(null)}>Close</Button>
                    </div>
                )}
            </Modal>

        </div>
    );
}
