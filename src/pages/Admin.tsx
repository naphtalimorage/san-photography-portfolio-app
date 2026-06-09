import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Upload, ArrowLeft, LogOut, GripVertical, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PhotoEditDialog, { type Photo } from "@/components/dialog/PhotoEditDialog";
import ServiceEditDialog, { type Service } from "@/components/dialog/ServiceEditDialog";
import { supabase } from "@/intergration/supabase/client";

const getPublicUrl = (path?: string) => {
    if (!path) return "";
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    return data?.publicUrl || "";
};

const SortablePhoto = ({
                           photo,
                           onDelete,
                           onEdit,
                           onSaveTitle,
                       }: {
    photo: Photo;
    onDelete: () => void;
    onEdit: () => void;
    onSaveTitle: (id: string, newTitle: string) => Promise<void>;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: photo.id });
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState(photo.title);
    const [isSaving, setIsSaving] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    const handleTitleSave = async () => {
        if (tempTitle.trim() === photo.title) {
            setIsEditingTitle(false);
            return;
        }
        setIsSaving(true);
        try {
            await onSaveTitle(photo.id, tempTitle.trim());
            setIsEditingTitle(false);
        } catch {
            setTempTitle(photo.title);
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleTitleSave();
        if (e.key === "Escape") {
            setTempTitle(photo.title);
            setIsEditingTitle(false);
        }
    };

    return (
        <Card ref={setNodeRef} style={style} className="overflow-hidden group border-none shadow-sm bg-background rounded-none">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={getPublicUrl(photo.storage_path)}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-300 flex items-center justify-center gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 cursor-grab active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 delay-[50ms]"
                        onClick={onEdit}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 delay-[100ms]"
                        onClick={onDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-2">
                    {isEditingTitle ? (
                        <Input
                            autoFocus
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={handleKeyDown}
                            disabled={isSaving}
                            className="h-7 text-sm py-1 px-2 font-display bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-none w-full"
                        />
                    ) : (
                        <p
                            className="font-display text-sm text-foreground font-light truncate cursor-text hover:text-foreground/70 transition-colors"
                            onClick={() => setIsEditingTitle(true)}
                        >
                            {photo.title}
                        </p>
                    )}
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{photo.category}</p>
                </div>
                <div className={`h-1.5 w-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-foreground/10'}`} />
            </CardContent>
        </Card>
    );
};

const MemoSortablePhoto = React.memo(SortablePhoto);

const Admin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("services");
    const [category, setCategory] = useState<string>("");
    const [uploadFiles, setUploadFiles] = useState<{ file: File; title: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);

    // Services management state
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { data: photos = [], isLoading } = useQuery({
        queryKey: ["admin-photos"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("photos")
                .select("*")
                .order("sort_order", { ascending: true });
            if (error) throw error;
            return data;
        },
    });

    const { data: services = [], isLoading: isServicesLoading } = useQuery({
        queryKey: ["admin-services"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("services")
                .select("*")
                .order("sort_order", { ascending: true });
            if (error) throw error;

            // Seed services if table is empty
            if (!data || data.length === 0) {
                const defaultServices = [
                    {
                        title: "Weddings",
                        price: "From $3,500",
                        icon_name: "Heart",
                        features: [
                            "Full day coverage (up to 10 hours)",
                            "Second photographer included",
                            "400+ edited images",
                            "Online gallery & downloads",
                            "Engagement session",
                            "Wedding album (30 pages)",
                        ],
                        sort_order: 0,
                    },
                    {
                        title: "Portraits",
                        price: "From $800",
                        icon_name: "Camera",
                        features: [
                            "2-hour session",
                            "2 outfit changes",
                            "50+ edited images",
                            "Online gallery & downloads",
                            "Professional retouching",
                            "Print-ready files",
                        ],
                        sort_order: 1,
                    },
                    {
                        title: "Events",
                        price: "From $1,500",
                        icon_name: "PartyPopper",
                        features: [
                            "Up to 5 hours coverage",
                            "200+ edited images",
                            "Online gallery & downloads",
                            "Same-week delivery",
                            "Social media highlights",
                            "Print-ready files",
                        ],
                        sort_order: 2,
                    },
                    {
                        title: "Lifestyle",
                        price: "From $1,200",
                        icon_name: "ImageIcon",
                        features: [
                            "3-hour on-location session",
                            "Natural light photography",
                            "75+ edited images",
                            "Online gallery & downloads",
                            "Personalized storytelling",
                            "Style consultation",
                        ],
                        sort_order: 3,
                    },
                ];

                const { error: insertError } = await supabase
                    .from("services")
                    .insert(defaultServices);
                if (insertError) throw insertError;

                // Fetch again after seeding
                const { data: seededData, error: refetchError } = await supabase
                    .from("services")
                    .select("*")
                    .order("sort_order", { ascending: true });
                if (refetchError) throw refetchError;
                return seededData as Service[];
            }

            return data as Service[];
        },
    });

    const serviceMutation = useMutation({
        mutationFn: async (service: Partial<Service>) => {
            if (editingService) {
                const { error } = await supabase
                    .from("services")
                    .update(service)
                    .eq("id", editingService.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("services")
                    .insert({
                        ...service,
                        sort_order: services.length,
                    } as any);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            queryClient.invalidateQueries({ queryKey: ["services"] });
            toast.success(editingService ? "Service updated" : "Service added");
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const deleteServiceMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("services").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            queryClient.invalidateQueries({ queryKey: ["services"] });
            toast.success("Service deleted");
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const reorderServicesMutation = useMutation({
        mutationFn: async (reordered: Service[]) => {
            const updates = reordered.map((service, index) =>
                supabase.from("services").update({ sort_order: index }).eq("id", service.id)
            );
            await Promise.all(updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleServiceDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = services.findIndex((s) => s.id === active.id);
        const newIndex = services.findIndex((s) => s.id === over.id);
        const reordered = arrayMove(services, oldIndex, newIndex);

        queryClient.setQueryData(["admin-services"], reordered);
        reorderServicesMutation.mutate(reordered);
    }, [services, queryClient]);

    const handleDeleteService = useCallback((service: Service) => {
        deleteServiceMutation.mutate(service.id);
    }, []);

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (uploadFiles.length === 0 || !category) throw new Error("Select files and category");
            // Check if all files have titles
            if (uploadFiles.some(f => !f.title.trim())) throw new Error("Please ensure all photos have titles");

            const uploadPromises = uploadFiles.map(async ({ file, title: photoTitle }, index) => {
                const ext = file.name.split(".").pop();
                const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from("portfolio")
                    .upload(path, file, { contentType: file.type });
                if (uploadError) throw uploadError;

                const { error: dbError } = await supabase.from("photos").insert({
                    title: photoTitle,
                    category,
                    storage_path: path,
                    sort_order: photos.length + index,
                });
                if (dbError) throw dbError;
            });

            await Promise.all(uploadPromises);
        },
        onMutate: () => setUploading(true),
        onSettled: () => setUploading(false),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
            queryClient.invalidateQueries({ queryKey: ["portfolio-photos"] });
            setCategory("");
            setUploadFiles([]);
            toast.success(`${uploadFiles.length} photo(s) uploaded successfully`);
        },
        onError: (err: Error) => {
            toast.error(err.message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async ({ id, storage_path }: { id: string; storage_path: string }) => {
            await supabase.storage.from("portfolio").remove([storage_path]);
            const { error } = await supabase.from("photos").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
            queryClient.invalidateQueries({ queryKey: ["portfolio-photos"] });
            toast.success("Photo deleted");
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const reorderMutation = useMutation({
        mutationFn: async (reordered: Photo[]) => {
            const updates = reordered.map((photo, index) =>
                supabase.from("photos").update({ sort_order: index }).eq("id", photo.id)
            );
            const results = await Promise.all(updates);
            const failed = results.find((r: { error: any }) => r.error);
            if (failed?.error) throw failed.error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portfolio-photos"] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = photos.findIndex((p: Photo) => p.id === active.id);
        const newIndex = photos.findIndex((p: Photo) => p.id === over.id);
        const reordered = arrayMove(photos, oldIndex, newIndex);

        queryClient.setQueryData(["admin-photos"], reordered);
        reorderMutation.mutate(reordered);
    }, [photos, queryClient]);

    const handleDeletePhoto = useCallback((photo: Photo) => {
        deleteMutation.mutate({ id: photo.id, storage_path: photo.storage_path });
    }, []);

    const handleEditPhoto = useCallback((photo: Photo) => {
        setEditingPhoto(photo);
        setEditDialogOpen(true);
    }, []);

    const handleSaveInlineTitle = async (id: string, newTitle: string) => {
        const { error } = await supabase
            .from("photos")
            .update({ title: newTitle })
            .eq("id", id);
        
        if (error) {
            toast.error(error.message);
            throw error;
        }
        
        queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
        queryClient.invalidateQueries({ queryKey: ["portfolio-photos"] });
    };

    const handleSaveDetails = async (id: string, newTitle: string, newCategory: string) => {
        setEditSaving(true);
        const { error } = await supabase
            .from("photos")
            .update({ title: newTitle, category: newCategory })
            .eq("id", id);
        setEditSaving(false);
        if (error) {
            toast.error(error.message);
            return;
        }
        queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
        queryClient.invalidateQueries({ queryKey: ["portfolio-photos"] });
        setEditDialogOpen(false);
        toast.success("Photo details updated");
    };

    const handleSaveCrop = async (id: string, croppedBlob: Blob) => {
        setEditSaving(true);
        const photo = photos.find((p: Photo) => p.id === id);
        if (!photo) return;

        try {
            // Upload cropped image as new file
            const newPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from("portfolio")
                .upload(newPath, croppedBlob, { contentType: "image/jpeg" });
            if (uploadError) throw uploadError;

            // Update DB to point to new file
            const { error: dbError } = await supabase
                .from("photos")
                .update({ storage_path: newPath })
                .eq("id", id);
            if (dbError) throw dbError;

            // Remove old file
            await supabase.storage.from("portfolio").remove([photo.storage_path]);

            queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
            queryClient.invalidateQueries({ queryKey: ["portfolio-photos"] });
            setEditDialogOpen(false);
            toast.success("Photo cropped successfully");
        } catch (err) {
            toast.error((err as Error).message || "Failed to save crop");
        } finally {
            setEditSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border px-6 ">
                <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="font-display text-2xl font-light text-foreground">
                            Admin <span className="italic">Portal</span>
                        </h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        onClick={async () => {
                            await supabase.auth.signOut();
                            navigate("/login");
                        }}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-12 relative">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="sticky top-16 z-30 bg-[#fafafa] pt-4 pb-2 -mx-6 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <TabsList className="bg-secondary/50 p-1 rounded-none border-b border-border/50">
                            <TabsTrigger value="services" className="rounded-none data-[state=active]:bg-background">
                                Services
                            </TabsTrigger>
                            <TabsTrigger value="portfolio" className="rounded-none data-[state=active]:bg-background">
                                Portfolio
                            </TabsTrigger>
                        </TabsList>

                        {activeTab === "services" && (
                            <Button
                                onClick={() => {
                                    setEditingService(null);
                                    setServiceDialogOpen(true);
                                }}
                                className="bg-foreground text-background hover:bg-foreground/90 rounded-none tracking-widest uppercase text-[10px] h-10 px-6"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Service
                            </Button>
                        )}
                    </div>

                    <TabsContent value="portfolio" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Left Column: Upload */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="sticky top-28">
                                    <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-6 font-medium">Add to Collection</h2>
                                    <Card className="border-none shadow-sm bg-background rounded-none">
                                        <CardContent className="p-6 space-y-6">
                                            <div className="space-y-4">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Category</label>
                                                    <select
                                                        value={category}
                                                        onChange={(e) => setCategory(e.target.value)}
                                                        className="w-full h-10 bg-secondary/20 border-none px-3 text-xs focus:ring-1 focus:ring-foreground/10 outline-none"
                                                    >
                                                        <option value="" disabled>Select Category</option>
                                                        <option value="Weddings">Weddings</option>
                                                        <option value="Portraits">Portraits</option>
                                                        <option value="Events">Events</option>
                                                        <option value="Lifestyle">Lifestyle</option>
                                                        <option value="Safaris">Safaris</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Image Files</label>
                                                    <div className="relative group">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                            onChange={(e) => {
                                                                const newFiles = Array.from(e.target.files || []);
                                                                setUploadFiles(newFiles.map(f => ({
                                                                    file: f,
                                                                    title: f.name.replace(/\.[^/.]+$/, "")
                                                                })));
                                                            }}
                                                        />
                                                        <div className="border-2 border-dashed border-muted/30 rounded-lg p-8 flex flex-col items-center justify-center text-center group-hover:border-foreground/20 transition-colors">
                                                            <Upload className="h-6 w-6 text-muted-foreground mb-2 group-hover:text-foreground transition-colors" />
                                                            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors px-2">
                                                                {uploadFiles.length > 0
                                                                    ? `${uploadFiles.length} file(s) selected`
                                                                    : "Click or drag images to upload"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {uploadFiles.length > 0 && (
                                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                                                            {uploadFiles.map((fileItem, idx) => (
                                                                <div key={idx} className="flex items-center gap-3 space-y-0">
                                                                    <img
                                                                        src={URL.createObjectURL(fileItem.file)}
                                                                        alt={fileItem.title}
                                                                        className="h-10 w-10 object-cover rounded flex-shrink-0"
                                                                    />
                                                                    <div className="flex-1 min-w-0 space-y-1">
                                                                        <span className="text-[10px] text-muted-foreground truncate block">{fileItem.file.name}</span>
                                                                        <Input
                                                                            placeholder="Photo Title"
                                                                            className="h-7 text-xs bg-secondary/20 border-none rounded-none focus-visible:ring-1 focus-visible:ring-foreground/10"
                                                                            value={fileItem.title}
                                                                            onChange={(e) => {
                                                                                const newFiles = [...uploadFiles];
                                                                                newFiles[idx].title = e.target.value;
                                                                                setUploadFiles(newFiles);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                                                                        onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== idx))}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="relative">
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10">
                                                        <span className="text-xs tracking-widest font-medium">Uploading...</span>
                                                    </div>
                                                )}
                                                <Button
                                                    onClick={() => uploadMutation.mutate()}
                                                    disabled={uploadFiles.length === 0 || uploadFiles.some(f => !f.title) || !category || uploading}
                                                    className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none tracking-widest uppercase text-[10px] h-12 transition-all"
                                                >
                                                    {uploading ? "Uploading..." : "Publish to Portfolio"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Right Column: Grid */}
                            <div className="lg:col-span-8">
                                <div className="flex items-end justify-between mb-8">
                                    <div>
                                        <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-1 font-medium">Gallery</h2>
                                        <p className="text-2xl font-display text-foreground font-light">
                                            Current <span className="italic">Collection</span> ({photos.length})
                                        </p>
                                    </div>
                                    {photos.length > 0 && (
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                                            Drag items to reorder
                                        </span>
                                    )}
                                </div>

                                {isLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-none" />
                                        ))}
                                    </div>
                                ) : photos.length === 0 ? (
                                    <div className="bg-background rounded-none border border-dashed border-muted/30 p-20 text-center">
                                        <p className="text-muted-foreground font-light italic">No photos yet — start by uploading your first shot 📸</p>
                                    </div>
                                ) : (
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={photos.map((p: Photo) => p.id)} strategy={verticalListSortingStrategy}>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {photos.map((photo: Photo) => (
                                                    <MemoSortablePhoto
                                                        key={photo.id}
                                                        photo={photo}
                                                        onEdit={() => handleEditPhoto(photo)}
                                                        onDelete={() => handleDeletePhoto(photo)}
                                                        onSaveTitle={handleSaveInlineTitle}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="services" className="mt-0">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-end justify-between mb-4">
                                <div>
                                    <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-1 font-medium">Services</h2>
                                    <p className="text-2xl font-display text-foreground font-light">
                                        Investment <span className="italic">Packages</span> ({services.length})
                                    </p>
                                </div>
                            </div>

                            {isServicesLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-24 bg-muted animate-pulse rounded-none" />
                                    ))}
                                </div>
                            ) : services.length === 0 ? (
                                <div className="bg-background rounded-none border border-dashed border-muted/30 p-20 text-center">
                                    <p className="text-muted-foreground font-light italic">No services configured — add your first package to get started</p>
                                </div>
                            ) : (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleServiceDragEnd}>
                                    <SortableContext items={services.map((s: Service) => s.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-4">
                                            {services.map((service: Service) => (
                                                <MemoSortableServiceItem
                                                    key={service.id}
                                                    service={service}
                                                    onEdit={() => {
                                                        setEditingService(service);
                                                        setServiceDialogOpen(true);
                                                    }}
                                                    onDelete={() => handleDeleteService(service)}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <PhotoEditDialog
                photo={editingPhoto}
                imageUrl={editingPhoto ? getPublicUrl(editingPhoto.storage_path) : ""}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSaveDetails={handleSaveDetails}
                onSaveCrop={handleSaveCrop}
                saving={editSaving}
            />

            <ServiceEditDialog
                service={editingService}
                open={serviceDialogOpen}
                onOpenChange={setServiceDialogOpen}
                onSave={async (data) => {
                    await serviceMutation.mutateAsync(data);
                }}
            />
        </div>
    );
};

const SortableServiceItem = ({
                                 service,
                                 onDelete,
                                 onEdit,
                             }: {
    service: Service;
    onDelete: () => void;
    onEdit: () => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: service.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <Card ref={setNodeRef} style={style} className="overflow-hidden border-none shadow-sm bg-background rounded-none group">
            <CardContent className="p-4 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-grab active:cursor-grabbing text-muted-foreground"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4" />
                </Button>

                <div className="flex-1 min-w-0">
                    <h4 className="font-display text-lg text-foreground font-light truncate">{service.title}</h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{service.price}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const MemoSortableServiceItem = React.memo(SortableServiceItem);

export default Admin;
