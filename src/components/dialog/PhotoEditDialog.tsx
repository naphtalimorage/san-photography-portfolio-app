import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Crop, Save } from "lucide-react";

const CATEGORIES = ["Weddings", "Portraits", "Events", "Lifestyle"] as const;

type Photo = {
    id: string;
    title: string;
    category: string;
    storage_path: string;
    sort_order: number;
    created_at: string;
};

interface PhotoEditDialogProps {
    photo: Photo | null;
    imageUrl: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
                             onSaveDetails,
                             onSaveCrop,
                             saving,
                         }: PhotoEditDialogProps) => {
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [activeTab, setActiveTab] = useState("details");

    // Reset state when photo changes
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
            onSaveCrop(photo.id, blob);
        } catch {
            // Error handled by parent
        }
    };

    if (!photo) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-none p-0 bg-background rounded-none shadow-2xl">
                <div className="p-8 pb-0">
                    <DialogHeader className="mb-6 text-left">
                        <DialogTitle className="font-display text-3xl font-light text-foreground">
                            Edit <span className="italic">Photo</span>
                        </DialogTitle>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full bg-secondary/50 p-1 rounded-none border-b border-border/50">
                            <TabsTrigger value="details" className="flex-1 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none uppercase tracking-widest text-[10px] font-semibold py-3">Details</TabsTrigger>
                            <TabsTrigger value="crop" className="flex-1 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none uppercase tracking-widest text-[10px] font-semibold py-3">
                                <Crop className="h-3.5 w-3.5 mr-2" />
                                Crop
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-6 mt-8">
                            <div className="aspect-[4/3] rounded-none overflow-hidden bg-muted group relative">
                                <img src={imageUrl} alt={photo.title} className="w-full h-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0 duration-700" />
                                <div className="absolute inset-0 ring-1 ring-inset ring-foreground/5 pointer-events-none" />
                            </div>
                            <div className="space-y-5">
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="edit-title" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Photo Title</Label>
                                    <Input
                                        id="edit-title"
                                        value={editTitle}
                                        className="bg-secondary/30 border-none h-12 rounded-none focus-visible:ring-1 focus-visible:ring-foreground/10 px-4"
                                        onChange={(e) => setEditTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="edit-category" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Category</Label>
                                    <Select value={editCategory} onValueChange={setEditCategory}>
                                        <SelectTrigger id="edit-category" className="bg-secondary/30 border-none h-12 rounded-none focus:ring-1 focus:ring-foreground/10 px-4">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-border">
                                            {CATEGORIES.map((c) => (
                                                <SelectItem key={c} value={c} className="rounded-none">{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="pt-4 pb-8">
                                <Button
                                    onClick={() => onSaveDetails(photo.id, editTitle, editCategory)}
                                    disabled={saving || !editTitle || !editCategory}
                                    className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-none tracking-[0.2em] uppercase text-xs transition-all shadow-lg"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? "Saving Changes..." : "Update Details"}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="crop" className="space-y-6 mt-8">
                            <div className="relative w-full aspect-square bg-muted/30">
                                <Cropper
                                    image={imageUrl}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={4 / 3}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>
                            <div className="space-y-3 px-1">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Zoom Level</Label>
                                    <span className="text-[10px] font-mono text-muted-foreground">{zoom.toFixed(1)}x</span>
                                </div>
                                <Slider
                                    value={[zoom]}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    className="py-4"
                                    onValueChange={([v]) => setZoom(v)}
                                />
                            </div>
                            <div className="pt-4 pb-8">
                                <Button 
                                    onClick={handleSaveCrop} 
                                    disabled={saving}
                                    className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-none tracking-[0.2em] uppercase text-xs transition-all shadow-lg"
                                >
                                    <Crop className="h-4 w-4 mr-2" />
                                    {saving ? "Processing Crop..." : "Apply & Save Crop"}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PhotoEditDialog;
export { CATEGORIES };
export type { Photo };
