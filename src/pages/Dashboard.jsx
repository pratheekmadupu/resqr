import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    User, Dog, Briefcase, Car, Plus, QrCode, Download, Edit3, 
    Trash2, Clock, Loader2, Shield, Eye, Lock, RefreshCw, X
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
    const qrRef = useRef(null);

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
                    const myLegacy = Object.entries(allLegacy).filter(([id, d]) => d.uid === uid);
                    
                    for (const [oldId, data] of myLegacy) {
                        const newId = `${uid}_${oldId}`;
                        const newProfileRef = ref(db, `users/${uid}/profiles/${newId}`);
                        
                        // Check if already migrated
                        const checkSnap = await get(newProfileRef);
                        if (!checkSnap.exists()) {
                            await update(newProfileRef, {
                                category: 'people',
                                data: { ...data, name: data.name || 'Migrated Profile' },
                                payment_status: data.payment_status || 'paid',
                                migrated: true,
                                createdAt: new Date().toISOString(),
                            });
                        }
                        // We do not delete legacy immediately to prevent breaking existing printed QRs
                        // They will just forward to the legacy path which we handle in QRScanPage
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
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('RESQR ID', downloadCanvas.width / 2, padding / 2 + 10);
            
            ctx.font = 'bold 16px Arial';
            ctx.fillText(name.toUpperCase(), downloadCanvas.width / 2, downloadCanvas.height - 30);
            ctx.font = 'normal 14px Arial';
            ctx.fillText('SCAN IN EMERGENCY', downloadCanvas.width / 2, downloadCanvas.height - 10);

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

    const handleSaveEdit = async () => {
        try {
            const t = toast.loading("Updating records...");
            const updates = {};
            updates[`users/${auth.currentUser.uid}/profiles/${editProfile.id}/data`] = editData;
            updates[`users/${auth.currentUser.uid}/profiles/${editProfile.id}/last_updated`] = new Date().toISOString();
            
            await update(ref(db), updates);
            toast.success("Profile updated", { id: t });
            setEditProfile(null);
        } catch (error) {
            toast.error("Update failed");
            console.error(error);
        }
    };

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
                        <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins">
                            Command <span className="text-primary">Center</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] italic mt-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            NETWORK SECURE & ACTIVE
                        </p>
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
                    <div className="space-y-12 animate-in fade-in duration-700">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins mb-6">
                                INITIALIZE <span className="text-primary">SECURE</span> NODE
                            </h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">Choose a category to generate your first Guardian tag.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { id: 'people', title: 'Medical ID', icon: <User size={32} />, color: 'text-red-500', bg: 'bg-red-500/10', desc: 'Critical Medical Vault' },
                                { id: 'pets', title: 'Pets', icon: <Dog size={32} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Secure Pet Retrieval' },
                                { id: 'valuables', title: 'Valuables', icon: <Briefcase size={32} />, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Lost Item Recovery' },
                                { id: 'vehicles', title: 'Vehicles', icon: <Car size={32} />, color: 'text-yellow-500', bg: 'bg-yellow-500/10', desc: 'Parking & Security' }
                            ].map((c) => (
                                <button 
                                    key={c.id} 
                                    onClick={() => navigate('/create-profile')}
                                    className="bg-slate-900 border border-white/5 p-8 rounded-[40px] flex flex-col items-center text-center group hover:border-white/20 transition-all hover:-translate-y-2"
                                >
                                    <div className={`${c.bg} ${c.color} w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl transition-transform group-hover:scale-110`}>
                                        {c.icon}
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">{c.title}</h3>
                                    <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{c.desc}</p>
                                    <div className="mt-6 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        Create Now +
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {profiles.map(profile => {
                            const isPeople = profile.category === 'people';
                            const isPets = profile.category === 'pets';
                            const isValuables = profile.category === 'valuables';
                            const isVehicles = profile.category === 'vehicles';

                            const categoryNames = {
                                people: 'Medical ID',
                                pets: 'Pets',
                                valuables: 'Valuables',
                                vehicles: 'Vehicles'
                            };

                            const Icon = isPeople ? User : isPets ? Dog : isValuables ? Briefcase : Car;
                            const color = isPeople ? 'text-red-500' : isPets ? 'text-emerald-500' : isValuables ? 'text-blue-500' : 'text-yellow-500';
                            const bgColor = isPeople ? 'bg-red-500' : isPets ? 'bg-emerald-500' : isValuables ? 'bg-blue-500' : 'bg-yellow-500';
                            const bgSoft = isPeople ? 'bg-red-500/10' : isPets ? 'bg-emerald-500/10' : isValuables ? 'bg-blue-500/10' : 'bg-yellow-500/10';
                            
                            const title = isPeople ? profile.data.name : isPets ? profile.data.petName : isValuables ? profile.data.itemName : profile.data.vehicleNumber;
                            const subtitle = isPeople ? profile.data.bloodGroup : isPets ? profile.data.petType : isValuables ? 'Valuables' : profile.data.ownerName;

                            const qrUrl = `${window.location.origin}/qr/${profile.id}`;

                            return (
                                <Card key={profile.id} className="bg-slate-900 border-white/5 shadow-2xl rounded-[40px] p-8 relative overflow-hidden flex flex-col">
                                    <div className={`absolute top-0 left-0 w-full h-1 ${bgColor}`} />
                                    
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl ${bgSoft} ${color} border border-white/5`}>
                                            <Icon size={28} />
                                        </div>
                                        <Badge className={`uppercase italic font-black text-[9px] tracking-widest bg-slate-950 px-4 py-1 border-none ${color}`}>
                                            {categoryNames[profile.category] || profile.category}
                                        </Badge>
                                    </div>
                                    
                                    <div className="mb-8">
                                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter font-poppins">{title}</h3>
                                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">{subtitle}</p>
                                    </div>

                                    {/* HIDDEN QR CODE FOR RENDER/DOWNLOAD */}
                                    <div className="hidden">
                                        <QRCodeCanvas
                                            id={`qr-${profile.id}`}
                                            value={qrUrl}
                                            size={300}
                                            level="L"
                                            includeMargin={true}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-auto">
                                        <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                                            <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest h-12 italic">
                                                <Eye size={14} className="mr-2" /> View Public
                                            </Button>
                                        </a>
                                        <Button 
                                            onClick={() => handleDownload(profile.id, title)}
                                            className="w-full bg-slate-950 border-white/10 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest h-12 shadow-lg italic"
                                        >
                                            <Download size={14} className="mr-2" /> Download QR
                                        </Button>
                                        
                                        <Button 
                                            onClick={() => openEditModal(profile)}
                                            className="w-full bg-primary/20 text-primary hover:bg-primary/30 rounded-2xl text-[10px] font-black uppercase tracking-widest h-12 italic border-none"
                                        >
                                            <Edit3 size={14} className="mr-2" /> Edit Info
                                        </Button>

                                        <Button 
                                            onClick={() => setViewScansProfile(profile)}
                                            className="w-full bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest h-12 italic border-none"
                                        >
                                            <Clock size={14} className="mr-2" /> Scans ({profile.scans ? Object.keys(profile.scans).length : 0})
                                        </Button>
                                    </div>

                                    <button 
                                        onClick={() => handleDelete(profile.id)}
                                        className="absolute top-8 right-8 text-slate-600 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </Card>
                            );
                        })}
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
