import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import AdminShieldLink from "./AdminShieldLink";

const navLinks = [
    { label: "Portfolio", href: "#portfolio" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "FAQ", href: "#faq" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
];

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const scrollTo = (href: string) => {
        setMobileOpen(false);
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "bg-background/90 backdrop-blur-md shadow-sm py-3"
                : "bg-transparent py-4 sm:py-6"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
                {/* Main Flex Container */}
                <div className="flex items-center justify-between gap-4">

                    {/* 1. LEFT: Logo (Always Visible) */}
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setMobileOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`flex-shrink-0 transition-colors duration-300 ${scrolled ? "text-foreground" : "text-white"}`}
                        aria-label="Home"
                    >
                        <Logo />
                    </a>

                    {/* 2. CENTER: Desktop Nav Links (Hidden on Mobile) */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <button
                                key={link.label}
                                onClick={() => scrollTo(link.href)}
                                className={`text-xs xl:text-sm tracking-widest uppercase font-light transition-colors duration-300 hover:opacity-70 ${scrolled ? "text-foreground" : "text-white"}`}
                            >
                                {link.label}
                            </button>
                        ))}
                        <button
                            onClick={() => scrollTo("#contact")}
                            className={`text-xs xl:text-sm tracking-widest uppercase px-4 xl:px-5 py-2 border transition-all duration-300 hover:bg-foreground hover:text-background whitespace-nowrap ${scrolled
                                ? "border-foreground text-foreground"
                                : "border-white text-white hover:bg-white hover:text-black"
                                }`}
                        >
                            Book Now
                        </button>
                    </div>

                    {/* 3. RIGHT: Global Actions (Visible on ALL Screens) */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        {/* Theme Toggle (Always Visible) */}
                        <ThemeToggle scrolled={scrolled} />

                        {/* Admin Shield (Always Visible) */}
                        <AdminShieldLink />

                        {/* Mobile Menu Toggle (Hidden on Desktop via lg:hidden) */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className={`
                                lg:hidden 
                                flex-shrink-0 
                                p-2.5 
                                rounded-lg 
                                transition-all 
                                active:scale-95
                                min-h-[44px] 
                                min-w-[44px] 
                                flex 
                                items-center 
                                justify-center
                                ${scrolled
                                    ? "text-foreground hover:bg-muted/50"
                                    : "text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                                }
                            `}
                            aria-label={mobileOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="lg:hidden bg-background/95 backdrop-blur-md border-b border-border overflow-hidden"
                    >
                        <div className="px-4 sm:px-6 py-4 flex flex-col gap-1 max-h-[calc(100vh-80px)] overflow-y-auto">
                            {/* Close Button */}
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground py-3 px-2 rounded-lg transition-colors mb-2 self-end"
                            >
                                <X size={18} />
                                <span className="text-xs tracking-widest uppercase">Close</span>
                            </button>

                            {/* Nav Links */}
                            {navLinks.map((link, index) => (
                                <motion.button
                                    key={link.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => scrollTo(link.href)}
                                    className="text-sm tracking-widest uppercase text-foreground text-left py-4 px-3 hover:bg-muted/50 rounded-lg transition-colors min-h-[48px] flex items-center active:scale-[0.98]"
                                >
                                    {link.label}
                                </motion.button>
                            ))}

                            {/* Divider */}
                            <div className="h-px bg-border/50 my-2" />

                            {/* Book Now */}
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: navLinks.length * 0.05 + 0.1 }}
                                onClick={() => scrollTo("#contact")}
                                className="w-full text-sm tracking-widest uppercase border-2 border-foreground text-foreground px-5 py-4 mt-2 hover:bg-foreground hover:text-background transition-all rounded-lg text-center font-medium min-h-[48px] active:scale-[0.98]"
                            >
                                Book Now
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;