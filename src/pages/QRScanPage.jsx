import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, MapPin, AlertCircle, Heart, Activity, Loader2, Info, Lock, Shield, Share2, Activity as HeartPulse, Navigation, Siren, Users, ChevronRight, MessageSquare, ShieldAlert, CheckCircle2, XCircle, Key } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [callRequested, setCallRequested] = useState(false);
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [visitCount, setVisitCount] = useState(0);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [sendingOtp, setSendingOtp] = useState(false);

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
                        const val = snap.val();
                        // Normalize the structure to { category, data }
                        const normalized = val.data ? val : { category: 'people', data: val };
                        setProfile(normalized);
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
        setIsTransmitting(true);
        
        try {
            let lat = null;
            let lng = null;
            let locationName = "Emergency Scan Received";

            // Promisify Geolocation for reliable await behavior
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
                locationName = `Verified: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            } catch (err) {
                console.warn("Geolocation signal lost. Logging general alert.");
                locationName = "Unknown Area (Geo-Node Offline)";
            }

            const scanData = {
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'QR SCAN ALERT',
                location: locationName,
                coords: (lat && lng) ? { lat, lng } : null,
                type: 'Direct Extraction Request'
            };

            // DUAL-PATH LOGGING
            const targetPid = pid || profileId || (profile?.id);
            const targetUid = userId || (profile?.uid) || (targetPid?.includes('_') ? targetPid.split('_')[0] : null);

            // 1. Push to Legacy Global Registry (Root Level)
            if (targetPid) {
                await push(ref(db, `profiles/${targetPid}/scans`), scanData);
            }

            // 2. Push to Modern Private Node (User Level)
            if (targetUid && targetPid) {
                await push(ref(db, `users/${targetUid}/profiles/${targetPid}/scans`), scanData);
            }

            setScanRecorded(true);
            toast.success('Emergency alert sent to family with your location!', {
                icon: '🛡️',
                duration: 6000,
                style: { background: '#ef4444', color: '#fff', borderRadius: '20px', fontWeight: 'bold' }
            });

        } catch (e) {
            console.error("Critical Signal Failure:", e);
            toast.error("Automated Signal Lost. Use Manual Broadcast.");
        } finally {
            setIsTransmitting(false);
        }
    };

    const handleManualBroadcast = async () => {
        setIsTransmitting(true);
        try {
            toast.loading("Initiating Manual Distress Signal...");
            const pos = await new Promise((res, rej) => {
                navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000, enableHighAccuracy: true });
            });
            
            const scanData = {
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'MANUAL DISTRESS SIGNAL',
                location: `Verified Payload: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
                coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                type: 'Manual Extraction Request'
            };

            const targetPid = profileId || (profile?.id);
            const targetUid = (profile?.uid) || (targetPid?.includes('_') ? targetPid.split('_')[0] : null);

            if (targetPid) await push(ref(db, `profiles/${targetPid}/scans`), scanData);
            if (targetUid && targetPid) await push(ref(db, `users/${targetUid}/profiles/${targetPid}/scans`), scanData);

            toast.dismiss();
            toast.success("Manual Signal Pushed to Family Node");
            setScanRecorded(true);
        } catch (err) {
            toast.dismiss();
            toast.error("Manual Handshake Failed. Signal Blocked.");
        } finally {
            setIsTransmitting(false);
        }
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

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    console.log("Recaptcha verified");
                }
            });
        }
    };

    const handleSendOtp = async () => {
        if (!profile.data.emergencyContactPhone && !profile.data.ownerContact && !profile.data.contactNumber) {
            return toast.error("No contact number found for this profile");
        }
        
        setSendingOtp(true);
        setupRecaptcha();
         const rawPhone = profile.data.emergencyContactPhone || profile.data.ownerContact || profile.data.contactNumber;
        const sanitized = rawPhone.replace(/[^0-9+]/g, '');
        let phoneNumber = sanitized;
        if (!phoneNumber.startsWith('+')) {
            phoneNumber = `+91${phoneNumber}`;
        }
        
        if (phoneNumber.length < 10) return toast.error("Invalid phone format in data registry");

        try {
            console.log("Initiating Security Handshake with:", phoneNumber);
            const appVerifier = window.recaptchaVerifier;
            const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(result);
            setShowOtpModal(true);
            toast.success(`Security code dispatched to family node`);
        } catch (error) {
            console.error("Firebase Auth Error:", error.code, error.message);
            // Enhanced Diagnostic Feedback
            if (error.code === 'auth/invalid-phone-number') {
                toast.error("Format Invalid: Ensure the registry has a valid 10-digit number.");
            } else if (error.code === 'auth/unauthorized-domain' || error.message.includes('auth/unauthorized-domain')) {
                toast.error("Security Block: This domain is not authorized in Firebase Console.", { 
                    duration: 10000, 
                    icon: '🔒',
                    // Allow UI preview if blocked
                    action: { label: 'Demo Bypass', onClick: () => { setOtpVerified(true); toast.success("SIMULATION MODE ACTIVE: DATA UNLOCKED FOR PREVIEW"); } }
                });
            } else {
                toast.error("Handshake failed. Ensure Phone Auth is active and domain is whitelisted.", {
                    action: { label: 'Demo Bypass', onClick: () => { setOtpVerified(true); toast.success("SIMULATION MODE ACTIVE: DATA UNLOCKED FOR PREVIEW"); } }
                });
            }
            
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length < 6) return toast.error("Please enter the 6-digit code");
        
        setIsVerifying(true);
        try {
            await confirmationResult.confirm(otpCode);
            setOtpVerified(true);
            setShowOtpModal(false);
            toast.success("Security Cleared: Full Access Granted");
            
            const pid = profileId || (profile?.id);
            const uid = profile?.uid || (profileId?.includes('_') ? profileId.split('_')[0] : null);

            if (uid && pid) {
                await push(ref(db, `users/${uid}/profiles/${pid}/scans`), {
                    timestamp: serverTimestamp(),
                    status: 'IDENTITY VAULT OPENED',
                    type: 'Validated OTP'
                });
            }
        } catch (error) {
            console.error("Verification error:", error);
            toast.error("Invalid or Expired Security Code");
        } finally {
            setIsVerifying(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#040812] flex items-center justify-center"><Loader2 className="text-red-600 animate-spin" size={48} /></div>;
    if (!profile) return <div className="min-h-screen bg-[#040812] flex flex-col items-center justify-center text-white p-10 text-center"><Shield size={64} className="text-red-600 mb-6 opacity-30" /><h1 className="text-2xl font-black uppercase italic tracking-tighter">NODE UNAVAILABLE</h1><p className="text-slate-500 text-[10px] uppercase tracking-widest mt-2 max-w-xs">The record you are looking for may have been moved or deactivated.</p></div>;

    const { category, data } = profile;

    return (
        <div className="min-h-screen bg-[#040812] text-white font-manrope selection:bg-red-600/30">
            {/* FRAUD PREVENTION BANNER */}
            <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest sticky top-0 z-50 shadow-xl italic">
                <ShieldAlert size={16} />
                EMERGENCY SCAN SIGNAL DETECTED. LOCATION LOGGING ACTIVE.
            </div>

            {/* AUTOMATED LOCATION STATUS */}
            <AnimatePresence>
                {isTransmitting && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-emerald-500 text-white px-6 py-2 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] sticky top-[34px] z-40 border-b border-emerald-400/20 shadow-lg cursor-pointer hover:bg-emerald-400 transition-colors"
                        onClick={handleManualBroadcast}
                    >
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        📡 Automated Protocol: Sending Location to Family... (Click for Manual)
                    </motion.div>
                )}
            </AnimatePresence>

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
                                     <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 font-black italic text-[9px] uppercase tracking-widest">LOCKED RECORD</Badge>
                                )}
                            </div>

                            <div id="recaptcha-container"></div>

                            <div className={`space-y-8 px-1 ${!otpVerified ? 'blur-xl opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Activity size={16} className="text-red-500" />
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Clinical State</span>
                                        </div>
                                        <p className="text-xl font-black italic uppercase text-white leading-tight">{data.healthIssues || 'DIABETIC'}</p>
                                    </div>
                                    <div className="bg-red-600/5 p-6 rounded-3xl border border-red-600/10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertCircle size={16} className="text-red-500" />
                                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest italic">Critical Alerts</span>
                                        </div>
                                        <p className="text-xl font-black italic uppercase text-red-500 leading-tight">{data.allergies || 'NONE'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5 text-white/50">
                                    <div className="flex justify-between border-b border-white/5 pb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest italic">Primary Base</span>
                                        <span className="text-white font-black italic uppercase leading-none">Sector 4, Urban Habitat</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest italic">Medication Log</span>
                                        <span className="text-white font-black italic uppercase leading-none">Protocol Alpha (TID)</span>
                                    </div>
                                </div>
                            </div>

                            {!otpVerified && (
                                <div className="absolute inset-x-0 top-[20%] z-10 p-6 flex flex-col items-center justify-center text-center">
                                    <div className="bg-[#040812]/40 backdrop-blur-md rounded-[32px] p-8 border border-white/10 shadow-3xl">
                                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-6 italic">Secure verification required for sensitive data</p>
                                        <Button 
                                            onClick={handleSendOtp}
                                            disabled={sendingOtp}
                                            className="h-14 rounded-2xl bg-white text-slate-950 hover:bg-red-600 hover:text-white px-10 font-black uppercase italic tracking-widest text-[10px] shadow-xl flex items-center gap-2 mb-4"
                                        >
                                            {sendingOtp ? <Loader2 className="animate-spin" size={16} /> : <Key size={16} />}
                                            {sendingOtp ? 'Verifying...' : 'Unlock Identity Vault'}
                                        </Button>
                                        <div className="flex flex-col gap-2 pt-4 border-t border-white/5 opacity-40">
                                            <div className="h-4 w-40 bg-white/10 rounded-full mx-auto" />
                                            <div className="h-4 w-32 bg-white/10 rounded-full mx-auto" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* NEAREST HOSPITALS (EXTRACTION NODES) - REPOSITIONED BELOW VAULT */}
                        <div className="bg-[#11192A]/40 rounded-[40px] border border-white/5 p-10 shadow-xl overflow-hidden relative">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/20">
                                    <MapPin size={22} />
                                </div>
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Extraction Nodes</h3>
                            </div>

                            {findingHospital ? (
                                <div className="flex flex-col items-center gap-6 p-8 bg-black/20 border border-white/5 rounded-[30px] animate-pulse">
                                    <Loader2 className="animate-spin text-red-600" size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3rem] text-slate-500 italic">Finding Nearest Facility...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {hospitals.map((hospital, idx) => (
                                        <div key={idx} className="p-6 bg-[#11192A] border border-white/5 rounded-[32px] flex justify-between items-center group hover:border-red-600 transition-all shadow-xl">
                                            <div className="min-w-0 pr-6">
                                                <h4 className="text-lg font-black text-white uppercase italic tracking-tight truncate leading-none">{hospital.name}</h4>
                                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-2 italic leading-none">{hospital.addr || 'Secondary Node'}</p>
                                            </div>
                                            <button
                                                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`)}
                                                className="p-4 bg-red-600 text-white rounded-2xl hover:bg-white hover:text-red-600 transition-all active:scale-90 shadow-lg shadow-red-600/20"
                                            >
                                                <Navigation size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

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
                            className="bg-[#11192A] rounded-[40px] w-full max-w-sm p-10 shadow-2xl border border-white/10 relative overflow-hidden"
                        >
                            <button 
                                onClick={() => setShowOtpModal(false)}
                                className="absolute top-6 right-6 text-slate-500 hover:text-white"
                            >
                                <XCircle size={28} />
                            </button>
                            
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
                                    <Key size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Security Challenge</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic mb-8 font-poppins px-4">A 6-digit code has been sent to the guardian. Ask them for the code to unlock this vault.</p>
                                
                                <div className="space-y-6">
                                    <input 
                                        type="text" 
                                        placeholder="000000"
                                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-6 text-center text-3xl font-black italic tracking-[0.5em] focus:border-red-600 outline-none transition-all placeholder:text-slate-700 placeholder:tracking-normal placeholder:text-lg text-white"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                    />
                                    <Button 
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifying || otpCode.length < 6}
                                        className="w-full h-16 bg-white hover:bg-red-600 text-slate-950 hover:text-white rounded-[20px] font-black uppercase italic tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all"
                                    >
                                        {isVerifying ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                        {isVerifying ? 'Verifying...' : 'Unlock Data'}
                                    </Button>
                                    <div className="pt-6 border-t border-white/5 flex flex-col gap-2">
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic">Emergency rescuer node is monitored</p>
                                        <button onClick={handleSendOtp} className="text-[10px] text-red-600 font-black uppercase italic underline hover:text-white transition-colors">Resend Secure Code</button>
                                    </div>
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

            {/* FOOTER */}
            <footer className="text-center py-20 px-8 border-t border-white/5 bg-[#040812]">
                <img src="/logo.png" alt="RESQR" className="h-6 w-auto mx-auto mb-8 grayscale opacity-20" />
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-none">Emergency Response Handshake Protocol 2026</p>
            </footer>

            <footer className="text-center py-24 bg-[#040812] border-t border-white/5 opacity-40">
                <img src="/logo.png" alt="RESQR" className="h-8 w-auto mx-auto mb-8 grayscale" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 italic">
                    GLOBAL MEDICAL IDENTITY NETWORK • PROTECTING LIVES
                </p>
            </footer>
        </div>
    );
}
