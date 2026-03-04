import { useState, useEffect } from 'react';
import {
    Search, Filter, MoreVertical, Shield, Users, CreditCard,
    Activity, ArrowUpRight, CheckCircle2, Clock, AlertTriangle,
    Plus, Trash2, Edit3, Image as ImageIcon, Megaphone,
    Package, Settings, LayoutDashboard, LogOut, ChevronRight, ExternalLink
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { db, auth } from '../lib/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [profilesList, setProfilesList] = useState([]);
    const [products, setProducts] = useState([]);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();

    // List of allowed admin emails
    const ADMIN_EMAILS = [
        'pratheekmadupu2006@gmail.com', // Your correct email
        'resqr.official@gmail.com'
    ];

    // Form states
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingAd, setEditingAd] = useState(null);

    const filteredUsers = users.filter(u =>
        (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const getProfileForAuthUser = (email) => {
        if (!email) return null;
        return profilesList.find(p => p.email === email || (p.name && p.name.toLowerCase() === email.split('@')[0].toLowerCase()));
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user && ADMIN_EMAILS.includes(user.email)) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
                if (!authLoading) {
                    toast.error("Not authorized! Admins only.");
                    navigate('/');
                }
            }
            setAuthLoading(false);
        });

        const authUsersRef = ref(db, 'users');
        const profilesRef = ref(db, 'profiles');
        const productsRef = ref(db, 'config/products');
        const adsRef = ref(db, 'config/ads');

        const unsubUsers = onValue(authUsersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const userList = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                setUsers(userList);
            } else {
                setUsers([]);
            }
            setLoading(false);
        });

        const unsubProfiles = onValue(profilesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                setProfilesList(list);
            } else {
                setProfilesList([]);
            }
        });

        const unsubProducts = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const prodList = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                setProducts(prodList);
            }
        });

        const unsubAds = onValue(adsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const adList = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                setAds(adList);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubUsers();
            unsubProfiles();
            unsubProducts();
            unsubAds();
        };
    }, [navigate, authLoading]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAdmin) return null;

    const handleAddProduct = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const product = {
            title: formData.get('title'),
            price: formData.get('price'),
            features: formData.get('features').split(',').map(f => f.trim()),
            best: formData.get('best') === 'on'
        };

        if (editingProduct) {
            update(ref(db, `config/products/${editingProduct.id}`), product)
                .then(() => toast.success('Product updated!'))
                .catch(() => toast.error('Update failed'));
        } else {
            push(ref(db, 'config/products'), product)
                .then(() => toast.success('Product added!'))
                .catch(() => toast.error('Creation failed'));
        }
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleAddAd = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const ad = {
            imageUrl: formData.get('imageUrl'),
            linkUrl: formData.get('linkUrl'),
            text: formData.get('text'),
            active: formData.get('active') === 'on'
        };

        if (editingAd) {
            update(ref(db, `config/ads/${editingAd.id}`), ad)
                .then(() => toast.success('Ad updated!'))
                .catch(() => toast.error('Update failed'));
        } else {
            push(ref(db, 'config/ads'), ad)
                .then(() => toast.success('Ad added!'))
                .catch(() => toast.error('Creation failed'));
        }
        setIsAdModalOpen(false);
        setEditingAd(null);
    };

    const handleCreateProfile = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

        const profileData = {
            name: name,
            bloodGroup: formData.get('bloodGroup'),
            phone: formData.get('phone'),
            email: selectedUserForProfile?.email || '',
            medicalConditions: formData.get('conditions') || 'None reported',
            allergies: formData.get('allergies') || 'None reported',
            emergencyContactName: formData.get('eName'),
            emergencyContactRelation: formData.get('eRelation'),
            emergencyContactPhone: formData.get('ePhone'),
            id: slug,
            createdAt: new Date().toISOString()
        };

        set(ref(db, `profiles/${slug}`), profileData)
            .then(() => {
                toast.success('Medical Profile Generated!');
                setIsProfileModalOpen(false);
                setSelectedUserForProfile(null);
            })
            .catch(() => toast.error('Creation failed'));
    };

    const deleteItem = (path) => {
        if (confirm('Are you sure you want to delete this?')) {
            remove(ref(db, path))
                .then(() => toast.success('Deleted successfully'))
                .catch(() => toast.error('Delete failed'));
        }
    };

    const stats = [
        { label: 'Total Users', value: users.length, change: '+12%', icon: <Users /> },
        { label: 'Platform Revenue', value: '₹' + (users.length * 99).toLocaleString(), change: '+8%', icon: <CreditCard /> },
        { label: 'Live Products', value: products.length, change: '0%', icon: <Package /> },
        { label: 'Active Ads', value: ads.filter(a => a.active).length, change: '+15%', icon: <Megaphone /> },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-white">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Shield className="text-white" size={24} />
                    </div>
                    <span className="font-black text-xl tracking-tighter uppercase italic">RESQR Admin</span>
                </div>

                <nav className="space-y-1">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                        { id: 'users', label: 'Auth Users', icon: <Users size={20} /> },
                        { id: 'profiles', label: 'Medical Profiles', icon: <Activity size={20} /> },
                        { id: 'products', label: 'Inventory & Prices', icon: <Package size={20} /> },
                        { id: 'ads', label: 'Ad Campaigns', icon: <Megaphone size={20} /> },
                        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === item.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/10'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>

                <div className="pt-8 border-t border-slate-800">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut size={20} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto max-h-screen">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold capitalize">
                            {activeTab === 'users' ? 'Registered Accounts' :
                                activeTab === 'profiles' ? 'Medical QR Profiles' :
                                    activeTab + ' Panel'}
                        </h1>
                        <p className="text-slate-400">Manage your system from a single interface.</p>
                    </div>
                    <div className="flex gap-3">
                        {activeTab === 'products' && (
                            <Button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="gap-2">
                                <Plus size={18} /> New Product
                            </Button>
                        )}
                        {activeTab === 'ads' && (
                            <Button onClick={() => { setEditingAd(null); setIsAdModalOpen(true); }} className="gap-2">
                                <Plus size={18} /> New Campaign
                            </Button>
                        )}
                        <Button variant="outline" className="border-slate-800 bg-slate-900">Export CSV</Button>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, i) => (
                                <Card key={i} className="bg-slate-900 border-slate-800 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-slate-950 rounded-xl text-primary border border-slate-800">
                                            {stat.icon}
                                        </div>
                                        <Badge variant="success" className="text-[10px]">{stat.change}</Badge>
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-3xl font-black">{stat.value}</h3>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="bg-slate-900 border-slate-800">
                                <h2 className="text-xl font-bold mb-6">Recent User Activity</h2>
                                <div className="space-y-4">
                                    {users.slice(-5).reverse().map(user => {
                                        const profile = getProfileForAuthUser(user.email);
                                        return (
                                            <div key={user.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center font-bold">{user.name?.[0]}</div>
                                                    <div>
                                                        <p className="font-bold">{user.name}</p>
                                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">{user.id}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {profile && (
                                                        <Link
                                                            to={`/e/${profile.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            title="View QR Profile"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </Link>
                                                    )}
                                                    <Badge variant="success">New User</Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            <Card className="bg-slate-900 border-slate-800">
                                <h2 className="text-xl font-bold mb-6">System Health</h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Database Latency</span>
                                            <span className="text-green-500">Normal (24ms)</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                                            <div className="w-1/4 h-full bg-green-500"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>API Availability</span>
                                            <span className="text-green-500">99.9%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                                            <div className="w-[99%] h-full bg-green-500"></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <Card className="bg-slate-900 border-slate-800 overflow-hidden p-0">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4">
                            <h2 className="text-xl font-bold">Authenticated Users</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name/email..."
                                    className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-white">User</th>
                                        <th className="px-6 py-4 text-white">Auth Method</th>
                                        <th className="px-6 py-4 text-white">Last Login</th>
                                        <th className="px-6 py-4 text-white">Medical Profile</th>
                                        <th className="px-6 py-4 text-right text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredUsers.map(user => {
                                        const profile = getProfileForAuthUser(user.email);
                                        return (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white">{user.name}</span>
                                                        <span className="text-xs text-slate-500">{user.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={user.email?.includes('gmail') ? 'primary' : 'gray'}>
                                                        {user.email?.includes('gmail') ? 'Google' : 'Email'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-400">
                                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {profile ? (
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="success">Active</Badge>
                                                                <span className="text-xs font-bold text-primary">{profile.bloodGroup}</span>
                                                            </div>
                                                            <span className="text-[10px] text-slate-500 uppercase font-black">{profile.id || 'N/A'}</span>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="gray" className="opacity-50 italic">No Profile Yet</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 text-white">
                                                        {profile && (
                                                            <Link
                                                                to={`/e/${profile.id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 opacity-50 hover:opacity-100 hover:text-primary transition-all bg-slate-800 rounded-lg"
                                                                title="View QR Profile"
                                                            >
                                                                <ExternalLink size={18} />
                                                            </Link>
                                                        )}
                                                        {!profile && (
                                                            <button
                                                                className="p-2 opacity-50 hover:opacity-100 hover:text-green-500 transition-all bg-slate-800 rounded-lg"
                                                                onClick={() => { setSelectedUserForProfile(user); setIsProfileModalOpen(true); }}
                                                                title="Generate Medical Profile"
                                                            >
                                                                <Plus size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="p-2 opacity-50 hover:opacity-100 hover:text-red-500 transition-all bg-slate-800 rounded-lg"
                                                            onClick={() => deleteItem(`users/${user.id}`)}
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {activeTab === 'profiles' && (
                    <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-white">Slug / ID</th>
                                        <th className="px-6 py-4 text-white">Patient Name</th>
                                        <th className="px-6 py-4 text-white">Blood Group</th>
                                        <th className="px-6 py-4 text-white">Phone</th>
                                        <th className="px-6 py-4 text-right text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {profilesList.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.id?.toLowerCase().includes(searchTerm.toLowerCase())).map((profile, idx) => (
                                        <tr key={profile.id || idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <code className="text-[10px] bg-slate-800 px-2 py-1 rounded text-primary font-bold">
                                                    {profile.id || profile.name?.toLowerCase().replace(/\s+/g, '-')}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 font-bold">{profile.name}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="danger">{profile.bloodGroup}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">{profile.phone}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/e/${profile.id || profile.name?.toLowerCase().replace(/\s+/g, '-')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 opacity-50 hover:opacity-100 hover:text-primary transition-all bg-slate-800 rounded-lg"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </Link>
                                                    <button
                                                        className="p-2 opacity-50 hover:opacity-100 hover:text-red-500 transition-all bg-slate-800 rounded-lg"
                                                        onClick={() => deleteItem(`profiles/${profile.id || profile.name?.toLowerCase().replace(/\s+/g, '-')}`)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(prod => (
                            <Card key={prod.id} className="bg-slate-900 border-slate-800 p-6 relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingProduct(prod); setIsProductModalOpen(true); }} className="p-2 bg-slate-950 border border-slate-800 rounded-lg hover:text-primary"><Edit3 size={16} /></button>
                                    <button onClick={() => deleteItem(`config/products/${prod.id}`)} className="p-2 bg-slate-950 border border-slate-800 rounded-lg hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                                <h3 className="text-xl font-black mb-1">{prod.title}</h3>
                                <p className="text-3xl font-black text-primary mb-4">₹{prod.price}</p>
                                <ul className="space-y-2 mb-6">
                                    {prod.features?.map((f, i) => (
                                        <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                                            <div className="w-1 h-1 bg-primary rounded-full" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                {prod.best && <Badge variant="primary" className="w-full justify-center py-2">Most Popular</Badge>}
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'ads' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ads.map(ad => (
                            <Card key={ad.id} className="bg-slate-900 border-slate-800 overflow-hidden p-0 group">
                                <div className="relative h-48 bg-slate-950 flex items-center justify-center overflow-hidden">
                                    {ad.imageUrl ? (
                                        <img src={ad.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <ImageIcon size={48} className="text-slate-800" />
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button onClick={() => { setEditingAd(ad); setIsAdModalOpen(true); }} className="p-2 bg-slate-900/80 backdrop-blur-md rounded-lg hover:text-primary"><Edit3 size={16} /></button>
                                        <button onClick={() => deleteItem(`config/ads/${ad.id}`)} className="p-2 bg-slate-900/80 backdrop-blur-md rounded-lg hover:text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                    <Badge className="absolute bottom-4 left-4" variant={ad.active ? 'success' : 'gray'}>
                                        {ad.active ? 'Running' : 'Paused'}
                                    </Badge>
                                </div>
                                <div className="p-6">
                                    <h4 className="font-bold mb-2 break-words">{ad.text || 'No description'}</h4>
                                    <p className="text-xs text-slate-500 break-all">{ad.linkUrl}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Modals */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-slate-900 border-slate-800 p-8">
                        <h2 className="text-2xl font-black mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <Input label="Product Title" name="title" defaultValue={editingProduct?.title} required />
                            <Input label="Price (₹)" name="price" type="number" defaultValue={editingProduct?.price} required />
                            <div className="w-full">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Features (Comma separated)</label>
                                <textarea
                                    name="features"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none h-32"
                                    defaultValue={editingProduct?.features?.join(', ')}
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="best" defaultChecked={editingProduct?.best} className="w-5 h-5 accent-primary" />
                                <span className="font-bold">Mark as "Most Popular"</span>
                            </label>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1">Save Product</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {isAdModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-slate-900 border-slate-800 p-8">
                        <h2 className="text-2xl font-black mb-6">{editingAd ? 'Edit Ad' : 'Add New Ad'}</h2>
                        <form onSubmit={handleAddAd} className="space-y-4">
                            <Input label="Lead Text" name="text" defaultValue={editingAd?.text} placeholder="Sponsered: Big Sale Now!" required />
                            <Input label="Image URL" name="imageUrl" defaultValue={editingAd?.imageUrl} placeholder="https://..." required />
                            <Input label="Destination URL" name="linkUrl" defaultValue={editingAd?.linkUrl} placeholder="https://..." required />
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="active" defaultChecked={editingAd?.active !== false} className="w-5 h-5 accent-primary" />
                                <span className="font-bold">Enable Ad immediately</span>
                            </label>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAdModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1">Save Campaign</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <Card className="w-full max-w-2xl bg-slate-900 border-slate-800 p-8 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-black mb-6">Generate Medical Profile</h2>
                        <p className="text-slate-400 mb-6 text-sm">Target User: <span className="text-white font-bold">{selectedUserForProfile?.email}</span></p>
                        <form onSubmit={handleCreateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Full Name" name="name" defaultValue={selectedUserForProfile?.name} required />
                                <div className="w-full">
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Blood Group</label>
                                    <select name="bloodGroup" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" required>
                                        <option value="">Select...</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                                <Input label="Phone Number" name="phone" required />
                                <Input label="Medical Conditions" name="conditions" placeholder="Diabetes, Hypertension, etc." />
                                <Input label="Allergies" name="allergies" placeholder="Peanuts, Penicillin, etc." />
                            </div>

                            <div className="border-t border-slate-800 pt-6">
                                <h3 className="text-lg font-bold mb-4">Emergency Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="Contact Name" name="eName" required />
                                    <Input label="Relation" name="eRelation" placeholder="Father, Mother, Spouse" required />
                                    <Input label="Contact Phone" name="ePhone" required />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsProfileModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1">Generate QR Profile</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
