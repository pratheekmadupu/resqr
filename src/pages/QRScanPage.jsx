import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, get, push, serverTimestamp } from 'firebase/database';
import { Phone, MapPin, AlertCircle, Heart, Activity, Loader2, Info, Car, Briefcase, Dog, Shield, Share2, Activity as HeartPulse, Navigation, Siren } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function QRScanPage() {
    const { profileId } = useParams();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [scanRecorded, setScanRecorded] = useState(false);
    const [hospitals, setHospitals] = useState([]);
    const [findingHospital, setFindingHospital] = useState(false);
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let userId = null;
                if (profileId.includes('_')) userId = profileId.split('_')[0];
                if (userId) {
                    const snap = await get(ref(db, `users/${userId}/profiles/${profileId}`));
                    if (snap.exists()) {
                        setProfile(snap.val());
                        recordScan(userId, profileId);
                    } else {
                        const legacy = await get(ref(db, `profiles/${profileId}`));
                        if (legacy.exists()) setProfile({ category: 'people', data: legacy.val() });
                    }
                } else {
                    const legacy = await get(ref(db, `profiles/${profileId}`));
                    if (legacy.exists()) setProfile({ category: 'people', data: legacy.val() });
                }
            } catch (error) {} finally { setLoading(false); }
        };
        fetchProfile();
    }, [profileId]);

    const recordScan = async (userId, pid) => {
        if (scanRecorded) return;
        try {
            let coords = null;
            let locationName = "Scan Location Pending";
            try {
                const position = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 10000 });
                });
                if (position) {
                    coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                    locationName = `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
                }
            } catch (err) {}
            const scanData = {
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'Emergency Alert',
                location: locationName,
                coords: coords
            };
            setCoords(coords);
            await push(ref(db, `users/${userId}/profiles/${pid}/scans`), scanData);
            setScanRecorded(true);
        } catch (e) {}
    };

    useEffect(() => {
        const fetchNearestHospitals = async () => {
            if (!coords) return;
            setFindingHospital(true);
            try {
                const query = `[out:json];node["amenity"="hospital"](around:10000,${coords.lat},${coords.lng});out 5;`;
                const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (data.elements && data.elements.length > 0) {
                    setHospitals(data.elements.map(h => ({ name: h.tags.name || "Medical Center", lat: h.lat, lng: h.lon, addr: h.tags['addr:street'] || "Facility" })));
                }
            } catch (err) {} finally { setFindingHospital(false); }
        };
        if (coords && profile?.category === 'people') fetchNearestHospitals();
    }, [coords, profile]);

    if (loading) return <div className="min-h-screen bg-[#040812] flex items-center justify-center"><Loader2 className="text-primary animate-spin" size={48} /></div>;
    if (!profile) return <div className="min-h-screen bg-[#040812] flex flex-col items-center justify-center text-white"><Shield size={64} className="text-primary mb-6 opacity-30" /><h1 className="text-2xl font-black uppercase italic tracking-tighter">DATA UNAVAILABLE</h1></div>;

    const { category, data } = profile;

    return (
        <div className="min-h-screen bg-[#040812] py-12 px-6 selection:bg-red-500/30">
            <div className="max-w-xl mx-auto space-y-8 pb-32">
                
                {/* BRAND HEADER */}
                <div className="flex flex-col items-center mb-10 text-center animate-in fade-in duration-1000">
                     <img src="/logo.png" alt="RESQR" className="h-10 w-auto mb-6 grayscale brightness-200" />
                     <Badge className="bg-red-500/10 text-red-500 border-none px-6 py-1.5 tracking-[0.4em] uppercase italic font-black text-[9px]">Emergency Responder Subsystem</Badge>
                     <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.5em] mt-2">SECURE MEDICAL IDENTITY VAULT v2.0</p>
                </div>

                {category === 'people' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* 1. LEGAL IDENTITY */}
                        <div className="bg-[#11192A] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="p-1 flex justify-between bg-[#080F1D] px-8 py-2">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Identity Identifier</span>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">SECURED</span></div>
                            </div>
                            <div className="p-10 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Full Legal Name</p>
                                <h1 className="text-6xl font-black uppercase text-white tracking-tighter italic font-poppins">{data.name}</h1>
                            </div>
                        </div>

                        {/* 2. BLOOD & DIAGNOSIS - FLEX ROW */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#11192A] rounded-[40px] border border-white/5 p-10 flex flex-col items-center justify-center shadow-xl">
                                <Heart size={32} className="text-red-500 mb-4" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Blood Vector</p>
                                <p className="text-6xl font-black italic text-red-500 font-poppins tracking-tighter leading-none">{data.bloodGroup || '--'}</p>
                            </div>
                            <div className="bg-[#11192A] rounded-[40px] border border-white/5 p-10 flex flex-col items-center justify-center text-center shadow-xl">
                                <HeartPulse size={32} className="text-indigo-500 mb-4" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Primary Conditions</p>
                                <h2 className="text-xl font-black italic text-white uppercase font-poppins line-clamp-2">{data.healthIssues || 'STABLE'}</h2>
                            </div>
                        </div>

                        {/* 3. CRITICAL ALLERGIES - STACKED */}
                        <div className="bg-red-500/5 rounded-[40px] border border-red-500/20 overflow-hidden shadow-xl">
                             <div className="p-1 flex items-center gap-2 bg-red-500/10 px-8 py-3">
                                <AlertCircle size={14} className="text-red-500" />
                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest italic">Critical Alerts & Allergies</span>
                            </div>
                            <div className="p-10">
                                <h2 className="text-3xl font-black italic text-red-100 uppercase font-poppins leading-tight">{data.allergies || 'NO KNOWN VULNERABILITIES'}</h2>
                            </div>
                        </div>

                        {/* 4. EMERGENCY CONTACT (FAMILY NUMBER) */}
                        <div className="bg-[#11192A] rounded-[48px] border border-white/5 overflow-hidden shadow-xl">
                             <div className="p-1 flex items-center gap-2 bg-[#080F1D] px-8 py-3">
                                <Phone size={14} className="text-indigo-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Guardian / Family Contact</span>
                            </div>
                            <div className="p-10 flex items-center justify-between">
                                <div>
                                    <h4 className="text-4xl font-black italic text-white uppercase font-poppins mb-1">{data.emergencyContactName}</h4>
                                    <Badge className="bg-indigo-500/10 text-indigo-400 border-none px-4 py-1.5 font-black italic text-[10px] uppercase">FAMILY CONTACT</Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Comms Link</p>
                                    <p className="text-2xl font-black italic text-white font-poppins tracking-tighter">{data.emergencyContactPhone}</p>
                                </div>
                            </div>
                        </div>

                        {/* 5. NEAREST MEDICAL FACILITIES */}
                        <div className="bg-[#11192A] rounded-[48px] border border-white/5 overflow-hidden shadow-xl">
                             <div className="p-1 flex items-center gap-2 bg-[#080F1D] px-8 py-3">
                                <Navigation size={14} className="text-emerald-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Nearest Extraction Nodes (Hospitals)</span>
                            </div>
                            <div className="p-10 space-y-4">
                                {findingHospital ? (
                                    <div className="flex items-center gap-4 animate-pulse italic text-slate-600">
                                        <Loader2 className="animate-spin" size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Scanning Network...</span>
                                    </div>
                                ) : hospitals.length > 0 ? (
                                    hospitals.slice(0, 3).map((h, i) => (
                                        <div key={i} className="bg-[#050B18] p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                                            <div className="min-w-0">
                                                <p className="text-white font-black italic uppercase text-lg truncate tracking-tighter">{h.name}</p>
                                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">{h.addr}</p>
                                            </div>
                                            <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`)} className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                                                <Navigation size={20} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-[10px] italic text-slate-600 font-black uppercase tracking-widest py-4">Waiting for geolocation sync...</p>
                                )}
                            </div>
                        </div>

                        {/* 6. PRIMARY RESCUE ACTIONS */}
                        <div className="space-y-4 pt-10">
                             <button onClick={() => window.location.href = `tel:${data.emergencyContactPhone}`} className="w-full h-24 bg-emerald-500 text-white rounded-[40px] font-black uppercase tracking-widest text-2xl flex justify-center items-center gap-6 active:scale-95 transition-all shadow-2xl shadow-emerald-500/30">
                                <Phone size={32} /> CALL FAMILY
                            </button>
                             <button onClick={() => window.location.href = `tel:108`} className="w-full h-20 bg-red-600 text-white rounded-[35px] font-black uppercase tracking-widest text-xl flex justify-center items-center gap-6 active:scale-95 transition-all shadow-xl shadow-red-600/20 border-b-4 border-red-800">
                                <Siren size={28} className="animate-pulse" /> DIAL 108 AMBULANCE
                            </button>
                             <button onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition((pos) => {
                                        const msg = `EMERGENCY ALERT! I found a person with ID ${data.name}. I am currently here: https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
                                        window.location.href = `https://wa.me/${data.emergencyContactPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
                                    });
                                }
                            }} className="w-full h-20 bg-[#25D366]/10 text-[#25D366] rounded-[35px] font-black uppercase tracking-widest text-xs flex justify-center items-center gap-4 border border-[#25D366]/20 active:scale-95 transition-all">
                                <Shield size={18} /> WhatsApp Location Alert To Family
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* FOOTER INSTRUCTION */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#040812]/90 backdrop-blur-md p-6 border-t border-red-500/10 text-center">
                 <p className="text-[9px] text-red-500 font-black uppercase tracking-[0.4em] italic mb-1 animate-pulse">If unresponsive, begin CPR immediately</p>
                 <p className="text-[7px] text-slate-500 uppercase tracking-widest italic">All medical records are secured under ResQR Digital Vault Protocol</p>
            </div>
        </div>
    );
}

