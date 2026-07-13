// src/components/admin/ServiceEditDialog.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Camera,
    Compass,
    Palette,
    Users,
    Heart,
    Trash2,
    Plus,
    Save,
    Sparkles
} from "lucide-react";

export interface Service {
    id: string;
    title: string;
    price: string;
    features: string[];
    icon_name: string;
}

interface ServiceEditDialogProps {
    service: Service | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (service: Partial<Service>) => Promise<void>;
}

const icons = [
    { name: "Compass", icon: Compass, label: "Safari" },
    { name: "Camera", icon: Camera, label: "Photography" },
    { name: "Palette", icon: Palette, label: "Art" },
    { name: "Users", icon: Users, label: "Group" },
    { name: "Heart", icon: Heart, label: "Romance" },
    { name: "Sparkles", icon: Sparkles, label: "Premium" },
];

export default function ServiceEditDialog({
    service,
    open,
    onOpenChange,
    onSave,
}: ServiceEditDialogProps) {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [iconName, setIconName] = useState("Compass");
    const [features, setFeatures] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (service) {
            setTitle(service.title);
            setPrice(service.price);
            setIconName(service.icon_name);
            setFeatures(service.features || []);
        } else {
            setTitle("");
            setPrice("");
            setIconName("Compass");
            setFeatures([]);
        }
    }, [service, open]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({
                title,
                price,
                icon_name: iconName,
                features,
            });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFeatures([...features, newFeature.trim()]);
            setNewFeature("");
        }
    };

    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const getSelectedIcon = () => {
        return icons.find(i => i.name === iconName)?.icon || Compass;
    };

    const SelectedIcon = getSelectedIcon();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border border-border/30 p-0 bg-background shadow-2xl">
                {/* Header with Gold Accent */}
                <div className="relative p-8 pb-6 border-b border-border/30">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-savanna-gold to-transparent" />

                    <DialogHeader className="text-left">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 flex items-center justify-center border border-savanna-gold/30 bg-savanna-gold/10">
                                <SelectedIcon className="w-6 h-6 text-savanna-gold" />
                            </div>
                            <div>
                                <DialogTitle className="font-display text-2xl md:text-3xl text-foreground font-light">
                                    {service ? "Edit " : "Add New "}
                                    <span className="italic text-savanna-gold">Service</span>
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {service ? "Update your service details" : "Create a new safari experience"}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Form Content */}
                <div className="p-8 space-y-6">
                    {/* Service Title */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="title"
                            className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold"
                        >
                            Service Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. The Great Migration Tour"
                            className="bg-savanna-charcoal/30 border border-border/30 focus:border-savanna-gold focus:ring-0 h-12 px-4 text-foreground placeholder:text-muted-foreground/40 transition-all"
                        />
                    </div>

                    {/* Price Label */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="price"
                            className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold"
                        >
                            Price Label
                        </Label>
                        <Input
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="e.g. From $4,500"
                            className="bg-savanna-charcoal/30 border border-border/30 focus:border-savanna-gold focus:ring-0 h-12 px-4 text-foreground placeholder:text-muted-foreground/40 transition-all"
                        />
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold">
                            Service Icon
                        </Label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {icons.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <motion.button
                                        key={item.name}
                                        type="button"
                                        onClick={() => setIconName(item.name)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`flex flex-col items-center gap-2 p-4 border transition-all ${iconName === item.name
                                                ? "border-savanna-gold bg-savanna-gold/10 shadow-lg shadow-savanna-gold/20"
                                                : "border-border/30 hover:border-savanna-gold/50 hover:bg-savanna-charcoal/30"
                                            }`}
                                    >
                                        <Icon
                                            className={`w-6 h-6 transition-colors ${iconName === item.name
                                                    ? "text-savanna-gold"
                                                    : "text-muted-foreground"
                                                }`}
                                            strokeWidth={1.5}
                                        />
                                        <span className={`text-[9px] uppercase tracking-wider font-medium ${iconName === item.name
                                                ? "text-savanna-gold"
                                                : "text-muted-foreground"
                                            }`}>
                                            {item.label}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold">
                            Service Features
                        </Label>

                        {/* Add Feature Input */}
                        <div className="flex gap-2">
                            <Input
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Add a feature (e.g. Private 4x4 Vehicle)"
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                                className="flex-1 bg-savanna-charcoal/30 border border-border/30 focus:border-savanna-gold focus:ring-0 h-12 px-4 text-foreground placeholder:text-muted-foreground/40 transition-all"
                            />
                            <Button
                                type="button"
                                onClick={addFeature}
                                disabled={!newFeature.trim()}
                                className="h-12 px-6 bg-savanna-gold text-savanna-charcoal hover:bg-savanna-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Features List */}
                        {features.length > 0 && (
                            <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-3 bg-savanna-charcoal/30 border border-border/30 p-3 group hover:border-savanna-gold/30 transition-all"
                                    >
                                        <div className="w-1.5 h-1.5 bg-savanna-gold rounded-full flex-shrink-0" />
                                        <span className="flex-1 text-sm text-foreground">{feature}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/10"
                                            onClick={() => removeFeature(index)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 text-error" />
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {features.length === 0 && (
                            <div className="mt-4 p-6 bg-savanna-charcoal/20 border border-dashed border-border/30 text-center">
                                <p className="text-xs text-muted-foreground">
                                    No features added yet. Start by adding what makes this service special.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 pt-6 border-t border-border/30 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 sm:flex-none h-12 px-8 border-border/30 text-foreground hover:bg-savanna-charcoal/30 hover:border-savanna-gold/50 tracking-[0.2em] uppercase text-xs font-medium transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !title || !price}
                        className="flex-1 sm:flex-none h-12 px-8 bg-savanna-gold text-savanna-charcoal hover:bg-savanna-gold/90 tracking-[0.2em] uppercase text-xs font-bold transition-all shadow-lg shadow-savanna-gold/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : service ? "Update Service" : "Create Service"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
