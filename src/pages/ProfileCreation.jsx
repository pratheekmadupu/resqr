import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, ChevronLeft, User, Activity, Bell, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db, auth } from '../lib/firebase';
import { ref, set } from 'firebase/database';

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
                await set(ref(db, 'profiles/' + nameSlug), formData);

                // Also save the active slug for the QR code to use locally
                localStorage.setItem('resqr_active_slug', nameSlug);

                toast.success('Profile created successfully!');

                if (auth.currentUser) {
                    navigate('/payment');
                } else {
                    navigate('/login');
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
        <div className="min-h-[calc(100vh-64px)] bg-slate-950 py-12 px-4 text-white">
            <div className="max-w-3xl mx-auto">
                {/* Step Indicator */}
                <div className="flex justify-between items-center mb-12">
                    {steps.map((s, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step > i + 1 ? 'bg-green-500 text-white' :
                                    step === i + 1 ? 'bg-primary text-white ring-4 ring-primary/20' :
                                        'bg-slate-900 text-white/40 border border-slate-800'
                                    }`}
                            >
                                {step > i + 1 ? <CheckCircle2 size={24} /> : s.icon}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${step === i + 1 ? 'text-primary' : 'text-white/40'
                                }`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                    {/* Connecting Lines */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-10 mx-auto max-w-2xl px-12"></div>
                </div>

                <Card className="p-8 md:p-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && (
                                <div className="space-y-6">
                                    <header className="mb-8 text-center">
                                        <h2 className="text-3xl font-extrabold text-white">Basic Information</h2>
                                        <p className="text-white opacity-70 mt-2">Let's start with who you are.</p>
                                    </header>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Full Name"
                                            name="name"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                        <Select
                                            label="Blood Group"
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleChange}
                                            options={[
                                                { label: 'Select Group', value: '' },
                                                { label: 'A+', value: 'A+' },
                                                { label: 'A-', value: 'A-' },
                                                { label: 'B+', value: 'B+' },
                                                { label: 'B-', value: 'B-' },
                                                { label: 'AB+', value: 'AB+' },
                                                { label: 'AB-', value: 'AB-' },
                                                { label: 'O+', value: 'O+' },
                                                { label: 'O-', value: 'O-' },
                                            ]}
                                        />
                                        <Input
                                            label="Date of Birth"
                                            name="dob"
                                            type="date"
                                            value={formData.dob}
                                            onChange={handleChange}
                                        />
                                        <Input
                                            label="Phone Number"
                                            name="phone"
                                            placeholder="+91 9876543210"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <header className="mb-8 text-center">
                                        <h2 className="text-3xl font-extrabold text-white">Medical Information</h2>
                                        <p className="text-white opacity-70 mt-2">This help doctors treat you correctly.</p>
                                    </header>
                                    <Input
                                        label="Allergies (if any)"
                                        name="allergies"
                                        placeholder="Peanuts, Penicillin, Dust, etc."
                                        value={formData.allergies}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Current Medications"
                                        name="medications"
                                        placeholder="Aspirin, Insulin, etc."
                                        value={formData.medications}
                                        onChange={handleChange}
                                    />
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-white mb-1.5 opacity-90">Other Medical Conditions</label>
                                        <textarea
                                            name="medicalConditions"
                                            rows="4"
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-600 text-white"
                                            placeholder="Asthma, Diabetes, Heart Disease, etc."
                                            value={formData.medicalConditions}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <header className="mb-8 text-center">
                                        <h2 className="text-3xl font-extrabold text-white">Emergency Contacts</h2>
                                        <p className="text-white opacity-70 mt-2">Who should we notify in a crisis?</p>
                                    </header>
                                    <div className="grid grid-cols-1 gap-6">
                                        <Input
                                            label="Contact Name"
                                            name="emergencyContactName"
                                            placeholder="Jane Doe"
                                            value={formData.emergencyContactName}
                                            onChange={handleChange}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Contact Phone"
                                                name="emergencyContactPhone"
                                                placeholder="+91 98765 43210"
                                                value={formData.emergencyContactPhone}
                                                onChange={handleChange}
                                            />
                                            <Input
                                                label="Relation"
                                                name="emergencyContactRelation"
                                                placeholder="Sister / Spouse / Parent"
                                                value={formData.emergencyContactRelation}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8">
                                    <header className="mb-8 text-center">
                                        <h2 className="text-3xl font-extrabold text-white">Review Your Profile</h2>
                                        <p className="text-white opacity-70 mt-2">Make sure everything is correct.</p>
                                    </header>

                                    <div className="bg-slate-900 rounded-2xl p-6 space-y-4 border border-slate-800">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs font-bold text-white opacity-60 uppercase">Name</span>
                                                <p className="font-bold text-white">{formData.name || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-white opacity-60 uppercase">Blood Group</span>
                                                <p className="font-bold text-primary">{formData.bloodGroup || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="border-t border-slate-800 pt-4">
                                            <span className="text-xs font-bold text-white opacity-60 uppercase">Medical Summary</span>
                                            <p className="text-sm text-white leading-relaxed">
                                                Allergies: {formData.allergies || 'None'}<br />
                                                Conditions: {formData.medicalConditions || 'None'}
                                            </p>
                                        </div>
                                        <div className="border-t border-slate-800 pt-4">
                                            <span className="text-xs font-bold text-white opacity-60 uppercase">Emergency Contact</span>
                                            <p className="font-bold text-white">
                                                {formData.emergencyContactName} ({formData.emergencyContactRelation})<br />
                                                <span className="text-sm font-medium text-white opacity-70">{formData.emergencyContactPhone}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Actions */}
                    <div className="mt-12 flex items-center justify-between border-t border-slate-800 pt-8">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            className={step === 1 ? 'invisible' : ''}
                        >
                            <ChevronLeft size={20} /> Back
                        </Button>
                        <Button onClick={handleNext} className="min-w-[140px]">
                            {step === 4 ? 'Proceed to Payment' : 'Next Step'} <ChevronRight size={20} />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
