import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, get, push, serverTimestamp } from 'firebase/database';
import { Phone, MapPin, AlertCircle, Heart, Activity, Loader2, Info, Car, Briefcase, Dog, Shield, Share2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
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
                // To fetch from users/{userId}/profiles/{profileId}, we need the userId.
                // If profileId contains the userId (e.g., userId_pushId), we extract it.
                // Otherwise, we might have a public mapping node, or we can assume profileId has userId embedded.
                // Let's assume profileId is strictly formatted as: userId_uniqueId
                let userId = null;
                let actualProfileId = profileId;
                
                if (profileId.includes('_')) {
                    userId = profileId.split('_')[0];
                } else {
                    // Fallback: search through users / public mapping if needed.
                    // For now, let's rely on the structure userId_something
                    console.error("Profile ID doesn't contain userId.");
                }

                if (userId) {
                    const profileRef = ref(db, `users/${userId}/profiles/${profileId}`);
                    const snap = await get(profileRef);
                    if (snap.exists()) {
                        setProfile(snap.val());
                        recordScan(userId, profileId);
                    } else {
                        // try legacy profile path just in case
                        const legacySnap = await get(ref(db, `profiles/${profileId}`));
                        if (legacySnap.exists()) {
                            setProfile({ category: 'people', data: legacySnap.val() });
                        } else {
                            toast.error("Profile not found.");
                        }
                    }
                } else {
                    // attempt legacy string
                    const legacySnap = await get(ref(db, `profiles/${profileId}`));
                    if (legacySnap.exists()) {
                        setProfile({ category: 'people', data: legacySnap.val() });
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [profileId]);

    const recordScan = async (userId, pid) => {
        if (scanRecorded) return;
        try {
            let coords = null;
            let locationName = "Scan Detected";
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                });
                coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                locationName = `Location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
            } catch (err) {}

            const scanData = {
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'QR Scan',
                location: locationName,
                coords: coords
            };

            setCoords(coords);
            await push(ref(db, `users/${userId}/profiles/${pid}/scans`), scanData);
            setScanRecorded(true);
        } catch (e) {
            console.error("Failed to record scan", e);
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
                    setHospitals(data.elements.map(h => ({
                        name: h.tags.name || "Emergency Medical Center",
                        lat: h.lat,
                        lng: h.lon,
                        addr: h.tags['addr:street'] || "Medical Facility"
                    })));
                }
            } catch (err) { console.error(err); } finally { setFindingHospital(false); }
        };
        if (coords && category === 'people') fetchNearestHospitals();
    }, [coords, category]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="text-primary animate-spin" size={48} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-8">
                <Shield size={64} className="text-primary mb-6 opacity-50" />
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">Profile Not Found</h1>
                <p className="text-slate-500 uppercase tracking-widest text-xs font-bold text-center">This QR identity is either invalid or has been deactivated.</p>
            </div>
        );
    }

    const { category, data } = profile;

    const renderPeopleTemplate = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <Badge className="bg-red-500/20 text-red-500 border-none px-6 py-2 mb-6 tracking-widest uppercase italic font-black">
                    MEDICAL ID CARD
                </Badge>
                <h1 className="text-5xl font-black uppercase text-white tracking-tighter italic">{data.name}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-white/5 p-6 rounded-[30px] flex flex-col items-center justify-center text-center group">
                    <Heart size={32} className="text-red-500 mb-4" />
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Blood Group</span>
                    <span className="text-4xl text-white font-black italic tracking-tighter mt-1">{data.bloodGroup || '--'}</span>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded-[30px] flex flex-col items-center justify-center text-center group">
                    <Activity size={32} className="text-red-500 mb-4" />
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Pre-Existing</span>
                    <span className="text-sm text-white font-bold mt-2 uppercase">{data.healthIssues || data.medicalConditions || 'None'}</span>
                </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[30px]">
                <h3 className="text-red-500 font-black uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                    <AlertCircle size={16} /> Critical Allergies
                </h3>
                <p className="text-xl text-white font-bold italic">{data.allergies || 'NONE REPORTED'}</p>
            </div>

            {/* NEAREST HOSPITAL SECTION - FROM OLD PROFILE */}
            <div className="bg-slate-900 border border-white/5 p-8 rounded-[30px]">
                <h3 className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                    <AlertCircle size={16} /> Nearest Medical Facilities
                </h3>
                {findingHospital ? (
                    <div className="flex items-center gap-3 animate-pulse">
                        <Loader2 className="animate-spin text-red-500" size={16} />
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Scanning Perimiter...</span>
                    </div>
                ) : hospitals.length > 0 ? (
                    <div className="space-y-4">
                        {hospitals.slice(0, 2).map((h, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-white/5">
                                <div className="min-w-0">
                                    <p className="text-white font-black uppercase italic text-sm truncate">{h.name}</p>
                                    <p className="text-[8px] text-slate-500 uppercase font-bold">{h.addr}</p>
                                </div>
                                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`)} className="bg-red-500/10 text-red-500 p-2 rounded-lg">
                                    <Share2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">Positioning Identity...</p>
                )}
            </div>

            <div className="bg-slate-900 border border-white/5 p-8 rounded-[30px]">
                <h3 className="text-slate-500 font-black uppercase tracking-widest text-xs mb-6">Emergency Contacts</h3>
                <div className="space-y-4">
                    {data.emergencyContactPhone && (
                        <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl">
                            <div>
                                <p className="text-white font-black uppercase text-lg">{data.emergencyContactName}</p>
                                <p className="text-slate-500 text-xs font-bold uppercase">{data.emergencyContactRelation || 'Primary Contact'}</p>
                            </div>
                            <button
                                onClick={() => window.location.href = `tel:${data.emergencyContactPhone}`}
                                className="bg-emerald-500 text-white p-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                <Phone size={20} />
                            </button>
                        </div>
                    )}
                    {data.doctorContact && (
                        <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl">
                            <div>
                                <p className="text-white font-black uppercase text-lg">Family Doctor</p>
                            </div>
                            <button
                                onClick={() => window.location.href = `tel:${data.doctorContact}`}
                                className="bg-blue-500 text-white p-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                <Phone size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4">
                <button
                    onClick={() => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition((pos) => {
                                const msg = `Emergency! Location: https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
                                window.location.href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
                            });
                        }
                    }}
                    className="w-full bg-slate-800 text-white p-6 rounded-[20px] font-black uppercase tracking-widest text-sm flex justify-center items-center gap-3 active:scale-95 transition-all"
                >
                    <MapPin size={20} /> Share Location via WhatsApp
                </button>
                <div className="p-6 text-center">
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] italic">If the person is unresponsive, please call 108 immediately and wait for professional medical help.</p>
                </div>
            </div>
        </div>
    );

    const renderPetsTemplate = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <Badge className="bg-emerald-500/20 text-emerald-500 border-none px-6 py-2 mb-6 tracking-widest uppercase italic font-black flex items-center justify-center gap-2 w-max mx-auto">
                    <Dog size={16} /> LOST PET ID
                </Badge>
                <h1 className="text-5xl font-black uppercase text-white tracking-tighter italic">{data.petName}</h1>
                <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-sm">{data.petType || 'Pet'}</p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[30px] text-center">
                <h2 className="text-2xl font-black text-emerald-400 uppercase italic tracking-tighter mb-2">"This pet is lost!"</h2>
                <p className="text-white/80 font-bold text-sm">Please help me get back to my owner. Scan recorded.</p>
                {data.reward && (
                    <div className="mt-6 inline-block bg-emerald-500 text-white font-black px-6 py-3 rounded-xl uppercase tracking-widest text-xs">
                        Reward Offered
                    </div>
                )}
            </div>

            <div className="bg-slate-900 border border-white/5 p-8 rounded-[30px] space-y-6">
                <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Vaccination Info</span>
                    <p className="text-white font-bold mt-1 text-lg">{data.vaccinationInfo || 'Up to date'}</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-4">Owner Action</span>
                    <button
                        onClick={() => window.location.href = `tel:${data.ownerContact}`}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-6 rounded-[20px] font-black uppercase tracking-widest text-lg flex justify-center items-center gap-3 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                    >
                        <Phone size={24} /> Call Owner Now
                    </button>
                    <button
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((pos) => {
                                    const msg = `I found your pet ${data.petName}! Here is the location: https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
                                    window.location.href = `https://wa.me/${data.ownerContact?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
                                });
                            }
                        }}
                        className="w-full mt-4 bg-slate-800 text-white p-6 rounded-[20px] font-black uppercase tracking-widest text-sm flex justify-center items-center gap-3 active:scale-95 transition-all"
                    >
                        <MapPin size={20} /> Share Location
                    </button>
                </div>
            </div>
        </div>
    );

    const renderValuablesTemplate = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <Badge className="bg-blue-500/20 text-blue-500 border-none px-6 py-2 mb-6 tracking-widest uppercase italic font-black flex items-center justify-center gap-2 w-max mx-auto">
                    <Briefcase size={16} /> LOST & FOUND
                </Badge>
                <h1 className="text-5xl font-black uppercase text-white tracking-tighter italic">{data.itemName}</h1>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-[30px] text-center">
                <h2 className="text-2xl font-black text-blue-400 uppercase italic tracking-tighter mb-2">"This valuable belongs to someone!"</h2>
                <p className="text-white/80 font-bold text-sm italic">"{data.message || 'Please contact the owner to return it.'}"</p>
                {data.reward && (
                    <div className="mt-6 inline-block bg-blue-500 text-white font-black px-6 py-3 rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20">
                        Reward: {data.reward}
                    </div>
                )}
            </div>

            <div className="bg-slate-900 border border-white/5 p-8 rounded-[30px] space-y-4">
                <button
                    onClick={() => window.location.href = `tel:${data.ownerContact}`}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-[20px] font-black uppercase tracking-widest text-lg flex justify-center items-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
                >
                    <Phone size={24} /> Call Owner
                </button>
            </div>
        </div>
    );

    const renderVehiclesTemplate = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <Badge className="bg-yellow-500/20 text-yellow-500 border-none px-6 py-2 mb-6 tracking-widest uppercase italic font-black flex items-center justify-center gap-2 w-max mx-auto">
                    <Car size={16} /> VEHICLE SECURE ID
                </Badge>
                <h1 className="text-6xl font-black uppercase text-white tracking-tighter italic">{data.vehicleNumber}</h1>
                <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-sm text-yellow-500/80">Owner: {data.ownerName}</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-[30px]">
                <h3 className="text-yellow-500 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2 text-center justify-center">
                    <AlertCircle size={16} /> Notification System
                </h3>
                <p className="text-white text-center font-bold">Please use the options below to contact the vehicle owner regarding parking issues or emergencies.</p>
            </div>

            <div className="bg-slate-900 border border-white/5 p-8 rounded-[30px] space-y-4">
                <button
                    onClick={() => window.location.href = `tel:${data.contactNumber}`}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 p-6 rounded-[20px] font-black uppercase tracking-widest text-lg flex justify-center items-center gap-3 active:scale-95 transition-all shadow-xl shadow-yellow-500/20"
                >
                    <Phone size={24} /> Call Owner
                </button>
                <button
                    onClick={() => {
                        const msg = `Hello, I am contacting you regarding your vehicle (${data.vehicleNumber}). Please check your vehicle.`;
                        window.location.href = `https://wa.me/${data.contactNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
                    }}
                    className="w-full bg-slate-800 text-white p-6 rounded-[20px] font-black uppercase tracking-widest text-sm flex justify-center items-center gap-3 active:scale-95 transition-all"
                >
                    <Share2 size={20} /> Parking Alert (WhatsApp)
                </button>

                {data.emergencyContact && (
                    <div className="pt-6 mt-6 border-t border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-4 text-center">Emergency Only</span>
                        <button
                            onClick={() => window.location.href = `tel:${data.emergencyContact}`}
                            className="w-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white p-4 rounded-[15px] font-black uppercase tracking-widest text-xs flex justify-center items-center gap-3 active:scale-95 transition-all"
                        >
                            <AlertCircle size={16} /> Call Emergency Contact
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 selection:bg-primary/30">
            <div className="max-w-md mx-auto relative">
                <div className="flex justify-center mb-10 opacity-50">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR" className="h-8 w-auto grayscale" />
                </div>
                {category === 'people' && renderPeopleTemplate()}
                {category === 'pets' && renderPetsTemplate()}
                {category === 'valuables' && renderValuablesTemplate()}
                {category === 'vehicles' && renderVehiclesTemplate()}
            </div>
        </div>
    );
}
