import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

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
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollTo = (href: string) => {
        setMobileOpen(false);
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-background/90 backdrop-blur-md shadow-sm py-3"
                    : "bg-transparent py-6"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`transition-colors duration-300 ${
                        scrolled ? "text-foreground" : "text-white"
                    }`}
                >
                    <Logo />
                </a>

                {/* Desktop */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={() => scrollTo(link.href)}
                            className={`text-sm tracking-widest uppercase font-light transition-colors duration-300 hover:opacity-70 ${
                                scrolled ? "text-foreground" : "text-white"
                            }`}
                        >
                            {link.label}
                        </button>
                    ))}
                    <ThemeToggle scrolled={scrolled} />
                    <button
                        onClick={() => scrollTo("#contact")}
                        className={`text-sm tracking-widest uppercase px-5 py-2 border transition-all duration-300 hover:bg-foreground hover:text-background ${
                            scrolled
                                ? "border-foreground text-foreground"
                                : "border-white text-white hover:bg-white hover:text-black"
                        }`}
                    >
                        Book Now
                    </button>
                </div>

                {/* Mobile toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    <ThemeToggle scrolled={scrolled} />
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className={`transition-colors ${
                            scrolled ? "text-foreground" : "text-white"
                        }`}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden bg-background/95 backdrop-blur-md border-b border-border"
                    >
                        <div className="px-6 py-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <button
                                    key={link.label}
                                    onClick={() => scrollTo(link.href)}
                                    className="text-sm tracking-widest uppercase text-foreground text-left py-2"
                                >
                                    {link.label}
                                </button>
                            ))}
                            <button
                                onClick={() => scrollTo("#contact")}
                                className="text-sm tracking-widest uppercase border border-foreground text-foreground px-5 py-3 mt-2 hover:bg-foreground hover:text-background transition-all"
                            >
                                Book Now
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
