// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Menu, X, LogOut } from 'lucide-react';
import { MdPhotoLibrary, MdAutoAwesome, MdVideoLibrary } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { supabase } from '@/intergration/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/common/ThemeToggle';

import MediaLibraryTab from '@/components/adminPage/MediaLibraryTab';
import ServicesTab from '@/components/adminPage/ServicesTab';
import ReelsTab from '@/components/adminPage/ReelsTab';

const navItems = [
    { icon: MdPhotoLibrary, label: 'Media Library', value: 'media' },
    { icon: MdAutoAwesome, label: 'Services', value: 'services' },
    { icon: MdVideoLibrary, label: 'Reels', value: 'reels' },
];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('media');
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserEmail(user.email ?? null);
        });
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [activeTab]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            toast.success('Signed out successfully');
            navigate('/');
        } catch (err: any) {
            toast.error(err.message || 'Failed to sign out');
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setIsMobileMenuOpen(false);
    };

    const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <>
            <div className="px-6 pt-0 lg:pt-6 mb-6">
                <div className="flex items-center justify-between lg:mb-4">
                    {!isMobile && (
                        <div className="flex items-center gap-2">
                            <span className="font-display text-sm text-admin-foreground uppercase tracking-tight font-semibold">San</span>
                            <span className="font-display text-sm italic text-admin-foreground/70 uppercase tracking-tight">Studio</span>
                        </div>
                    )}

                    {!isMobile && (
                        <ThemeToggle/>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-4 border-t border-admin-border/50">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-xs text-admin-muted-foreground hover:text-admin-foreground transition-colors"
                    >
                        <Home className="w-3 h-3" />
                        <span>View Site</span>
                    </Link>

                    {isMobile && <ThemeToggle />}
                </div>
            </div>

            <nav className="flex-1 px-2">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.value;

                    return (
                        <button
                            key={index}
                            onClick={() => handleTabChange(item.value)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md mb-1 transition-all ${
                                isActive
                                    ? 'bg-admin-accent text-admin-foreground border-l-2 border-admin-foreground'
                                    : 'text-admin-muted-foreground hover:bg-admin-accent/50 hover:text-admin-foreground'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="ml-auto w-1.5 h-1.5 bg-admin-foreground rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto px-4 pb-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-admin-muted/50 rounded-md border border-admin-border/50">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-admin-background border border-admin-border flex-shrink-0">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKpuIcUBkp4FgYz0u5585npfKnKPsYC5TQZOSsU29uzigAJOFUE9ciAZpFy7VqcLrxY7KKVQ-OdiR_brFpCnbn9jwVmKNdBuOMzgNNQsc9xBxCWyVoOPG4jZhaUJqg3F1Yh7b9vPibajF8fqW4gddJasEw8w_zbODp8fc7SaLgLcIjvMCzotfgcAL4JtX-PAF2BirEcSMkp0gCnfmJHwtJqdrXbie3NzUmI2Fugv30DLJOO2yydHlwJQ"
                            alt="Admin"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-admin-foreground block truncate">{userEmail?.split('@')[0] || 'Admin User'}</span>
                        <span className="text-xs text-admin-muted-foreground truncate block">{userEmail || 'Senior Editor'}</span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="text-admin-muted-foreground hover:text-admin-destructive transition-colors p-1 flex-shrink-0"
                        aria-label="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        // ✅ Wrapper applying the specific admin color palette to the entire page
        <div className="min-h-screen bg-admin-background text-admin-foreground">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 fixed left-0 top-0 h-screen bg-admin-card border-r border-admin-border/50 flex-col z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Top Bar */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-admin-background/95 backdrop-blur-xl border-b border-admin-border/50">
                <div className="flex items-center justify-between h-16 px-5">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="w-10 h-10 flex items-center justify-center text-admin-foreground hover:text-admin-foreground/70 transition-colors active:scale-90"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="font-display text-sm text-admin-foreground uppercase tracking-tight font-semibold">San</span>
                        <span className="font-display text-sm italic text-admin-foreground/70 uppercase tracking-tight">Studio</span>
                    </div>

                    <ThemeToggle />
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-admin-foreground/20 to-transparent" />
            </header>

            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden fixed inset-0 bg-admin-background/80 backdrop-blur-sm z-[60]"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="md:hidden fixed left-0 top-0 h-full w-[85%] max-w-sm bg-admin-card border-r border-admin-border/50 flex flex-col z-[70] shadow-2xl"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-admin-border/50">
                                <div>
                                    <h1 className="font-display text-lg text-admin-foreground uppercase tracking-tight font-semibold">San Studio</h1>
                                    <p className="text-[10px] text-admin-muted-foreground uppercase tracking-widest mt-0.5">Portfolio Manager</p>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center border border-admin-border/50 text-admin-foreground hover:bg-admin-muted/50 transition-all active:scale-90 rounded-md"
                                    aria-label="Close menu"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col overflow-y-auto">
                                <SidebarContent isMobile />
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <main className="md:ml-64 min-h-screen pt-24 md:pt-0 px-5 md:px-8 lg:px-12 py-5 md:py-12 lg:py-16">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col">
                    <TabsList className="mb-8 hidden md:flex bg-admin-muted/50 border border-admin-border/50">
                        <TabsTrigger value="media" className="data-[state=active]:bg-admin-background data-[state=active]:text-admin-foreground">Media Library</TabsTrigger>
                        <TabsTrigger value="services" className="data-[state=active]:bg-admin-background data-[state=active]:text-admin-foreground">Services</TabsTrigger>
                        <TabsTrigger value="reels" className="data-[state=active]:bg-admin-background data-[state=active]:text-admin-foreground">Reels</TabsTrigger>
                    </TabsList>

                    <TabsContent value="media" className="mt-0">
                        <MediaLibraryTab />
                    </TabsContent>
                    <TabsContent value="services" className="mt-0">
                        <ServicesTab />
                    </TabsContent>
                    <TabsContent value="reels" className="mt-0">
                        <ReelsTab />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default AdminDashboard;
