import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Crop, Save, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/intergration/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = ["Big Cats", "Great Migration", "Landscapes", "People & Culture"] as const;

type Photo = {
    id: string ;
    title: string;
    category: string;
    image_url?: string | null;
    storage_path: string;
    sort_order: number;
    created_at: string;
};

interface PhotoEditDialogProps {
    photo: Photo | null;
    imageUrl: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    setEditDialogOpen: (open: boolean) => void;
    setEditSaving: (saving: boolean) => void;
    onSaveDetails: (id: string, title: string, category: string) => void;
    onSaveCrop: (id: string, croppedBlob: Blob) => void;
    saving: boolean;
}

const createCroppedImage = async (
    imageSrc: string,
    pixelCrop: Area
): Promise<Blob> => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = reject;
        image.src = imageSrc;
    });

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))),
            "image/jpeg",
            0.92
        );
    });
};

const PhotoEditDialog = ({
    photo,
    imageUrl,
    open,
    onOpenChange,
    onSaveCrop,
    saving,
    setEditSaving,
    setEditDialogOpen,
}: PhotoEditDialogProps) => {
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [activeTab, setActiveTab] = useState("details");
    const queryClient = useQueryClient();

    // Reset state when Photo changes
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen && photo) {
            setEditTitle(photo.title);
            setEditCategory(photo.category);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCroppedAreaPixels(null);
            setActiveTab("details");
        }
        onOpenChange(isOpen);
    };

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleSaveCrop = async () => {
        if (!photo || !croppedAreaPixels) return;
        try {
            const blob = await createCroppedImage(imageUrl, croppedAreaPixels);
            onSaveCrop(photo?.id, blob);
        } catch {
            // Error handled by parent
        }
    };

    // Edit dialog handlers
    const handleSaveDetails = async () => {
        setEditSaving(true);
        const { error } = await supabase
            .from('photos')
            .update({ title: editTitle, category: editCategory })
            .eq('id', photo ? photo.id : '');
        setEditSaving(false);
        if (error) {
            toast.error(error.message);
            return;
        }
        setEditDialogOpen(false);
        setEditTitle("");
        setEditCategory("");
        setEditSaving(false);
        toast.success('Photo details updated');
        await queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
        await queryClient.invalidateQueries({ queryKey: ['portfolio-photos-home'] });
    };

    if (!photo) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border border-border/30 p-0 bg-background shadow-2xl">
                {/* Header with Gold Accent */}
                <div className="relative p-8 pb-6 border-b border-border/30">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-savanna-gold to-transparent" />

                    <DialogHeader className="text-left">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 flex items-center justify-center border border-savanna-gold/30 bg-savanna-gold/10">
                                <ImageIcon className="w-5 h-5 text-savanna-gold" />
                            </div>
                            <div>
                                <DialogTitle className="font-display text-2xl md:text-3xl text-foreground font-light">
                                    Edit <span className="italic text-savanna-gold">Photo</span>
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {photo.title}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-8 pt-6">
                        <TabsList className="w-full bg-savanna-charcoal/30 p-1 border border-border/30">
                            <TabsTrigger
                                value="details"
                                className="flex-1 data-[state=active]:bg-savanna-gold data-[state=active]:text-savanna-charcoal data-[state=active]:font-bold uppercase tracking-[0.2em] text-[10px] py-3 transition-all"
                            >
                                Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="crop"
                                className="flex-1 data-[state=active]:bg-savanna-gold data-[state=active]:text-savanna-charcoal data-[state=active]:font-bold uppercase tracking-[0.2em] text-[10px] py-3 transition-all"
                            >
                                <Crop className="h-3.5 w-3.5 mr-2" />
                                Crop & Adjust
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Details Tab */}
                    <TabsContent value="details" className="px-8 py-6 space-y-6">
                        {/* Image Preview */}
                        <div className="relative aspect-4/3 overflow-hidden border border-border/30 group">
                            <img
                                src={imageUrl}
                                alt={photo.title}
                                className="w-full h-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0 duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-savanna-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-savanna-gold/40" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-savanna-gold/40" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-savanna-gold/40" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-savanna-gold/40" />
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="edit-title"
                                    className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold"
                                >
                                    Photo Title
                                </Label>
                                <Input
                                    id="edit-title"
                                    value={editTitle}
                                    className="bg-savanna-charcoal/30 border border-border/30 focus:border-savanna-gold focus:ring-0 h-12 px-4 text-foreground placeholder:text-muted-foreground/40 transition-all"
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Enter a captivating title..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="edit-category"
                                    className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold"
                                >
                                    Category
                                </Label>
                                <Select value={editCategory} onValueChange={(v) => setEditCategory(v ?? '')}>
                                    <SelectTrigger
                                        id="edit-category"
                                        className="bg-savanna-charcoal/30 border border-border/30 focus:border-savanna-gold focus:ring-0 h-12 px-4 text-foreground"
                                    >
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-border/30">
                                        {CATEGORIES.map((c) => (
                                            <SelectItem
                                                key={c}
                                                value={c}
                                                className="text-foreground hover:bg-savanna-gold/10 hover:text-savanna-gold cursor-pointer"
                                            >
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4 pb-2">
                            <Button
                                onClick={handleSaveDetails}
                                disabled={saving || !editTitle || !editCategory}
                                className="w-full h-14 bg-savanna-gold text-savanna-charcoal hover:bg-savanna-gold/90 tracking-[0.2em] uppercase text-xs font-bold transition-all shadow-lg shadow-savanna-gold/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? "Saving Changes..." : "Update Details"}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Crop Tab */}
                    <TabsContent value="crop" className="px-8 py-6 space-y-6">
                        {/* Cropper Container */}
                        <div className="relative w-full aspect-square bg-savanna-charcoal/30 border border-border/30 overflow-hidden">
                            <Cropper
                                image={imageUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={4 / 3}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                cropShape="rect"
                                showGrid={true}
                                style={{
                                    containerStyle: {
                                        width: '100%',
                                        height: '100%',
                                    },
                                }}
                            />
                        </div>

                        {/* Zoom Control */}
                        <div className="space-y-3 p-4 bg-savanna-charcoal/30 border border-border/30">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold">
                                    Zoom Level
                                </Label>
                                <span className="text-xs font-mono text-foreground bg-savanna-charcoal px-2 py-1 border border-border/30">
                                    {zoom.toFixed(1)}x
                                </span>
                            </div>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                className="py-4"
                                onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)}
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>1.0x</span>
                                <span>2.0x</span>
                                <span>3.0x</span>
                            </div>
                        </div>

                        {/* Crop Info */}
                        <div className="p-4 bg-savanna-gold/5 border border-savanna-gold/20">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                <span className="text-savanna-gold font-bold">Tip:</span> Adjust the crop area and zoom level to focus on the most compelling part of your image. The final aspect ratio will be 4:3.
                            </p>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4 pb-2">
                            <Button
                                onClick={handleSaveCrop}
                                disabled={saving}
                                className="w-full h-14 bg-savanna-gold text-savanna-charcoal hover:bg-savanna-gold/90 tracking-[0.2em] uppercase text-xs font-bold transition-all shadow-lg shadow-savanna-gold/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Crop className="h-4 w-4 mr-2" />
                                {saving ? "Processing Crop..." : "Apply & Save Crop"}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default PhotoEditDialog;
export { CATEGORIES };
export type { Photo };
