'use client';

import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { User, Shield, Palette, Key, CreditCard, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { uploadApi } from '@/api/upload.api';

const SETTINGS_TABS = [
    { id: 'profile', label: 'Public Profile', icon: User },
    { id: 'account', label: 'Account Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function GlobalSettingsLayout({ initialTab = 'profile' }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const { user, updateProfile } = useAuthStore();
    const router = useRouter();

    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const res = await uploadApi.uploadFile(formData);
            if (res.secure_url) {
                await updateProfile({ avatarUrl: res.secure_url });
            }
        } catch (err) {
            console.error("Failed to upload avatar", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setIsSaving(true);
            await updateProfile({ fullName });
        } catch (err) {
            console.error("Failed to save profile", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col bg-bg-base text-text-primary overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-border-subtle bg-bg-panel/40 px-6 flex items-center shrink-0">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Settings Sidebar */}
                <div className="w-64 border-r border-border-subtle bg-bg-base/50 p-6 flex flex-col gap-1 shrink-0 overflow-y-auto">
                    <h2 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4 px-2">User Settings</h2>
                    {SETTINGS_TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    // Optional: Sync URL silently
                                    window.history.replaceState(null, '', `/${tab.id === 'profile' ? 'profile' : 'settings'}`);
                                }}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? 'bg-brand-primary/10 text-brand-primary'
                                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Settings Content Pane */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#141414] p-8 lg:p-12">
                    <div className="max-w-3xl">

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h1 className="text-2xl font-bold mb-6">Public Profile</h1>

                                <div className="bg-bg-panel border border-border-subtle rounded-xl p-6 flex flex-col gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary to-brand-glow flex items-center justify-center text-2xl font-black text-white shadow-glow overflow-hidden shrink-0">
                                            {user?.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                user?.fullName?.charAt(0) || 'U'
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                accept="image/jpeg, image/png, image/gif"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors mb-2 flex items-center gap-2"
                                            >
                                                {isUploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : 'Upload new avatar'}
                                            </button>
                                            <p className="text-[10px] text-text-muted">JPEG, PNG or GIF. Max size 2MB.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle">
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full bg-bg-input border border-border-subtle rounded-lg px-4 py-2 text-sm focus:border-brand-primary focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                defaultValue={user?.email || ''}
                                                disabled
                                                className="w-full bg-bg-base border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-muted cursor-not-allowed"
                                            />
                                            <p className="text-[10px] text-text-muted mt-1.5">Email cannot be changed directly.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving || fullName === user?.fullName}
                                            className="flex items-center gap-2 bg-brand-primary disabled:opacity-50 disabled:grayscale hover:bg-brand-glow text-black px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-glow-sm"
                                        >
                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            Save Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* APPEARANCE TAB */}
                        {activeTab === 'appearance' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h1 className="text-2xl font-bold mb-6">Appearance</h1>
                                <div className="bg-bg-panel border border-border-subtle rounded-xl p-6">
                                    <p className="text-sm text-text-secondary mb-4">Customize how TraceWeave looks on this device.</p>

                                    <div className="grid grid-cols-3 gap-4 mt-6">
                                        <div className="border-2 border-brand-primary bg-bg-base rounded-xl p-4 cursor-pointer relative overflow-hidden">
                                            <div className="absolute top-2 right-2 w-3 h-3 bg-brand-primary rounded-full"></div>
                                            <div className="h-16 bg-[#0E0C16] border border-white/10 rounded-md mb-3"></div>
                                            <p className="text-xs font-bold text-center text-brand-primary">Space Dark</p>
                                        </div>
                                        <div className="border-2 border-transparent hover:border-border-strong bg-bg-base rounded-xl p-4 cursor-pointer transition-colors opacity-50 pointer-events-none">
                                            <div className="h-16 bg-white border border-gray-200 rounded-md mb-3"></div>
                                            <p className="text-xs font-bold text-center text-text-muted">Light Mode (Soon)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OTHER TABS (Placeholders for now) */}
                        {['account', 'apikeys', 'billing'].includes(activeTab) && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center py-20 text-center">
                                <Shield size={48} className="text-text-muted mb-4 opacity-20" />
                                <h2 className="text-lg font-bold text-text-secondary">Coming Soon</h2>
                                <p className="text-sm text-text-muted mt-2 max-w-sm">This configuration panel is currently under development.</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}