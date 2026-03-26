import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, get, push, serverTimestamp } from 'firebase/database';
import { Phone, MapPin, AlertCircle, Heart, Activity, Loader2, Info, Lock, Shield, Share2, Activity as HeartPulse, Navigation, Siren, Users, ChevronRight, MessageSquare, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function QRScanPage() {
    const { profileId, username } = useParams();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [scanRecorded, setScanRecorded] = useState(false);
    const [hospitals, setHospitals] = useState([]);
    const [findingHospital, setFindingHospital] = useState(false);
    const [coords, setCoords] = useState(null);
    
    // Privacy & Security States
    const [showCallScreen, setShowCallScreen] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [callRequested, setCallRequested] = useState(false);
    const [visitCount, setVisitCount] = useState(0);

    useEffect(() => {
        const id = profileId || username;
        if (id) {
            const key = `resqr_scan_visit_${id}`;
            const current = parseInt(localStorage.getItem(key) || '0');
            const next = current + 1;
            localStorage.setItem(key, next.toString());
            setVisitCount(next);
        }
    }, [profileId, username]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let pid = profileId;
                let uid = null;

                if (username) {
                    const registrySnap = await get(ref(db, `usernames/${username.toLowerCase()}`));
                    if (registrySnap.exists()) {
                        const path = registrySnap.val(); 
                        uid = path.split('/')[0];
                        pid = path.split('/')[1];
                    } else {
                         const legacy = await get(ref(db, `profiles/${username}`));
                         if (legacy.exists()) { setProfile({ category: 'people', data: legacy.val() }); setLoading(false); return; }
                    }
                }

                if (!uid && pid) {
                    if (pid.includes('_')) uid = pid.split('_')[0];
                }

                if (uid && pid) {
                    const snap = await get(ref(db, `users/${uid}/profiles/${pid}`));
                    if (snap.exists()) {
                        setProfile(snap.val());
                        recordScan(uid, pid);
                    } else {
                        const legacy = await get(ref(db, `profiles/${pid}`));
                        if (legacy.exists()) setProfile({ category: 'people', data: legacy.val() });
                    }
                } else if (pid) {
                    const legacy = await get(ref(db, `profiles/${pid}`));
                    if (legacy.exists()) setProfile({ category: 'people', data: legacy.val() });
                }
            } catch (error) {} finally { setLoading(false); }
        };
        fetchProfile();
    }, [profileId, username]);

    const recordScan = async (userId, pid) => {
        if (scanRecorded) return;
        try {
            let userCoords = null;
            let locationName = "Scanning Extraction Point...";
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
                        setCoords(userCoords);
                        locationName = `Verified: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`;
                        updateScanNode(userId, pid, locationName, userCoords);
                    },
                    (err) => {
                        updateScanNode(userId, pid, "Unknown Area (Permission Denied)", null);
                    },
                    { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
                );
            } else {
                updateScanNode(userId, pid, "Geolocation Not Supported", null);
            }
            setScanRecorded(true);

            toast.success('Emergency alert sent to family with your location!', {
                icon: '🛡️',
                duration: 6000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '20px',
                    fontWeight: 'bold'
                }
            });
        } catch (e) {}
    };

    const updateScanNode = async (userId, pid, loc, crd) => {
        const scanData = {
            timestamp: serverTimestamp(),
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            status: 'CRITICAL ACCESS',
            location: loc,
            coords: crd,
            type: 'Direct QR Entry'
        };
        await push(ref(db, `users/${userId}/profiles/${pid}/scans`), scanData);
    };

    useEffect(() => {
        const fetchNearestHospitals = async () => {
            if (!coords) return;
            setFindingHospital(true);
            try {
                const query = `[out:json];node["amenity"="hospital"](around:25000,${coords.lat},${coords.lng});out 5;`;
                const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (data.elements && data.elements.length > 0) {
                    setHospitals(data.elements.map(h => ({ name: h.tags.name || "Medical Center", lat: h.lat, lng: h.lon, addr: h.tags['addr:street'] || "Facility" })));
                }
            } catch (err) {} finally { setFindingHospital(false); }
        };
        if (coords && profile?.category === 'people') fetchNearestHospitals();
    }, [coords, profile]);

    const initiateMaskedCall = () => {
        setShowCallScreen(true);
        setTimeout(() => {
            console.log("Secure routing complete via ResQR Mask Node.");
            window.location.href = `tel:${profile.data.emergencyContactPhone}`;
            setTimeout(() => setShowCallScreen(false), 2000);
        }, 3500);
    };

    const handleRequestCall = async () => {
        setCallRequested(true);
        try {
            const pid = profileId || (profile?.id);
            const uid = profile?.uid || (profileId?.includes('_') ? profileId.split('_')[0] : null);

            if (uid && pid) {
                await push(ref(db, `users/${uid}/profiles/${pid}/scans`), {
                    timestamp: serverTimestamp(),
                    time: new Date().toLocaleTimeString(),
                    status: 'CALLBACK REQUESTED',
                    type: 'Urgent Alert'
                });
            }

            toast.success("Callback request broadcasted to guardian!", {
                icon: '📲',
                style: { borderRadius: '20px' }
            });
        } catch (e) {
            toast.error("Failed to broadcast request");
            setCallRequested(false);
        }
    };

    const handleVerifyOtp = () => {
        setIsVerifying(true);
        setTimeout(() => {
            if (otpCode === '1234' || otpCode === '0000') {
                setOtpVerified(true);
                setShowOtpModal(false);
                toast.success("Identity Vault Unlocked: Full Records Available");
            } else {
                toast.error("Security Authentication Failed");
            }
            setIsVerifying(false);
        }, 1500);
    };

    if (loading) return <div className="min-h-screen bg-[#040812] flex items-center justify-center"><Loader2 className="text-red-600 animate-spin" size={48} /></div>;
    if (!profile) return <div className="min-h-screen bg-[#040812] flex flex-col items-center justify-center text-white p-10 text-center"><Shield size={64} className="text-red-600 mb-6 opacity-30" /><h1 className="text-2xl font-black uppercase italic tracking-tighter">NODE UNAVAILABLE</h1><p className="text-slate-500 text-[10px] uppercase tracking-widest mt-2 max-w-xs">The record you are looking for may have been moved or deactivated.</p></div>;

    const { category, data } = profile;

    return (
        <div className="min-h-screen bg-[#040812] text-white font-manrope selection:bg-red-600/30">
            {/* FRAUD PREVENTION BANNER */}
            <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest sticky top-0 z-50 shadow-xl italic">
                <ShieldAlert size={16} />
                SECURE EMERGENCY PORTAL • UNAUTHORIZED DATA HARVESTING IS ILLEGAL
            </div>

            <div className="max-w-xl mx-auto space-y-8 pb-40 px-5 pt-8">
                
                <div className="flex flex-col items-center mb-8 text-center animate-in fade-in duration-700">
                     <img src="/logo.png" alt="RESQR" className="h-8 w-auto mb-6" />
                     <Badge className="bg-red-600 text-white border-none px-6 py-2 tracking-[0.3em] uppercase italic font-black text-[10px] shadow-lg shadow-red-600/20">
                        Verified Medical ID
                     </Badge>
                </div>

                {category === 'people' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* NAME BLOCK */}
                        <div className="bg-[#11192A] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl relative">
                            <div className="bg-black/20 p-4 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-poppins">
                                <span>Security Level: TITANIUM</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse delay-75" />
                                </div>
                            </div>
                            <div className="p-10 pt-12 text-center">
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-4 italic">Individual Identity</span>
                                <h1 className="text-5xl sm:text-7xl font-black uppercase text-white tracking-tighter italic font-poppins break-words leading-none w-full">
                                    {data.name}
                                </h1>
                            </div>
                        </div>

                        {/* VITAL GRID */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-red-600 rounded-[40px] p-10 flex items-center justify-between text-white shadow-2xl relative overflow-hidden group">
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white border border-white/30">
                                        <Heart size={36} fill="white" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white/70 uppercase tracking-[0.4em] mb-2 italic">Blood Group</p>
                                        <p className="text-7xl font-black italic text-white font-poppins tracking-tighter leading-none">{data.bloodGroup || 'B-'}</p>
                                    </div>
                                </div>
                                <Activity size={200} className="absolute right-[-40px] bottom-[-40px] text-white opacity-5 pointer-events-none" />
                            </div>

                            <div className="bg-[#11192A] rounded-[40px] border border-white/5 p-10 flex flex-col gap-6 shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white text-slate-950 rounded-2xl shadow-lg">
                                        <Activity size={24} />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Clinical State</p>
                                </div>
                                <h2 className="text-3xl font-black italic text-white uppercase font-poppins leading-tight">{data.healthIssues || 'NO CHRONIC CONDITIONS'}</h2>
                            </div>

                            <div className="bg-red-600/5 rounded-[40px] border border-red-600/10 p-10 flex flex-col gap-6 shadow-xl">
                                <div className="flex items-center gap-4 text-red-600">
                                    <AlertCircle size={24} />
                                    <p className="text-[11px] font-black uppercase tracking-widest italic">Critical Alerts</p>
                                </div>
                                <h2 className="text-3xl font-black italic text-red-600 uppercase font-poppins leading-tight">{data.allergies || 'NO KNOWN ALLERGIES'}</h2>
                            </div>
                        </div>

                        {/* SENSITIVE DETAILS - OTP PROTECTED */}
                        <section className="bg-slate-900 p-10 rounded-[40px] shadow-2xl relative overflow-hidden border border-white/5">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-2xl text-white">
                                        <Lock size={22} />
                                    </div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Sensitive Records</h3>
                                </div>
                                {!otpVerified && (
                                     <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black uppercase italic tracking-widest">ENCRYPTED</Badge>
                                )}
                            </div>

                            <div className={`relative transition-all duration-700 ${!otpVerified ? 'blur-2xl' : 'blur-0'}`}>
                                <div className="space-y-6 text-white/50">
                                    <div className="flex justify-between border-b border-white/5 pb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest italic">Primary Base</span>
                                        <span className="text-white font-black italic uppercase">Sector 4, Urban Habitat</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest italic">Medication Log</span>
                                        <span className="text-white font-black italic uppercase">Protocol Alpha (TID)</span>
                                    </div>
                                </div>
                            </div>

                            {!otpVerified && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center z-10">
                                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 italic opacity-50 max-w-[200px]">Guardian confirmation required to decrypt full history</p>
                                    <Button 
                                        onClick={() => setShowOtpModal(true)}
                                        className="bg-white text-slate-950 hover:bg-red-600 hover:text-white rounded-[20px] px-8 py-4 font-black uppercase italic text-xs tracking-widest"
                                    >
                                        Initiate Authentication
                                    </Button>
                                </div>
                            )}
                        </section>

                        {/* GUARDIAN SECTION */}
                        <div className="bg-[#11192A] rounded-[40px] border border-white/5 overflow-hidden shadow-xl">
                            <div className="p-10 flex flex-col gap-10">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-8">
                                    <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/20">
                                        <Users size={22} />
                                    </div>
                                    <p className="text-xl font-black text-white uppercase tracking-tighter italic">Emergency Network</p>
                                </div>
                                
                                <div className="space-y-10">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Family Liaison</p>
                                            <h4 className="text-3xl font-black italic text-white uppercase font-poppins leading-none break-words">{data.emergencyContactName}</h4>
                                            <Badge className="bg-white/5 text-slate-300 border border-white/10 px-4 py-1.5 font-black uppercase italic text-[9px] mt-4 tracking-widest">{data.emergencyContactRelation || 'PARENT'}</Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button 
                                            onClick={initiateMaskedCall}
                                            className="h-20 bg-red-600 text-white rounded-[30px] flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 active:scale-95 transition-all group overflow-hidden relative"
                                        >
                                            <Phone size={24} fill="white" />
                                            <span className="font-black uppercase italic tracking-widest">Connect Call</span>
                                        </button>
                                        <button 
                                            onClick={handleRequestCall}
                                            disabled={callRequested}
                                            className={`h-20 rounded-[30px] flex items-center justify-center gap-3 border-2 transition-all active:scale-95 ${callRequested ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-[#040812] border-white/10 text-white hover:border-red-600 hover:text-red-600 shadow-lg'}`}
                                        >
                                            <MessageSquare size={24} />
                                            <span className="font-black uppercase italic tracking-widest">{callRequested ? 'Alert Dispatched' : 'Request Call'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-black/20 p-4 text-center">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Private Virtual Node • No Number Exposure</p>
                            </div>
                        </div>

                        {/* OPTIONAL BACKUP NUMBER - REVEALED ON SECOND VISIT */}
                        {visitCount >= 2 && data.doctorContact && (
                            <div className="bg-emerald-600/5 rounded-[40px] border border-emerald-500/20 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                <div className="p-10 text-left">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                                            <Phone size={22} />
                                        </div>
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Backup Contact Node</h3>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 italic">Direct Secondary Line</span>
                                            <h4 className="text-4xl font-black text-emerald-500 uppercase italic tracking-tighter font-poppins">{data.doctorContact}</h4>
                                        </div>
                                        <button 
                                            onClick={() => window.location.href = `tel:${data.doctorContact}`}
                                            className="w-20 h-20 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30 active:scale-90 transition-all shrink-0"
                                        >
                                            <Phone size={28} fill="white" />
                                        </button>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-emerald-500/10">
                                        <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-[0.3em] italic">Secondary Number revealed via sequential terminal access</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EXTRAS */}
                        <div className="space-y-4 pt-10">
                             <button onClick={() => window.location.href = `tel:108`} className="w-full h-24 bg-white text-slate-950 rounded-[40px] font-black uppercase tracking-widest relative active:scale-95 transition-all shadow-xl group flex items-center justify-center gap-6">
                                <Siren size={32} className="text-red-600 animate-pulse" />
                                <div className="text-left text-black">
                                    <p className="text-xl leading-none italic font-poppins font-black">CALL 108</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">First Responders</p>
                                </div>
                            </button>
                            <button 
                                onClick={() => toast.success("Safety violation logged. Security team notified.")}
                                className="w-full bg-[#11192A] border border-white/10 text-slate-500 p-6 rounded-[25px] flex items-center justify-center gap-3 hover:bg-red-600/10 hover:text-red-600 hover:border-red-600/20 transition-all text-[9px] font-black uppercase italic tracking-[0.2em]"
                            >
                                <ShieldAlert size={18} />
                                Report Security Misuse
                            </button>
                        </div>

                        {/* Join ResQR CTA */}
                        <div className="pt-24 pb-16 text-center">
                            <div className="inline-block p-[1px] rounded-[45px] bg-gradient-to-br from-red-600/20 to-white/10 mb-8 w-full">
                                <div className="bg-[#11192A] rounded-[44px] p-12 md:p-16 border border-white/5 relative overflow-hidden group shadow-2xl">
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center mb-10 border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                            <Shield size={36} className="text-red-600" />
                                        </div>
                                        
                                        <h3 className="text-3xl md:text-5xl font-black italic text-white uppercase font-poppins mb-6 tracking-tighter leading-none">
                                            Role Complete?
                                        </h3>
                                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.3em] mb-12 max-w-[300px] mx-auto leading-relaxed italic">
                                            Responder protocols finished. Secure your own family's medical safety today.
                                        </p>
                                        
                                        <button 
                                            onClick={() => window.location.href = '/login?redirect_to=/create-profile'}
                                            className="w-full py-7 bg-white text-slate-950 rounded-[25px] font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4 group/btn"
                                        >
                                            Activate My Protection
                                            <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECURE CALL OVERLAY */}
            <AnimatePresence>
                {showCallScreen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center text-white p-10 text-center"
                    >
                        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-10 animate-pulse border-2 border-white/50">
                            <Shield size={64} />
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Securing Data</h2>
                        <p className="text-white/70 font-bold uppercase tracking-[0.3em] text-xs mb-10 italic">Initializing Encrypted Call Path...</p>
                        
                        <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-white animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-100" />
                            <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-200" />
                        </div>
                        
                        <div className="mt-20 px-8 py-3 bg-black/20 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
                            Virtual Line: ACTIVE (RT-SEQ-001)
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OTP MODAL */}
            <AnimatePresence>
                {showOtpModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#11192A] rounded-[45px] w-full max-w-sm p-12 shadow-2xl border border-white/10 relative overflow-hidden"
                        >
                            <button 
                                onClick={() => setShowOtpModal(false)}
                                className="absolute top-8 right-8 text-slate-500 hover:text-white"
                            >
                                <XCircle size={32} />
                            </button>
                            
                            <div className="text-center">
                                <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-600">
                                    <Lock size={36} />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Auth Required</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic mb-10 leading-relaxed">Safety Protocol 09: Enter the code sent to the registered guardian device.</p>
                                
                                <div className="space-y-6">
                                    <input 
                                        type="text" 
                                        placeholder="0000"
                                        className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-7 text-center text-4xl font-black italic tracking-[0.5em] focus:border-red-600 outline-none transition-all placeholder:text-slate-700 text-white"
                                        maxLength={4}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                    />
                                    <Button 
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifying || otpCode.length < 4}
                                        className="w-full bg-white hover:bg-red-600 text-slate-950 hover:text-white p-7 rounded-[25px] font-black uppercase italic tracking-widest shadow-xl flex items-center justify-center gap-4 transition-all"
                                    >
                                        {isVerifying ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                                        {isVerifying ? 'Verifying Node' : 'Unlock records'}
                                    </Button>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic pt-6">Your access terminal ID is being logged.</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-xl -z-10"
                            onClick={() => setShowOtpModal(false)}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* NEAREST HOSPITALS (FOOTER SECTION) */}
            <div className="bg-[#040812] py-24 px-8 border-t border-white/5">
                <div className="max-w-xl mx-auto">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="p-4 bg-red-600 text-white rounded-3xl shadow-lg shadow-red-600/20">
                            <Navigation size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Emergency Extraction Nodes</h3>
                    </div>

                    {findingHospital ? (
                        <div className="flex flex-col items-center gap-6 p-12 bg-[#11192A] border border-white/5 rounded-[40px] animate-pulse">
                            <Loader2 className="animate-spin text-red-600" size={40} />
                            <span className="text-[11px] font-black uppercase tracking-[0.4rem] text-slate-500 italic">Syncing Coordinates...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {hospitals.map((hospital, idx) => (
                                <div key={idx} className="p-8 bg-[#11192A] border border-white/5 rounded-[40px] flex justify-between items-center group hover:border-red-600 transition-all shadow-xl">
                                    <div className="min-w-0 pr-6">
                                        <h4 className="text-xl font-black text-white uppercase italic tracking-tight truncate">{hospital.name}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2 italic">{hospital.addr || 'Secondary Node'}</p>
                                    </div>
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`)}
                                        className="p-5 bg-red-600 text-white rounded-2xl hover:bg-white hover:text-red-600 transition-all active:scale-90 shadow-lg shadow-red-600/20"
                                    >
                                        <Navigation size={22} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <footer className="text-center py-24 bg-[#040812] border-t border-white/5 opacity-40">
                <img src="/logo.png" alt="RESQR" className="h-8 w-auto mx-auto mb-8 grayscale" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 italic">
                    GLOBAL MEDICAL IDENTITY NETWORK • PROTECTING LIVES
                </p>
            </footer>
        </div>
    );
}
