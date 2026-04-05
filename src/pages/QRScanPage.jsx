import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Phone, MapPin, AlertCircle, Heart, Activity as ActivityIcon, Loader2, Info, Lock, Shield, Share2, Activity as HeartPulse, Navigation, Siren, Users, ChevronRight, MessageSquare, ShieldAlert, CheckCircle2, XCircle, Key } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { db, auth } from '../lib/firebase';
import { ref, get, push, serverTimestamp } from 'firebase/database';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
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
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [accessCode, setAccessCode] = useState(null);
    const [callRequested, setCallRequested] = useState(false);
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [visitCount, setVisitCount] = useState(0);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);

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
             const id = profileId || username;
             if (!id) return setLoading(false);
             
             try {
                let snap = await get(ref(db, `profiles/${id}`));
                
                if (!snap.exists()) {
                    const regSnap = await get(ref(db, `usernames/${id.toLowerCase()}`));
                    if (regSnap.exists()) {
                        const path = regSnap.val();
                        const robustPath = (path.includes('/profiles/') || path.includes('profiles/')) 
                            ? path 
                            : path.replace('/', '/profiles/');
                        snap = await get(ref(db, `users/${robustPath}`));
                    }
                }
                
                if (!snap.exists() && id.includes('_')) {
                    const [uid, pid] = id.split('_');
                    snap = await get(ref(db, `users/${uid}/profiles/${id}`));
                }

                if (snap.exists()) {
                    const raw = snap.val();
                    const profileData = { ...raw, ...(raw.data || {}) }; 
                    const uid = raw.uid || (id.includes('_') ? id.split('_')[0] : (snap.ref.parent?.parent?.key));
                    const profileCategory = raw.category || 'people';
                    
                    setProfile({ 
                        category: profileCategory, 
                        data: profileData, 
                        id, 
                        uid 
                    });
                    
                    if (uid) recordScan(uid, id, profileData);
                }
             } catch (err) {
                console.error("Fetch Error:", err);
             } finally {
                setLoading(false);
             }
        };
        fetchProfile();
    }, [profileId, username]);

    const recordScan = async (userId, pid, profileData) => {
        if (scanRecorded) return;
        setIsTransmitting(true);
        
        try {
            let lat = null;
            let lng = null;
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { 
                        timeout: 10000, 
                        maximumAge: 0, 
                        enableHighAccuracy: true 
                    });
                });
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                setCoords({ lat, lng });
            } catch (err) {
                console.warn("Geolocation signal lost.");
            }

            const scanData = {
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'QR SCAN ALERT',
                coords: (lat && lng) ? { lat, lng } : null
            };

            const targetPid = pid || profileId || (profile?.id);
            const targetUid = userId || (profile?.uid);

            if (targetPid) await push(ref(db, `profiles/${targetPid}/scans`), scanData);
            if (targetUid && targetPid) await push(ref(db, `users/${targetUid}/profiles/${targetPid}/scans`), scanData);

            setScanRecorded(true);
        } catch (e) {
            console.error("Signal Failure:", e);
        } finally {
            setIsTransmitting(false);
        }
    };

    const handleSendLocation = async () => {
        if (!coords) {
            toast.loading("Handshaking with satellites...");
            try {
                const pos = await new Promise((res, rej) => {
                    navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000, enableHighAccuracy: true });
                });
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCoords(loc);
                toast.dismiss();
                triggerWhatsApp(loc);
            } catch (err) {
                toast.dismiss();
                toast.error("GPS Signal Offline.");
            }
        } else {
            triggerWhatsApp(coords);
        }
    };

    const triggerWhatsApp = (location) => {
        const rawPh = profile.data.emergencyContactPhone || profile.data.ownerContact || profile.data.contactNumber;
        const sanPh = rawPh?.replace(/[^0-9+]/g, '');
        if (sanPh) {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
            const waMessage = encodeURIComponent(`🚨 *RESQR EMERGENCY ALERT* 🚨\n\nI have just scanned the medical profile ID of *${(profile.data?.name || "A Patient").toUpperCase()}*.\n\n📍 *CURRENT LOCATION:* ${mapsUrl}\n\n⚕️ *PROTOCOL:* High Priority Rescue Dispatch Requested.`);
            const waPhone = sanPh.startsWith('+') ? sanPh.substring(1) : sanPh;
            window.open(`https://wa.me/${waPhone}?text=${waMessage}`, '_blank');
        } else {
            toast.error("Emergency contact number missing.");
        }
    };

    if (loading) return <div className="min-h-screen bg-[#040812] flex items-center justify-center"><Loader2 className="text-red-600 animate-spin" size={48} /></div>;
    if (!profile) return <div className="min-h-screen bg-[#040812] flex flex-col items-center justify-center text-white p-10 text-center"><Shield size={64} className="text-red-600 mb-6 opacity-30" /><h1 className="text-2xl font-black uppercase italic tracking-tighter">NODE UNAVAILABLE</h1></div>;

    const { category, data } = profile;

    return (
        <div className="min-h-screen bg-[#040812] text-white font-manrope selection:bg-red-600/30">
            {/* FRAUD PREVENTION BANNER */}
            <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest sticky top-0 z-50 shadow-xl italic">
                <ShieldAlert size={16} />
                EMERGENCY SCAN SIGNAL DETECTED. LOCATION LOGGING ACTIVE.
            </div>

            <div className="max-w-xl mx-auto space-y-8 pb-40 px-5 pt-12">
                <div className="flex flex-col items-center mb-12 text-center animate-in fade-in duration-700">
                     <img src="/logo.png" alt="RESQR" className="h-10 w-auto mb-8" />
                     <Badge className="bg-red-600 text-white border-none px-8 py-3 tracking-[0.4em] uppercase italic font-black text-[11px] shadow-2xl shadow-red-600/30">
                        Verified Rescue Identity
                     </Badge>
                </div>

                {category === 'people' ? (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* 1. Name of the user */}
                        <div className="bg-[#11192A] rounded-[48px] border border-white/5 p-16 text-center shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
                            <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] block mb-6 italic">Individual Identity Node</span>
                            <h1 className="text-6xl sm:text-8xl font-black uppercase text-white tracking-tighter italic font-poppins break-words leading-none w-full">
                                {(data?.name || data?.fullName || "IDENTITY NODE").toUpperCase()}
                            </h1>
                        </div>

                        {/* 2. Blood Group */}
                        <div className="bg-red-600 rounded-[48px] p-16 flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                            <div className="flex flex-col items-center gap-6 relative z-10 text-center">
                                <p className="text-[14px] font-black text-white/80 uppercase tracking-[0.6em] italic">Critical Vital: Blood Group</p>
                                <p className="text-[10rem] font-black italic text-white font-poppins tracking-tighter leading-none drop-shadow-2xl">{data?.bloodGroup || 'B+'}</p>
                            </div>
                            <HeartPulse size={300} className="absolute right-[-60px] bottom-[-60px] text-white opacity-5 pointer-events-none" />
                        </div>

                        {/* Emergency Contact & Location */}
                        <div className="bg-[#11192A] rounded-[48px] border border-white/10 p-12 space-y-8 shadow-2xl relative group">
                            <div className="text-center">
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic mb-4">Rescue Network Protocol</p>
                                <h4 className="text-4xl font-black italic text-white uppercase font-poppins leading-none">{data?.emergencyContactName || 'GUARDIAN'}</h4>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                {/* 4. Contact family */}
                                <button 
                                    onClick={() => {
                                        const rawPh = data?.emergencyContactPhone || data?.ownerContact || data?.contactNumber;
                                        const sanPh = rawPh?.replace(/[^0-9+]/g, '');
                                        if (sanPh) window.location.href = `tel:${sanPh}`;
                                    }}
                                    className="h-28 bg-red-600 text-white rounded-[36px] flex flex-col items-center justify-center gap-1 shadow-2xl shadow-red-600/30 active:scale-95 transition-all group overflow-hidden"
                                >
                                    <div className="flex items-center gap-4">
                                        <Phone size={32} fill="white" />
                                        <span className="font-black uppercase italic tracking-widest text-3xl">Connect Call</span>
                                    </div>
                                    <span className="text-base opacity-70 font-black tracking-widest">{data?.emergencyContactPhone || data?.ownerContact || data?.contactNumber}</span>
                                </button>

                                {/* 3. Send location to family */}
                                <button 
                                    onClick={handleSendLocation}
                                    className="h-24 bg-emerald-600 text-white rounded-[36px] flex items-center justify-center gap-4 shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all"
                                >
                                    <MapPin size={28} fill="white" />
                                    <span className="font-black uppercase italic tracking-widest text-xl">Send Location To Family</span>
                                </button>
                            </div>
                        </div>

                        {/* Recovery Actions */}
                        <div className="grid grid-cols-1 gap-5">
                            {/* 5. Call to 108 */}
                            <button 
                                onClick={() => window.location.href = `tel:108`}
                                className="w-full h-28 bg-white text-black rounded-[40px] flex items-center justify-center gap-8 shadow-2xl active:scale-95 transition-all"
                            >
                                <Siren size={40} className="text-red-600 animate-pulse" />
                                <div className="text-left">
                                    <p className="text-3xl font-black italic uppercase leading-none font-poppins">Call 108</p>
                                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">First Responders</p>
                                </div>
                            </button>

                            {/* 6. Nearest Hospital */}
                            <button 
                                onClick={() => window.open(`https://www.google.com/maps/search/hospitals+near+me/@${coords?.lat},${coords?.lng}`, '_blank')}
                                className="w-full h-22 bg-[#11192A] text-white border-2 border-white/5 rounded-[36px] flex items-center justify-center gap-4 active:scale-95 transition-all hover:border-red-600/40"
                            >
                                <div className="p-3 bg-red-600/10 rounded-2xl text-red-600">
                                    <Navigation size={24} />
                                </div>
                                <span className="font-black uppercase italic tracking-widest text-xl">Nearest Hospital Locator</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-32 px-10 bg-[#11192A] rounded-[48px] border border-white/5 text-center shadow-2xl">
                        <ShieldAlert size={48} className="mx-auto mb-8 text-slate-700 opacity-20" />
                        <p className="text-slate-500 font-black uppercase italic text-sm tracking-[0.4em] leading-relaxed">
                            Node Registry Verified.<br />Unauthorized access blocked.
                        </p>
                    </div>
                )}
            </div>

            <footer className="text-center py-24 bg-[#040812] border-t border-white/5 opacity-50">
                <img src="/logo.png" alt="RESQR" className="h-8 w-auto mx-auto mb-8 grayscale" />
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-600 italic">
                    GLOBAL EMERGENCY IDENTITY INFRASTRUCTURE
                </p>
            </footer>
        </div>
    );
}
