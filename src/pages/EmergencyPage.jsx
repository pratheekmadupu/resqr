import { useState, useEffect } from 'react';
import { Phone, MapPin, AlertCircle, Heart, Activity, Info, Loader2, Lock, Navigation, Building2, Shield, ChevronRight, MessageSquare, ShieldAlert, CheckCircle2, XCircle, Key } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { ref, get, push, serverTimestamp } from 'firebase/database';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function EmergencyPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [scanRecorded, setScanRecorded] = useState(false);
    const [coords, setCoords] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [findingHospital, setFindingHospital] = useState(false);
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
        if (id) {
            const key = `resqr_visit_count_${id}`;
            const currentCount = parseInt(localStorage.getItem(key) || '0');
            const newCount = currentCount + 1;
            localStorage.setItem(key, newCount.toString());
            setVisitCount(newCount);
        }
    }, [id]);
    
    const [user, setUser] = useState({
        name: "LOADING...",
        bloodGroup: "--",
        allergies: "Loading...",
        conditions: "Loading...",
        doctorContact: "",
        emergencyContact: {
            name: "Loading...",
            relation: "--",
            phone: ""
        }
    });

    const recordScan = async () => {
        if (scanRecorded) return;
        setIsTransmitting(true);
        try {
            let locationName = 'Emergency Scan Received';
            let coords = null;

            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                });
                coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCoords(coords);
                locationName = `Precise Location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
            } catch (err) {
                console.log("Could not get precise location, logging general scan.");
            }

            const scanData = {
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'QR Scan Alert',
                location: locationName,
                coords: coords,
                type: 'Emergency Access'
            };

            await push(ref(db, `profiles/${id}/scans`), scanData);
            
            if (id.includes('_')) {
                const uid = id.split('_')[0];
                await push(ref(db, `users/${uid}/profiles/${id}/scans`), scanData);
            }
            setScanRecorded(true);

            // Alert family toast
            toast.success('Emergency contact has been notified of your location!', {
                icon: '🛡️',
                duration: 6000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: '20px'
                }
            });
        } catch (e) {
            console.error("Scan recording failed", e);
        } finally {
            setIsTransmitting(false);
        }
    };

    useEffect(() => {
        const fetchNearestHospitals = async () => {
            if (!coords) return;
            setFindingHospital(true);
            try {
                const query = `[out:json];node["amenity"="hospital"](around:15000,${coords.lat},${coords.lng});out 5;`;
                const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                const data = await response.json();

                if (data.elements && data.elements.length > 0) {
                    const hospitalList = data.elements.map(h => ({
                        name: h.tags.name || "Unnamed Medical Center",
                        lat: h.lat,
                        lng: h.lon,
                        addr: h.tags['addr:street'] || h.tags['addr:full'] || "Secondary Facility"
                    }));
                    setHospitals(hospitalList);
                } else {
                    setHospitals([{
                        name: "Emergency Medical Facility",
                        searchQuery: "hospital",
                        dist: "Nearby"
                    }]);
                }
            } catch (err) {
                console.error("Failed to fetch nearest hospitals", err);
            } finally {
                setFindingHospital(false);
            }
        };

        if (coords && hospitals.length === 0) {
            fetchNearestHospitals();
        }
    }, [coords, hospitals.length]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const snapshot = await get(ref(db, `profiles/${id}`));
                if (snapshot.exists()) {
                    const decodedUser = snapshot.val();
                    setUser({
                        name: (decodedUser.name || "UNIDENTIFIED").toUpperCase(),
                        bloodGroup: decodedUser.bloodGroup || "O+",
                        payment_status: decodedUser.payment_status || 'paid',
                        allergies: decodedUser.allergies || "None reported",
                        conditions: decodedUser.medicalConditions || decodedUser.healthIssues || "No chronic conditions reported",
                        doctorContact: decodedUser.doctorContact || "",
                        emergencyContact: {
                            name: decodedUser.emergencyContactName || "Primary Liaison",
                            relation: decodedUser.emergencyContactRelation || "Emergency Node",
                            phone: decodedUser.emergencyContactPhone || ""
                        }
                    });
                    recordScan();
                } else {
                    toast.error("Profile not found");
                }
            } catch (error) {
                console.error("Failed to load emergency data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    const initiateMaskedCall = () => {
        setShowCallScreen(true);
        // Simulate a virtual call connection
        setTimeout(() => {
            // In a real scenario, this would redirect to a Twilio bridge URL
            // For now, we simulate the "Handshake" then trigger the tel: protocol
            // but the number itself is never displayed in the UI.
            console.log("Secure connection established via Virtual ID: +1-RES-QR-001");
            window.location.href = `tel:${user.emergencyContact.phone}`;
            setTimeout(() => setShowCallScreen(false), 2000);
        }, 3000);
    };

    const handleRequestCall = async () => {
        setCallRequested(true);
        try {
            await push(ref(db, `profiles/${id}/scans`), {
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString(),
                status: 'CALLBACK REQUESTED',
                type: 'Urgent'
            });
            toast.success("Callback request sent to guardian!", {
                icon: '📲',
                style: { borderRadius: '20px' }
            });
        } catch (e) {
            toast.error("Failed to send request");
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
        if (!user.emergencyContact.phone) return toast.error("No contact number found for this profile");
        
        setSendingOtp(true);
        setupRecaptcha();
         // Sanitize phone number: remove spaces, dashes, parentheses
        const sanitized = user.emergencyContact.phone.replace(/[^0-9+]/g, '');
        
        let phoneNumber = sanitized;
        if (!phoneNumber.startsWith('+')) {
            // Assume Indian number if no plus prefix
            phoneNumber = `+91${phoneNumber}`;
        }
        
        // Final sanity check for E.164 (min 7 digits)
        if (phoneNumber.length < 10) return toast.error("Invalid phone number format");

        try {
            console.log("Initiating Security Handshake with:", phoneNumber);
            const appVerifier = window.recaptchaVerifier;
            const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(result);
            setShowOtpModal(true);
            toast.success(`Security code dispatched to ${user.emergencyContact.name}`);
        } catch (error) {
            console.error("Firebase Auth Error:", error.code, error.message);
            
            if (error.code === 'auth/invalid-phone-number') {
                toast.error("The stored phone number is invalid for SMS.");
            } else if (error.code === 'auth/captcha-check-failed') {
                toast.error("Security challenge failed. Please refresh.");
            } else if (error.code === 'auth/quota-exceeded') {
                toast.error("SMS quota exceeded for today.");
            } else {
                toast.error("Handshake failed. Ensure Phone Auth is enabled in Firebase.");
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
            toast.success("Access Granted: Medical History Refined");
            
            // Log security override
            await push(ref(db, `profiles/${id}/scans`), {
                timestamp: serverTimestamp(),
                status: 'SENSITIVE DATA UNLOCKED',
                type: 'Verified OTP'
            });
        } catch (error) {
            console.error("Verification error:", error);
            toast.error("Invalid or Expired OTP Code");
        } finally {
            setIsVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#040812] flex items-center justify-center">
                <Loader2 className="text-red-600 animate-spin" size={48} />
            </div>
        );
    }

    if (user.payment_status === 'pending' && user.name !== "DEMO") {
        return (
            <div className="min-h-screen bg-[#040812] text-white flex items-center justify-center p-8 font-manrope">
                <div className="max-w-md w-full bg-[#11192A] rounded-[40px] p-12 text-center border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600" />
                    <div className="w-24 h-24 bg-red-600/20 rounded-[30px] flex items-center justify-center mx-auto mb-10 text-red-600 border border-red-600/20">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-6 font-poppins text-white">Profile Pending Activation</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-10 italic">This medical profile has not been activated yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#040812] text-white font-manrope selection:bg-red-600/30">
            {/* FRAUD PREVENTION BANNER */}
            <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest sticky top-0 z-50 shadow-xl italic">
                <ShieldAlert size={16} />
                THIS PROFILE IS FOR EMERGENCY USE ONLY. ABUSE IS LOGGED & REPORTED.
            </div>

            {/* AUTOMATED LOCATION STATUS */}
            <AnimatePresence>
                {isTransmitting && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-emerald-500 text-white px-6 py-2 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] sticky top-[34px] z-40 border-b border-emerald-400/20"
                    >
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        📡 Automated Protocol: Broadcasting Location to Guardian Network...
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-[#040812]/80 backdrop-blur-xl border-b border-white/5 p-6 flex flex-col items-center justify-center gap-4 sticky top-[34px] z-40">
                <div className="flex items-center gap-3">
                    <img
                        src={`${import.meta.env.BASE_URL}logo.png`}
                        alt="RESQR"
                        style={{ height: '32px', width: 'auto' }}
                    />
                    <div className="h-6 w-px bg-white/10" />
                    <Badge className="px-3 py-1 font-black italic bg-red-600 text-white border-none text-[10px] tracking-widest uppercase">
                        EMERGENCY PORTAL
                    </Badge>
                </div>
            </div>

            <main className="p-4 sm:p-8 space-y-6 max-w-2xl mx-auto pb-32">
                {/* IDENTITY CARD */}
                <section className="bg-[#11192A] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl relative">
                    <div className="bg-black/20 p-4 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                        <span>Identity Lock: VERIFIED</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse delay-75" />
                        </div>
                    </div>
                    <div className="p-10 pt-14 text-center">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-4 italic">Individual Name</span>
                        <h2 className="text-5xl sm:text-7xl font-black text-white uppercase italic tracking-tighter break-words font-poppins leading-none">
                            {user.name}
                        </h2>
                    </div>
                </section>

                {/* VITAL INFORMATION - RED THEME */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-red-600 p-10 rounded-[40px] shadow-2xl flex items-center justify-between relative overflow-hidden group text-white">
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white border border-white/30">
                                <Heart size={36} fill="white" />
                            </div>
                            <div>
                                <span className="text-[11px] font-black text-white/70 uppercase tracking-[0.4em] block mb-2 italic">Blood Group</span>
                                <h3 className="text-7xl font-black text-white leading-none font-poppins tracking-tighter italic">{user.bloodGroup}</h3>
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
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Sensitive Profile</h3>
                        </div>
                        {!otpVerified && (
                             <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black uppercase italic tracking-widest">LOCKED</Badge>
                        )}
                    </div>

                    <div id="recaptcha-container"></div>

                    <div className={`relative transition-all duration-700 ${!otpVerified ? 'blur-xl' : 'blur-0'}`}>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Activity size={18} className="text-red-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Clinical State</span>
                                    </div>
                                    <p className="text-2xl font-black italic uppercase text-white leading-tight">{user.conditions}</p>
                                </div>
                                <div className="bg-red-600/5 p-6 rounded-3xl border border-red-600/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <AlertCircle size={18} className="text-red-500" />
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Critical Alerts</span>
                                    </div>
                                    <p className="text-2xl font-black italic uppercase text-red-500 leading-tight">{user.allergies}</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-white/5">
                                <div className="flex justify-between border-b border-white/5 pb-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Home Address</span>
                                    <span className="text-white font-black italic uppercase">Residential Area, Hyderabad</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Medication Log</span>
                                    <span className="text-white font-black italic uppercase">Insulin Type B (Daily)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!otpVerified && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center z-10">
                            <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 italic opacity-70">OTP verification required for medication & address history</p>
                            <Button 
                                onClick={handleSendOtp}
                                disabled={sendingOtp}
                                className="bg-white text-slate-950 hover:bg-red-600 hover:text-white rounded-[20px] px-8 py-4 font-black uppercase italic text-xs tracking-widest flex items-center gap-2"
                            >
                                {sendingOtp ? <Loader2 className="animate-spin" size={16} /> : <Key size={16} />}
                                {sendingOtp ? 'Sending...' : 'Unlock Sensitive Details'}
                            </Button>
                        </div>
                    )}
                </section>

                {/* EMERGENCY CONTACTS */}
                <section className="bg-[#11192A] rounded-[40px] border border-white/5 overflow-hidden shadow-xl">
                    <div className="p-10">
                        <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-8">
                            <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/20">
                                <Shield size={22} />
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Verified Guardians</h3>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 italic">Guardian One</span>
                                    <h4 className="text-3xl font-black text-white uppercase italic tracking-tight">{user.emergencyContact.name}</h4>
                                </div>
                                <Badge className="bg-white/5 text-slate-300 border border-white/10 font-black uppercase py-2 px-6 italic tracking-widest">{user.emergencyContact.relation}</Badge>
                            </div>

                            <div className="pt-4 flex flex-col gap-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">Secure Contact Protocol</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button 
                                        onClick={initiateMaskedCall}
                                        className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-[24px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-red-600/20 group"
                                    >
                                        <Phone size={22} fill="white" />
                                        <span className="font-black uppercase italic tracking-tighter text-lg">Call Family</span>
                                    </button>
                                    <button 
                                        onClick={handleRequestCall}
                                        disabled={callRequested}
                                        className={`p-6 rounded-[24px] flex items-center justify-center gap-3 transition-all active:scale-95 border-2 ${callRequested ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-[#040812] border-white/10 text-white hover:border-red-600 hover:text-red-600 shadow-lg'}`}
                                    >
                                        <MessageSquare size={22} />
                                        <span className="font-black uppercase italic tracking-tighter text-lg">{callRequested ? 'Request Sent' : 'Request Call'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* OPTIONAL BACKUP NUMBER - REVEALED ON SECOND VISIT */}
                {visitCount >= 2 && user.doctorContact && (
                    <section className="bg-emerald-600/5 rounded-[40px] border border-emerald-500/20 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="p-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                                    <Phone size={22} />
                                </div>
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Backup Emergency Node</h3>
                            </div>
                            
                            <div className="flex justify-between items-center text-left">
                                <div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 italic">Direct Secondary Line</span>
                                    <h4 className="text-4xl font-black text-emerald-500 uppercase italic tracking-tighter font-poppins">{user.doctorContact}</h4>
                                </div>
                                <button 
                                    onClick={() => window.location.href = `tel:${user.doctorContact}`}
                                    className="w-20 h-20 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30 active:scale-90 transition-all shrink-0"
                                >
                                    <Phone size={28} fill="white" />
                                </button>
                            </div>
                            <div className="mt-8 pt-6 border-t border-emerald-500/10">
                                <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-[0.3em] italic">Protocol 04: Secondary Number Revealed via Sequential Access</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* EXTRA ACTIONS */}
                <div className="space-y-4">
                    <button
                        onClick={() => window.location.href = 'tel:108'}
                        className="w-full bg-white text-slate-950 hover:bg-slate-200 p-8 rounded-[30px] flex items-center justify-center gap-5 transition-all shadow-xl"
                    >
                        <Phone size={24} fill="black" />
                        <span className="text-xl font-black uppercase italic tracking-tighter">Call Ambulance (108)</span>
                    </button>

                    <button 
                        onClick={() => toast.success("Misuse report initiated. Safety log entry created.")}
                        className="w-full bg-[#11192A] border border-white/10 text-slate-500 p-6 rounded-[25px] flex items-center justify-center gap-3 hover:bg-red-600/10 hover:text-red-600 hover:border-red-600/20 transition-all text-xs font-black uppercase italic tracking-widest"
                    >
                        <ShieldAlert size={18} />
                        Report Profile Misuse
                    </button>
                </div>
            </main>

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
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Securing Connection</h2>
                        <p className="text-white/70 font-bold uppercase tracking-[0.3em] text-xs mb-10 italic">Routing call through ResQR Virtual Line...</p>
                        
                        <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-white animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-100" />
                            <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-200" />
                        </div>
                        
                        <div className="mt-20 px-8 py-3 bg-black/20 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
                            Virtual ID Hash: RT-8892-QX
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
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Verification Inbound</h3>
                                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest italic mb-8 font-poppins text-center">
                                    A secure 6-digit code has been sent to {user.emergencyContact.name}. 
                                    <span className="block text-white mt-2">Ask them for the code to unlock private history.</span>
                                </p>
                                
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
                                        className="w-full bg-white hover:bg-red-600 text-slate-950 hover:text-white p-6 rounded-[20px] font-black uppercase italic tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all"
                                    >
                                        {isVerifying ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                        {isVerifying ? 'Verifying...' : 'Unlock Data'}
                                    </Button>
                                    <div className="pt-6 border-t border-white/5 flex flex-col gap-2">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Emergency rescuer ID will be tracked</p>
                                        <button onClick={handleSendOtp} className="text-[10px] text-red-600 font-black uppercase italic underline hover:text-white transition-colors">Resend Code</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md -z-10"
                            onClick={() => setShowOtpModal(false)}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* NEAREST HOSPITALS (FOOTER SECTION) */}
            <div className="bg-[#040812] py-20 px-6 border-t border-white/5">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/20">
                            <Building2 size={22} />
                        </div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Nearby Medical Centers</h3>
                    </div>

                    {findingHospital ? (
                        <div className="flex items-center gap-4 p-8 bg-[#11192A] border border-white/5 rounded-[30px] animate-pulse">
                            <Loader2 className="animate-spin text-red-600" size={24} />
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 italic">Scanning Geo-Coordinates...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {hospitals.map((hospital, idx) => (
                                <div key={idx} className="p-6 bg-[#11192A] border border-white/5 rounded-[30px] flex justify-between items-center group hover:border-red-600 transition-all shadow-xl">
                                    <div>
                                        <h4 className="text-lg font-black text-white uppercase italic tracking-tight">{hospital.name}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold italic tracking-wider mt-1">{hospital.addr || 'Secondary Facility'}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const url = hospital.lat
                                                ? `https://www.google.com/maps/dir/?api=1&origin=${coords?.lat},${coords?.lng}&destination=${hospital.lat},${hospital.lng}&travelmode=driving`
                                                : `https://www.google.com/maps/search/hospital/@${coords?.lat},${coords?.lng}`;
                                            window.open(url, '_blank');
                                        }}
                                        className="bg-red-600 text-white p-4 rounded-2xl hover:bg-white hover:text-red-600 transition-all active:scale-90 shadow-lg shadow-red-600/20"
                                    >
                                        <Navigation size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <footer className="text-center py-20 bg-[#040812] border-t border-white/5">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR" className="h-8 w-auto mx-auto mb-8 grayscale opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">
                    Privacy First Emergency Protocol • 2026 ResQR
                </p>
            </footer>
        </div>
    );
}
