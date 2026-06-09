import { motion } from "framer-motion";
import { Camera, Heart, PartyPopper, Image as ImageIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/intergration/supabase/client.ts";

const iconMap: Record<string, any> = {
    Heart,
    Camera,
    PartyPopper,
    ImageIcon,
};

const fallbackServices = [
    {
        icon_name: "Heart",
        title: "Weddings",
        price: "From $3,500",
        features: [
            "Full day coverage (up to 10 hours)",
            "Second photographer included",
            "400+ edited images",
            "Online gallery & downloads",
            "Engagement session",
            "Wedding album (30 pages)",
        ],
    },
    {
        icon_name: "Camera",
        title: "Portraits",
        price: "From $800",
        features: [
            "2-hour session",
            "2 outfit changes",
            "50+ edited images",
            "Online gallery & downloads",
            "Professional retouching",
            "Print-ready files",
        ],
    },
    {
        icon_name: "PartyPopper",
        title: "Events",
        price: "From $1,500",
        features: [
            "Up to 5 hours coverage",
            "200+ edited images",
            "Online gallery & downloads",
            "Same-week delivery",
            "Social media highlights",
            "Print-ready files",
        ],
    },
    {
        icon_name: "ImageIcon",
        title: "Lifestyle",
        price: "From $1,200",
        features: [
            "3-hour on-location session",
            "Natural light photography",
            "75+ edited images",
            "Online gallery & downloads",
            "Personalized storytelling",
            "Style consultation",
        ],
    },
];

const ServicesSection = () => {
    const { data: dbServices } = useQuery({
        queryKey: ["services"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("services")
                .select("*")
                .order("sort_order", { ascending: true });
            if (error) throw error;
            return data;
        },
    });

    const services = dbServices && dbServices.length > 0 ? dbServices : fallbackServices;

    const scrollToContact = () => {
        document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section id="services" className="section-padding bg-background">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">Services</p>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
                        Investment & <span className="italic">Packages</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, i) => {
                        const Icon = iconMap[service.icon_name] || Camera;
                        return (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.15 }}
                                className="bg-card border border-border p-8 md:p-10 hover-lift group flex flex-col h-full"
                            >
                                <Icon className="w-8 h-8 text-foreground mb-6 shrink-0" strokeWidth={1} />
                                <h3 className="font-display text-2xl text-foreground mb-2">{service.title}</h3>
                                <p className="text-muted-foreground text-sm tracking-wider mb-6">{service.price}</p>
                                <ul className="space-y-3 mb-8 flex-grow">
                                    {service.features.map((f: string) => (
                                        <li key={f} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={scrollToContact}
                                    className="w-full py-3 border border-foreground text-foreground text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300 mt-auto"
                                >
                                    Request Quote
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
