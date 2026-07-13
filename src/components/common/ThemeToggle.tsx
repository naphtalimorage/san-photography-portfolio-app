// src/components/admin/ThemeToggle.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const ThemeToggle = () => {
    const [theme, setTheme] = useState<Theme>('dark');
    const [isOpen, setIsOpen] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const stored = localStorage.getItem('mara-theme') as Theme | null;
        if (stored) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTheme(stored);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', prefersDark);
        } else {
            root.classList.toggle('dark', theme === 'dark');
        }

        localStorage.setItem('mara-theme', theme);
    }, [theme]);

    // Listen for system theme changes when in system mode
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            document.documentElement.classList.toggle('dark', e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    const currentTheme = themes.find(t => t.value === theme);
    const CurrentIcon = currentTheme?.icon || Moon;

    return (
        <div className="relative">
            {/* Button with same outline as AdminShieldLink */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md border border-border/60 bg-background/70 hover:bg-background hover:border-savanna-gold/50 hover:text-savanna-gold text-muted-foreground transition-all duration-300 hover:cursor-pointer active:scale-95"
                aria-label="Toggle theme"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={theme}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CurrentIcon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    </motion.div>
                </AnimatePresence>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-background border border-border/30 shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Gold accent line */}
                            <div className="h-[2px] bg-gradient-to-r from-transparent via-savanna-gold to-transparent" />

                            <div className="p-2 space-y-1">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold px-3 py-2">
                                    Appearance
                                </p>

                                {themes.map((t) => {
                                    const Icon = t.icon;
                                    const isActive = theme === t.value;

                                    return (
                                        <button
                                            key={t.value}
                                            onClick={() => {
                                                setTheme(t.value);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all group ${
                                                isActive
                                                    ? 'bg-savanna-gold/10 text-savanna-gold'
                                                    : 'text-foreground hover:bg-savanna-charcoal/30'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 flex items-center justify-center border transition-all ${
                                                isActive
                                                    ? 'border-savanna-gold bg-savanna-gold/10'
                                                    : 'border-border/30 group-hover:border-savanna-gold/50'
                                            }`}>
                                                <Icon className={`w-7 h-7 ${isActive ? 'text-savanna-gold' : 'text-muted-foreground'}`} />
                                            </div>
                                            <span className="flex-1 text-left font-medium">{t.label}</span>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-1.5 h-1.5 bg-savanna-gold rounded-full"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Footer hint */}
                            <div className="px-3 py-2 border-t border-border/30 bg-savanna-charcoal/20">
                                <p className="text-[10px] text-muted-foreground">
                                    {theme === 'system' ? 'Following system preference' : `Using ${theme} theme`}
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeToggle;
