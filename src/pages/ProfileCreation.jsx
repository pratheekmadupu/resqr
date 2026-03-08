import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, ChevronLeft, User, Activity, Bell, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db, auth } from '../lib/firebase';
import { ref, set, update } from 'firebase/database';

export default function ProfileCreation() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        bloodGroup: '',
        dob: '',
        phone: '',
        allergies: '',
        medications: '',
        medicalConditions: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
    });

    const steps = [
        { title: 'Personal', icon: <User size={20} /> },
        { title: 'Medical', icon: <Activity size={20} /> },
        { title: 'Contacts', icon: <Bell size={20} /> },
        { title: 'Review', icon: <CheckCircle2 size={20} /> },
    ];

    const handleNext = async () => {
        if (step < 4) setStep(step + 1);
        else {
            try {
                // Create a clean slug from the name (e.g., "John Doe" -> "john-doe")
                const nameSlug = formData.name.toLowerCase().trim().replace(/\s+/g, '-');

                // Save to Firebase Realtime Database
                const profileData = {
                    ...formData,
                    email: auth.currentUser?.email || "",
                    uid: auth.currentUser?.uid || "",
                    last_updated: new Date().toISOString()
                };

                const profileRef = ref(db, 'profiles/' + nameSlug);
                await update(profileRef, profileData);

                // Also save the active slug for the QR code to use locally
                localStorage.setItem('resqr_active_slug', nameSlug);

                toast.success('Profile created successfully!');

                if (auth.currentUser) {
                    navigate('/payment');
                } else {
                    navigate('/login?redirect_to=/payment');
                }
            } catch (error) {
                console.error("Error saving profile:", error);
                toast.error('Failed to save profile. Please try again.');
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-medical-bg py-20 px-4 text-white font-manrope selection:bg-primary/30">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-16">
                    <Badge className="bg-primary/20 text-primary border-none mb-6 px-6 py-1 font-black italic tracking-widest">IDENTITY INITIALIZATION</Badge>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins mb-6">
                        Build Your <span className="text-primary italic-display">Life</span> Card.
                    </h1>
                </header>

                {/* Step Indicator */}
                <div className="relative flex justify-between items-center mb-16 px-4">
                    {/* Connecting Line */}
                    <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[2px] bg-white/5 -z-0">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: '0%' }}
                            animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    {steps.map((s, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                            <motion.div
                                animate={{
                                    scale: step === i + 1 ? 1.2 : 1,
                                    backgroundColor: step > i + 1 ? '#E63946' : step === i + 1 ? '#E63946' : '#161C2C'
                                }}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${step >= i + 1 ? 'border-primary shadow-[0_0_20px_rgba(230,57,70,0.3)]' : 'border-white/5'
                                    }`}
                            >
                                <div className={`${step >= i + 1 ? 'text-white' : 'text-slate-600'}`}>
                                    {step > i + 1 ? <CheckCircle2 size={24} /> : s.icon}
                                </div>
                            </motion.div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${step >= i + 1 ? 'text-white' : 'text-slate-600'
                                }`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                <Card className="p-10 md:p-16 bg-medical-card border-white/5 shadow-2xl rounded-[50px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {step === 1 && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter font-poppins">Bio-Information</h2>
                                        <p className="text-slate-500 font-bold text-sm italic">Let's start with your primary identity markers.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Legal Full Name</label>
                                            <Input
                                                name="name"
                                                placeholder="e.g. Dr. John Watson"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Blood Type</label>
                                            <Select
                                                name="bloodGroup"
                                                value={formData.bloodGroup}
                                                onChange={handleChange}
                                                className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20"
                                                options={[
                                                    { label: 'Select Group', value: '' },
                                                    { label: 'A Positive (A+)', value: 'A+' },
                                                    { label: 'A Negative (A-)', value: 'A-' },
                                                    { label: 'B Positive (B+)', value: 'B+' },
                                                    { label: 'B Negative (B-)', value: 'B-' },
                                                    { label: 'AB Positive (AB+)', value: 'AB+' },
                                                    { label: 'AB Negative (AB-)', value: 'AB-' },
                                                    { label: 'O Positive (O+)', value: 'O+' },
                                                    { label: 'O Negative (O-)', value: 'O-' },
                                                ]}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Birth Date</label>
                                            <Input
                                                name="dob"
                                                type="date"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20 text-white"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Secure Contact No.</label>
                                            <Input
                                                name="phone"
                                                placeholder="+91 00000 00000"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter font-poppins">Medical History</h2>
                                        <p className="text-slate-500 font-bold text-sm italic">Critical data for emergency first responders.</p>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Allergies & Reactions</label>
                                            <Input
                                                name="allergies"
                                                placeholder="e.g. Penicillin, Latex, Bee Stings"
                                                value={formData.allergies}
                                                onChange={handleChange}
                                                className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Active Medications</label>
                                            <Input
                                                name="medications"
                                                placeholder="e.g. Insulin, Beta-Blockers"
                                                value={formData.medications}
                                                onChange={handleChange}
                                                className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Chronic Conditions & Notes</label>
                                            <textarea
                                                name="medicalConditions"
                                                rows="5"
                                                className="w-full px-6 py-5 bg-slate-950/50 border border-white/5 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all placeholder:text-slate-700 text-white font-bold"
                                                placeholder="e.g. Type-1 Diabetes, Asthma, Previous Heart Surgery"
                                                value={formData.medicalConditions}
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter font-poppins">Guardian Contacts</h2>
                                        <p className="text-slate-500 font-bold text-sm italic">Who should we broadcast alerts to during a crisis?</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Primary Emergency Contact</label>
                                            <Input
                                                name="emergencyContactName"
                                                placeholder="Legal Name of Contact"
                                                value={formData.emergencyContactName}
                                                onChange={handleChange}
                                                className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Secure Phone No.</label>
                                                <Input
                                                    name="emergencyContactPhone"
                                                    placeholder="+91 00000 00000"
                                                    value={formData.emergencyContactPhone}
                                                    onChange={handleChange}
                                                    className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Legal Relation</label>
                                                <Input
                                                    name="emergencyContactRelation"
                                                    placeholder="e.g. Spouse, Parent, Brother"
                                                    value={formData.emergencyContactRelation}
                                                    onChange={handleChange}
                                                    className="bg-slate-950/50 border-white/5 rounded-2xl h-14 font-bold focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter font-poppins">Identity Preview</h2>
                                        <p className="text-slate-500 font-bold text-sm italic">Review your encrypted profile before activation.</p>
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-12 items-center bg-slate-950/50 rounded-[40px] p-10 border border-white/5 relative group">
                                        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                        <div className="w-48 h-48 bg-slate-950/80 rounded-[40px] border-4 border-primary/20 flex flex-col items-center justify-center p-6 text-center space-y-4 shadow-2xl relative overflow-hidden group-hover:border-primary/40 transition-all shrink-0">
                                            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary relative z-10 shadow-lg shadow-primary/20">
                                                <Lock size={32} />
                                            </div>
                                            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] relative z-10 italic leading-tight">
                                                IDENTITY SECURED<br />
                                                <span className="text-primary tracking-widest mt-1 inline-block">SECURE QR HUB</span>
                                            </span>
                                        </div>

                                        <div className="flex-1 space-y-8 w-full relative z-10">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Identity Owner</span>
                                                    <p className="text-xl font-black text-white uppercase italic tracking-tight">{formData.name || 'Not provided'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Blood Group</span>
                                                    <p className="text-xl font-black text-primary italic font-poppins">{formData.bloodGroup || 'Not provided'}</p>
                                                </div>
                                            </div>

                                            <div className="border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Medical Summary</span>
                                                    <p className="text-sm font-bold text-slate-300 leading-relaxed uppercase">
                                                        {formData.allergies ? `Allergies: ${formData.allergies}` : 'No known allergies'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Emergency Hub</span>
                                                    <p className="text-sm font-bold text-white uppercase italic">
                                                        {formData.emergencyContactName}<br />
                                                        <span className="text-slate-500 text-[10px]">{formData.emergencyContactPhone}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex items-center gap-4">
                                        <Shield className="text-primary shrink-0" size={24} />
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.1em] leading-relaxed">
                                            By proceeding, you agree that this information will be made available to any individual who scans your physical RESQR tag during an emergency.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Actions */}
                    <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-10">
                        <button
                            onClick={handleBack}
                            className={`flex items-center gap-3 px-8 h-14 rounded-2xl font-black italic uppercase tracking-widest text-[11px] transition-all ${step === 1 ? 'invisible' : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <ChevronLeft size={18} /> Revisit Data
                        </button>
                        <Button
                            onClick={handleNext}
                            className="px-12 h-16 text-xl font-black italic rounded-[24px] shadow-2xl shadow-primary/20 bg-primary text-white border-none group hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter"
                        >
                            {step === 4 ? 'ACTIVATE & SECURE' : 'CONTINUE FORWARD'} <ChevronRight size={24} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
