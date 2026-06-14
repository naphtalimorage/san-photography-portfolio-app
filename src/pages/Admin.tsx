import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ListChecks, Palette } from "lucide-react";
import {
    Trash2,
    ArrowLeft,
    GripVertical,
    Pencil,
    Plus,
    Images,
    Upload,
} from "lucide-react";



import { toast } from "sonner";
import { Link } from "react-router-dom";
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
import AdminReelsSection from "./AdminReelsSection";



const getPublicUrl = (path?: string) => {
    if (!path) return "";
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    return data?.publicUrl || "";
};

const getPhotoUrl = (photo: Pick<Photo, "storage_path" | "image_url">) => {
    return photo.image_url || getPublicUrl(photo.storage_path);
};

type ServiceInsert = {
    title: string;
    price: string;
    features: string[];
    icon_name: string;
    sort_order: number;
};

type UploadFile = { file: File; title: string; previewUrl: string };



function SortableServiceItem({
    service,
    onDelete,
    onEdit,
}: {
    service: Service;
    onDelete: () => void;
    onEdit: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: service.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <Card ref={setNodeRef} style={style} className="overflow-hidden rounded-lg border-border bg-card shadow-sm group">
            <CardContent className="flex items-center gap-4 p-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-md cursor-grab active:cursor-grabbing text-muted-foreground"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4" />
                </Button>

                <div className="flex-1 min-w-0">
                    <h4 className="font-display text-lg text-foreground font-light truncate">{service.title}</h4>
                    <p className="text-xs text-muted-foreground uppercase">{service.price}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onEdit}
                        className="h-9 w-9 rounded-md text-muted-foreground hover:text-foreground"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="h-9 w-9 rounded-md text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function SortablePhotoCard({
    photo,
    onDelete,
    onEdit,
    onSaveTitle,
}: {
    photo: Photo;
    onDelete: () => void;
    onEdit: () => void;
    onSaveTitle: (id: string, newTitle: string) => Promise<void>;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: photo.id });

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState(photo.title);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTempTitle(photo.title);
        setIsEditingTitle(false);
        setIsSaving(false);
    }, [photo.id]);

    const style: React.CSSProperties = {
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

    return (
        <Card ref={setNodeRef} style={style} className="overflow-hidden rounded-lg border-border bg-card shadow-sm group">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={getPhotoUrl(photo)}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-300 flex items-center justify-center gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 cursor-grab active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 delay-[50ms]"
                        onClick={onEdit}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 delay-[100ms]"
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
                            disabled={isSaving}
                            className="h-8 rounded-md text-sm py-1 px-2 font-display bg-background border-border focus-visible:ring-1 focus-visible:ring-foreground/20 w-full"
                        />
                    ) : (
                        <p
                            className="font-display text-sm text-foreground font-light truncate cursor-text hover:text-foreground/70 transition-colors"
                            onClick={() => setIsEditingTitle(true)}
                        >
                            {photo.title}
                        </p>
                    )}
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                        {photo.category}
                    </p>
                </div>
                <div className={`h-1.5 w-1.5 rounded-full ${isSaving ? "bg-amber-400 animate-pulse" : "bg-foreground/10"}`} />
            </CardContent>
        </Card>
    );
}

const Admin = () => {
    const queryClient = useQueryClient();


    const [activeTab, setActiveTab] = useState("services");

    type VideoReel = {
        id: string;
        title: string;
        storage_video_path: string;
        storage_thumbnail_path: string;
        thumbnail_url: string | null;
        sort_order: number;
    };

    // Services state

    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

    // Portfolio upload state
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
    const [category, setCategory] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const photosQuery = useQuery({
        queryKey: ["admin-photos"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("photos")
                .select("*")
                .order("sort_order", { ascending: true });
            if (error) throw error;
            return data as Photo[];
        },
    });

    // Reels query (bucket/table types are not generated yet in this repo)
    // Intentionally fetched as `any` for now.
    const reelsQuery = useQuery({
        queryKey: ["admin-video-reels"],
        queryFn: async () => {
            const res = await (supabase as any)
                .from("video_reels")
                .select("id,title,storage_video_path,storage_thumbnail_path,thumbnail_url,sort_order")
                .order("sort_order", { ascending: true });
            if (res.error) throw res.error;
            return (res.data ?? []) as VideoReel[];
        },
    });


    const servicesQuery = useQuery({

        queryKey: ["admin-services"],

        queryFn: async () => {
            const { data, error } = await supabase
                .from("services")
                .select("*")
                .order("sort_order", { ascending: true });
            if (error) throw error;
            return data as Service[];
        },
    });

    const services = servicesQuery.data ?? [];
    const photos = photosQuery.data ?? [];
    const reels = reelsQuery.data ?? []; // temporary: reels UI not yet wired in

    const serviceMutation = useMutation({

        mutationFn: async (service: Partial<Service>) => {
            if (editingService) {
                const { error } = await supabase
                    .from("services")
                    .update(service)
                    .eq("id", editingService.id);
                if (error) throw error;
                return;
            }

            const newService: ServiceInsert = {
                title: service.title || "",
                price: service.price || "",
                icon_name: service.icon_name || "Camera",
                features: service.features || [],
                sort_order: services.length,
            };

            const { error } = await supabase.from("services").insert(newService);
            if (error) throw error;
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
            const updates = reordered.map((s, index) =>
                supabase.from("services").update({ sort_order: index }).eq("id", s.id)
            );
            await Promise.all(updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleServiceDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = services.findIndex((s) => s.id === active.id);
            const newIndex = services.findIndex((s) => s.id === over.id);
            const reordered = arrayMove(services, oldIndex, newIndex);

            queryClient.setQueryData(["admin-services"], reordered);
            reorderServicesMutation.mutate(reordered);
        },
        [services, queryClient, reorderServicesMutation]
    );

    const handleDeleteService = useCallback(
        (service: Service) => deleteServiceMutation.mutate(service.id),
        [deleteServiceMutation]
    );

    // Portfolio photo: reorder
    const reorderPhotosMutation = useMutation({
        mutationFn: async (reordered: Photo[]) => {
            const updates = reordered.map((p, index) =>
                supabase.from("photos").update({ sort_order: index }).eq("id", p.id)
            );
            const results = await Promise.all(updates);
            const failed = results.find((r: any) => r.error);
            if (failed?.error) throw failed.error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handlePhotoDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = photos.findIndex((p) => p.id === active.id);
            const newIndex = photos.findIndex((p) => p.id === over.id);
            const reordered = arrayMove(photos, oldIndex, newIndex);

            queryClient.setQueryData(["admin-photos"], reordered);
            reorderPhotosMutation.mutate(reordered);

            // Also invalidate public home section
            queryClient.invalidateQueries({ queryKey: ["portfolio-photos-home"] });
        },
        [photos, queryClient, reorderPhotosMutation]
    );

    // Portfolio photo: delete
    const deletePhotoMutation = useMutation({
        mutationFn: async ({ id, storage_path }: { id: string; storage_path: string }) => {
            await supabase.storage.from("portfolio").remove([storage_path]);
            const { error } = await supabase.from("photos").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
            queryClient.invalidateQueries({ queryKey: ["portfolio-photos-home"] });
            toast.success("Photo deleted");
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleDeletePhoto = useCallback(
        (photo: Photo) => deletePhotoMutation.mutate({ id: photo.id, storage_path: photo.storage_path }),
        [deletePhotoMutation]
    );

    const handleEditPhoto = useCallback((photo: Photo) => {
        setEditingPhoto(photo);
        setEditDialogOpen(true);
    }, []);


    // Portfolio photo: edit title inline
    const saveInlineTitleMutation = useMutation({
        mutationFn: async ({ id, newTitle }: { id: string; newTitle: string }) => {
            const { error } = await supabase.from("photos").update({ title: newTitle }).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
            queryClient.invalidateQueries({ queryKey: ["portfolio-photos-home"] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleSaveInlineTitle = useCallback(
        async (id: string, newTitle: string) => {
            await saveInlineTitleMutation.mutateAsync({ id, newTitle });
        },
        [saveInlineTitleMutation]
    );

    // Portfolio photo: edit dialog handlers
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
        setEditDialogOpen(false);
        toast.success("Photo details updated");
        queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
        queryClient.invalidateQueries({ queryKey: ["portfolio-photos-home"] });
    };

    const handleSaveCrop = async (id: string, croppedBlob: Blob) => {
        setEditSaving(true);
        const photo = photos.find((p) => p.id === id);
        if (!photo) {
            setEditSaving(false);
            return;
        }

        try {
            const newPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from("portfolio")
                .upload(newPath, croppedBlob, { contentType: "image/jpeg" });
            if (uploadError) throw uploadError;

            const imageUrl = getPublicUrl(newPath);
            const { error: dbError } = await supabase
                .from("photos")
                .update({ storage_path: newPath, image_url: imageUrl })
                .eq("id", id);
            if (dbError) throw dbError;

            await supabase.storage.from("portfolio").remove([photo.storage_path]);

            setEditDialogOpen(false);
            toast.success("Photo cropped successfully");

            queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
            queryClient.invalidateQueries({ queryKey: ["portfolio-photos-home"] });
        } catch (err: any) {
            toast.error(err?.message || "Failed to save crop");
        } finally {
            setEditSaving(false);
        }
    };

    // Portfolio upload
    const handleFilesSelected = useCallback((files: FileList | File[]) => {
        const selectedFiles = Array.from(files);
        if (selectedFiles.length === 0) return;

        const acceptedFiles = selectedFiles.filter((file) => {
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 15 * 1024 * 1024) {
                toast.error(`${file.name} is larger than 15MB`);
                return false;
            }
            return true;
        });

        if (acceptedFiles.length === 0) return;

        setUploadFiles((current) => [
            ...current,
            ...acceptedFiles.map((file) => ({
                file,
                previewUrl: URL.createObjectURL(file),
                title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim(),
            })),
        ]);
    }, []);

    useEffect(() => {
        return () => {
            uploadFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
        };
    }, [uploadFiles]);

    const removeUploadFile = useCallback((index: number) => {
        setUploadFiles((current) => {
            const next = current.filter((_, i) => i !== index);
            return next;
        });
    }, []);

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (uploadFiles.length === 0) throw new Error("Select images to upload");
            if (!category) throw new Error("Select a category");

            const maxSortBase = photos.length;

            if (uploadFiles.some((f) => !f.title.trim())) {
                throw new Error("Every image needs a title");
            }

            const uploads = uploadFiles.map(async ({ file, title }, index) => {
                const ext = file.name.split(".").pop() || "jpg";
                const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from("portfolio")
                    .upload(path, file, { contentType: file.type });
                if (uploadError) throw uploadError;

                const imageUrl = getPublicUrl(path);

                const { error: dbError } = await supabase.from("photos").insert({
                    title,
                    category,
                    image_url: imageUrl,
                    storage_path: path,
                    sort_order: maxSortBase + index,
                });
                if (dbError) throw dbError;
            });

            await Promise.all(uploads);
        },
        onMutate: () => {
            setUploading(true);
            setUploadProgress(5);
        },
        onSuccess: () => {
            setUploadProgress(100);
            setUploadFiles([]);
            setCategory("");
            setUploading(false);
            toast.success("Photos uploaded successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
            queryClient.invalidateQueries({ queryKey: ["portfolio-photos-home"] });
        },
        onError: (err: Error) => {
            setUploading(false);
            toast.error(err.message);
        },
    });

    const categories = ["Portraits", "Weddings", "Events", "Lifestyle", "Safaris"];

    const missingTitleCount = uploadFiles.filter((f) => !f.title.trim()).length;
    const canUpload = uploadFiles.length > 0 && category && missingTitleCount === 0 && !uploading;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link to="/">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md" aria-label="Back to website">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="min-w-0">
                            <p className="text-[10px] font-medium uppercase text-muted-foreground">San Portfolio</p>
                            <h1 className="truncate font-display text-xl font-light text-foreground sm:text-2xl">
                                Admin <span className="italic">Studio</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-10">
                <section className="grid gap-4 md:grid-cols-3">
                            <Card className="rounded-lg border-border bg-card shadow-sm">
                                <CardContent className="flex items-center justify-between p-5">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase text-muted-foreground">Portfolio</p>
                                        <p className="mt-1 font-display text-3xl font-light">{photos.length}</p>
                                    </div>
                                    <Images className="h-5 w-5 text-muted-foreground" />
                                </CardContent>
                            </Card>


                    <Card className="rounded-lg border-border bg-card shadow-sm">
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Services</p>
                                <p className="mt-1 font-display text-3xl font-light">{services.length}</p>
                            </div>
                            <ListChecks className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg border-border bg-card shadow-sm">
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Vedio Reels</p>
                                <p className="mt-1 text-sm text-foreground">{reels.length}</p>
                            </div>
                            <Palette className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </section>

                <Tabs value={activeTab} onValueChange={setActiveTab} className=" flex flex-col gap-10">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <TabsList className="h-11 rounded-lg border border-border bg-card p-1">
                            <TabsTrigger value="services" className="px-6 rounded-md">Services</TabsTrigger>
                            <TabsTrigger value="portfolio" className="px-6 rounded-md">Portfolio</TabsTrigger>
                            <TabsTrigger value="reels" className="px-6 rounded-md">Reels</TabsTrigger>
                        </TabsList>


                        {activeTab === "services" ? (
                            <Button
                                onClick={() => {
                                    setEditingService(null);
                                    setServiceDialogOpen(true);
                                }}
                                className="h-10 rounded-md"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Service
                            </Button>
                        ) : null}
                    </div>

                    <div>
                        <TabsContent value="services" className="mt-0">
                            <Card className="border-border">
                                <CardContent className="p-6">
                                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase text-muted-foreground">Services</p>
                                            <h2 className="mt-1 font-display text-3xl font-light">
                                                Investment <span className="italic">Packages</span>
                                            </h2>
                                        </div>
                                        {services.length > 0 ? (
                                            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[10px] uppercase text-muted-foreground">
                                                <ListChecks className="h-4 w-4" />
                                                Drag to reorder
                                            </span>
                                        ) : null}
                                    </div>

                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleServiceDragEnd}>
                                        <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-3">
                                                {services.map((service) => (
                                                    <SortableServiceItem
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
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="portfolio" className="mt-0">
                            <Card className="border-border">
                                <CardContent className="p-6">

                                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                                        <aside className="lg:col-span-4">



                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">Upload</p>
                                                    <h3 className="mt-1 font-display text-xl font-light">Add new portfolio photos</h3>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="category">Category</Label>
                                                    <Select value={category} onValueChange={setCategory}>
                                                        <SelectTrigger id="category" className="bg-secondary/30 border-border h-12 rounded-md focus:ring-1 focus:ring-foreground/10 px-4">
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-black">
                                                            {categories.map((cat) => (
                                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Images</Label>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        placeholder="Select images to upload"
                                                        multiple
                                                        onChange={(e) => {
                                                            if (e.target.files) handleFilesSelected(e.target.files);
                                                        }}
                                                    />
                                                </div>

                                                {uploadFiles.length > 0 ? (
                                                    <div className="space-y-2">
                                                        <p className="text-xs text-muted-foreground">Preview</p>
                                                        <div className="space-y-3">
                                                            {uploadFiles.map((item, idx) => (
                                                                <div key={item.previewUrl} className="flex items-center gap-3">
                                                                    <img src={item.previewUrl} alt={item.title} className="h-16 w-16 rounded object-cover" />
                                                                    <div className="flex-1">
                                                                        <Input
                                                                            value={item.title}
                                                                            onChange={(e) => {
                                                                                const v = e.target.value;
                                                                                setUploadFiles((cur) => cur.map((x, i) => (i === idx ? { ...x, title: v } : x)));
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <Button variant="ghost" size="icon" onClick={() => removeUploadFile(idx)}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}

                                                <div className="pt-2">
                                                    {uploading ? (
                                                        <div className="space-y-2">
                                                            <Progress value={uploadProgress} />
                                                            <p className="text-xs text-muted-foreground">Uploading… {uploadProgress}%</p>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            className="w-full border border-border bg-card hover:bg-card/90 focus:ring-1 focus:ring-foreground/10 h-10 rounded-md cursor-pointer"
                                                            disabled={!canUpload}
                                                            onClick={async () => {
                                                                await uploadMutation.mutateAsync();
                                                            }}
                                                        >
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            Upload {uploadFiles.length} photo{uploadFiles.length > 1 ? "s" : ""}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </aside>

                                        <section className="lg:col-span-8">
                                            <div className="mb-4">
                                                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Current photos</p>
                                                <h3 className="mt-1 font-display text-xl font-light">Reorder & edit</h3>
                                            </div>

                                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePhotoDragEnd}>
                                                <SortableContext items={photos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {photos.map((photo) => (
                                                            <SortablePhotoCard
                                                                key={photo.id}
                                                                photo={photo}
                                                                onDelete={() => handleDeletePhoto(photo)}
                                                                onEdit={() => handleEditPhoto(photo)}
                                                                onSaveTitle={handleSaveInlineTitle}
                                                            />
                                                        ))}
                                                    </div>
                                                </SortableContext>
                                            </DndContext>
                                        </section>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="reels" className="mt-0">
                            <AdminReelsSection />
                        </TabsContent>
                    </div>
                </Tabs>
            </main>



            <PhotoEditDialog
                photo={editingPhoto}
                imageUrl={editingPhoto ? getPhotoUrl(editingPhoto) : ""}
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

export default Admin;

