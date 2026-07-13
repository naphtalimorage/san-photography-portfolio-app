// src/components/admin/MediaLibraryTab.tsx
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Edit,
    Trash2,
    GripVertical,
    Upload,
    X,
    Plus,
    Image as ImageIcon,
    Maximize2
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { supabase } from '@/intergration/supabase/client';
import PhotoEditDialog, { type Photo } from '@/components/dialog/PhotoEditDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const getPublicUrl = (path?: string) => {
    if (!path) return '';
    const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
    return data?.publicUrl || '';
};

const getPhotoUrl = (photo: Pick<Photo, 'storage_path' | 'image_url'>) => {
    return photo.image_url || getPublicUrl(photo.storage_path);
};

type UploadFile = { file: File; title: string; previewUrl: string };

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
    const [showActions, setShowActions] = useState(false);

    useEffect(() => {
        setTempTitle(photo.title);
        setIsEditingTitle(false);
        setIsSaving(false);
    }, [photo.id]);

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined, // Increased z-index for better visibility while dragging
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

    const handleDelete = () => {
        if (confirm('Delete this photo? This action cannot be undone.')) {
            onDelete();
        }
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            // ❌ REMOVED: `layout` prop (this was conflicting with dnd-kit's transform)
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
className="group relative overflow-hidden bg-secondary/30 border border-border/30"
            onClick={() => setShowActions(!showActions)}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden">
                <img
                    src={getPhotoUrl(photo)}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Gradient Overlay */}
<div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent opacity-80" />

                {/* Status Badge - Top Left */}
                <div className="absolute top-2 left-2 z-10">
<span className="bg-secondary text-foreground text-[9px] px-2 py-0.5 font-bold tracking-tighter uppercase">
                        {photo.category}
                    </span>
                </div>

                {/* ✅ FIXED: Drag Handle - Desktop Only (Added type="button" and z-20) */}
                <button
                    type="button"
className="hidden md:block absolute top-2 right-2 p-1.5 bg-secondary/80 backdrop-blur text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 z-20"
                    {...attributes}
                    {...listeners}
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {/* ✅ FIXED: Mobile: Always-visible drag handle (Added type="button" and z-20) */}
                <button
                    type="button"
className="md:hidden absolute top-2 right-2 p-1.5 bg-secondary/80 backdrop-blur text-foreground transition-colors cursor-grab active:cursor-grabbing z-20"
                    {...attributes}
                    {...listeners}
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {/* Mobile: Expand icon */}
                <div className="md:hidden absolute top-2 right-12 w-7 h-7 bg-savanna-charcoal/60 backdrop-blur-sm flex items-center justify-center z-10">
<Maximize2 className="w-3 h-3 text-foreground" />
                </div>

                {/* Desktop: Hover Action Overlay */}
<div className="hidden md:flex absolute inset-0 bg-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-3 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
className="w-10 h-10 bg-secondary text-foreground flex items-center justify-center hover:bg-secondary/90 transition-all active:scale-90"
                        aria-label="Edit photo"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
className="w-10 h-10 bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-all active:scale-90"
                        aria-label="Delete photo"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Bottom Info - Always visible */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    {isEditingTitle ? (
                        <Input
                            autoFocus
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            disabled={isSaving}
                            className="h-8 text-sm py-1 px-2 bg-savanna-charcoal/80 backdrop-blur border-border/30 focus:border-savanna-gold w-full mb-1"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <h4
className="text-foreground font-display text-sm font-light truncate cursor-text hover:text-foreground transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingTitle(true);
                            }}
                        >
                            {photo.title}
                        </h4>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`h-1.5 w-1.5 rounded-full ${isSaving ? 'bg-savanna-gold animate-pulse' : 'bg-savanna-cream/30'}`} />
                        <p className="text-savanna-cream/60 text-[10px] uppercase tracking-wider">
                            {photo.storage_path.split('.').pop()?.toUpperCase()} • {photo.created_at?.split('T')[0]}
                        </p>
                    </div>
                </div>
            </div>

            {/* Mobile: Action Bar - Appears on tap */}
            <AnimatePresence>
                {showActions && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden flex items-center justify-between p-3 bg-savanna-charcoal/50 border-t border-border/30 overflow-hidden z-20"
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                                setShowActions(false);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 text-savanna-gold text-[10px] uppercase tracking-widest font-bold active:scale-95 transition-transform"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                        </button>
                        <div className="w-[1px] h-6 bg-border/30" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                                setShowActions(false);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 text-error text-[10px] uppercase tracking-widest font-bold active:scale-95 transition-transform"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

const MediaLibraryTab = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
    const [category, setCategory] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [showUploadPanel, setShowUploadPanel] = useState(false);
    const isSearching = searchQuery.trim().length > 0;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const photosQuery = useQuery({
        queryKey: ['admin-photos'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('photos')
                .select('*')
                .order('sort_order', { ascending: true });
            if (error) throw error;
            return data as Photo[];
        },
    });

    const photos = photosQuery.data ?? [];

    // Reorder mutation
    const reorderPhotosMutation = useMutation({
        mutationFn: async (reordered: Photo[]) => {
            const updates = reordered.map((p, index) =>
                supabase.from('photos').update({ sort_order: index }).eq('id', p.id)
            );
            const results = await Promise.all(updates);
            const failed = results.find((r: any) => r.error);
            if (failed?.error) throw failed.error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
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

            queryClient.setQueryData(['admin-photos'], reordered);
            reorderPhotosMutation.mutate(reordered);
            queryClient.invalidateQueries({ queryKey: ['portfolio-photos-home'] });
        },
        [photos, queryClient, reorderPhotosMutation]
    );

    // Delete mutation
    const deletePhotoMutation = useMutation({
        mutationFn: async ({ id, storage_path }: { id: string; storage_path: string }) => {
            await supabase.storage.from('portfolio').remove([storage_path]);
            const { error } = await supabase.from('photos').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
            queryClient.invalidateQueries({ queryKey: ['portfolio-photos-home'] });
            toast.success('Photo deleted');
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

    // Inline title save
    const saveInlineTitleMutation = useMutation({
        mutationFn: async ({ id, newTitle }: { id: string; newTitle: string }) => {
            const { error } = await supabase.from('photos').update({ title: newTitle }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
            queryClient.invalidateQueries({ queryKey: ['portfolio-photos-home'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleSaveInlineTitle = useCallback(
        async (id: string, newTitle: string) => {
            await saveInlineTitleMutation.mutateAsync({ id, newTitle });
        },
        [saveInlineTitleMutation]
    );

    // Edit dialog handlers
    const handleSaveDetails = async (id: string, newTitle: string, newCategory: string) => {
        setEditSaving(true);
        const { error } = await supabase
            .from('photos')
            .update({ title: newTitle, category: newCategory })
            .eq('id', id);
        setEditSaving(false);
        if (error) {
            toast.error(error.message);
            return;
        }
        setEditDialogOpen(false);
        toast.success('Photo details updated');
        queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
        queryClient.invalidateQueries({ queryKey: ['portfolio-photos-home'] });
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
                .from('portfolio')
                .upload(newPath, croppedBlob, { contentType: 'image/jpeg' });
            if (uploadError) throw uploadError;

            const imageUrl = getPublicUrl(newPath);
            const { error: dbError } = await supabase
                .from('photos')
                .update({ storage_path: newPath, image_url: imageUrl })
                .eq('id', id);
            if (dbError) throw dbError;

            await supabase.storage.from('portfolio').remove([photo.storage_path]);

            setEditDialogOpen(false);
            toast.success('Photo cropped successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
            queryClient.invalidateQueries({ queryKey: ['portfolio-photos-home'] });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to save crop');
        } finally {
            setEditSaving(false);
        }
    };

    // Upload functionality
    const handleFilesSelected = useCallback((files: FileList | File[]) => {
        const selectedFiles = Array.from(files);
        if (selectedFiles.length === 0) return;

        const acceptedFiles = selectedFiles.filter((file) => {
            if (!file.type.startsWith('image/')) {
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
                title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim(),
            })),
        ]);
    }, []);

    useEffect(() => {
        return () => {
            uploadFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
        };
    }, [uploadFiles]);

    const removeUploadFile = useCallback((index: number) => {
        setUploadFiles((current) => current.filter((_, i) => i !== index));
    }, []);

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (uploadFiles.length === 0) throw new Error('Select images to upload');
            if (!category) throw new Error('Select a category');

            const maxSortBase = photos.length;

            if (uploadFiles.some((f) => !f.title.trim())) {
                throw new Error('Every image needs a title');
            }

            const uploads = uploadFiles.map(async ({ file, title }, index) => {
                const ext = file.name.split('.').pop() || 'jpg';
                const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from('portfolio')
                    .upload(path, file, { contentType: file.type });
                if (uploadError) throw uploadError;

                const imageUrl = getPublicUrl(path);

                const { error: dbError } = await supabase.from('photos').insert({
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
            setCategory('');
            setUploading(false);
            setShowUploadPanel(false);
            toast.success('Photos uploaded successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
            queryClient.invalidateQueries({ queryKey: ['portfolio-photos-home'] });
        },
        onError: (err: Error) => {
            setUploading(false);
            toast.error(err.message);
        },
    });

    const categories = ["Weddings", 'Potraits', 'Events', 'Big Cats', 'Great Migration', 'Landscapes', 'People & Culture'];

    const missingTitleCount = uploadFiles.filter((f) => !f.title.trim()).length;
    const canUpload = uploadFiles.length > 0 && category && missingTitleCount === 0 && !uploading;

    const filteredPhotos = photos.filter((photo) =>
        photo.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen pb-24 md:pb-0">
            {/* Header - Mobile Optimized */}
            <header className="flex flex-col gap-4 mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-[1px] bg-savanna-gold" />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-savanna-gold font-bold">
                                Portfolio
                            </span>
                        </div>
                        <h2 className="font-display text-2xl md:text-3xl text-foreground font-light">
                            Media Library
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-base mt-1 max-w-xl">
                            Manage your cinematic wildlife portfolio
                        </p>
                    </div>

                    {/* Desktop: Upload Button */}
                    <button
                        onClick={() => setShowUploadPanel(true)}
                        className="hidden md:flex items-center gap-2 px-6 py-3 bg-savanna-gold text-savanna-charcoal text-xs tracking-[0.2em] uppercase font-bold hover:bg-savanna-gold/90 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Upload Photos
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-savanna-gold transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-savanna-charcoal/30 border border-border/30 text-foreground px-11 py-3 text-sm focus:outline-none focus:border-savanna-gold transition-all placeholder:text-muted-foreground/40"
                        placeholder="Search photos by title..."
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </header>

            {/* Desktop: Upload Panel (Sidebar) */}
            <AnimatePresence>
                {showUploadPanel && (
                    <section className="hidden md:block mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Upload Panel */}
                            <div className="lg:col-span-4 bg-savanna-charcoal/30 border border-border/30 p-6 space-y-4 relative">
                                {/* Close button */}
                                <button
                                    onClick={() => setShowUploadPanel(false)}
                                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase text-savanna-gold tracking-widest">Upload</p>
                                    <h3 className="mt-1 font-display text-xl text-foreground font-light">Add new portfolio photos</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold">Category</Label>
                                    <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
                                        <SelectTrigger className="w-full bg-savanna-charcoal/50 border-border/30 h-12 focus:border-savanna-gold px-4">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background">
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat} className="hover:bg-savanna-gold/10">
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold">Images</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="w-full bg-savanna-charcoal/50 border-border/30"
                                        onChange={(e) => {
                                            if (e.target.files) handleFilesSelected(e.target.files);
                                        }}
                                    />
                                </div>

                                {uploadFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Preview ({uploadFiles.length})</p>
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {uploadFiles.map((item, idx) => (
                                                <div key={item.previewUrl} className="flex items-center gap-3 bg-savanna-charcoal/50 p-2 border border-border/30">
                                                    <img src={item.previewUrl} alt={item.title} className="h-16 w-16 rounded object-cover" />
                                                    <div className="flex-1 min-w-0">
                                                        <Input
                                                            value={item.title}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                setUploadFiles((cur) => cur.map((x, i) => (i === idx ? { ...x, title: v } : x)));
                                                            }}
                                                            className="h-8 text-sm bg-savanna-charcoal/30 border-border/30"
                                                        />
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => removeUploadFile(idx)} className="h-8 w-8 flex-shrink-0">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2">
                                    {uploading ? (
                                        <div className="space-y-2">
                                            <Progress value={uploadProgress} className="h-2" />
                                            <p className="text-xs text-muted-foreground">Uploading… {Math.round(uploadProgress)}%</p>
                                        </div>
                                    ) : (
                                        <Button
                                            className="w-full bg-savanna-gold text-savanna-charcoal hover:bg-savanna-gold/90 h-12 tracking-[0.2em] uppercase text-xs font-bold"
                                            disabled={!canUpload}
                                            onClick={async () => {
                                                await uploadMutation.mutateAsync();
                                            }}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload {uploadFiles.length} photo{uploadFiles.length > 1 ? 's' : ''}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Photo Grid */}
                            <div className="lg:col-span-8">
                                <PhotoGrid
                                    photos={filteredPhotos}
                                    photosAll={photos}
                                    sensors={sensors}
                                    handlePhotoDragEnd={handlePhotoDragEnd}
                                    handleDeletePhoto={handleDeletePhoto}
                                    handleEditPhoto={handleEditPhoto}
                                    handleSaveInlineTitle={handleSaveInlineTitle}
                                    isSearching={isSearching}
                                />
                            </div>
                        </div>
                    </section>
                )}
            </AnimatePresence>

            {/* Desktop: Default Grid (No upload panel) */}
            {!showUploadPanel && (
                <section className="hidden md:block">

                    <PhotoGrid
                        photos={filteredPhotos}
                        photosAll={photos}
                        sensors={sensors}
                        handlePhotoDragEnd={handlePhotoDragEnd}
                        handleDeletePhoto={handleDeletePhoto}
                        handleEditPhoto={handleEditPhoto}
                        handleSaveInlineTitle={handleSaveInlineTitle}
                        isSearching={isSearching} // <-- Add this
                    />
                </section>
            )}

            {/* Mobile: Photo Grid (Always visible) */}
            <section className="md:hidden">
                <PhotoGrid
                    photos={filteredPhotos}
                    photosAll={photos}
                    sensors={sensors}
                    handlePhotoDragEnd={handlePhotoDragEnd}
                    handleDeletePhoto={handleDeletePhoto}
                    handleEditPhoto={handleEditPhoto}
                    handleSaveInlineTitle={handleSaveInlineTitle}
                    isSearching={isSearching}
                />
            </section>

            {/* Mobile: Upload Bottom Sheet */}
            <AnimatePresence>
                {showUploadPanel && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-savanna-charcoal/80 backdrop-blur-sm z-40"
                            onClick={() => setShowUploadPanel(false)}
                        />

                        {/* Bottom Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-savanna-gold/20 max-h-[85vh] overflow-y-auto"
                        >
                            {/* Handle bar */}
                            <div className="sticky top-0 bg-background border-b border-border/30 p-4 flex items-center justify-between">
                                <div className="w-12 h-1 bg-border/50 rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2" />
                                <h3 className="font-display text-lg text-foreground mt-2">Upload Photos</h3>
                                <button
                                    onClick={() => setShowUploadPanel(false)}
                                    className="mt-2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold">Category</Label>
                                    <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
                                        <SelectTrigger className="w-full bg-savanna-charcoal/50 border-border/30 h-12 focus:border-savanna-gold px-4">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background">
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat} className="hover:bg-savanna-gold/10">
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold">Images</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="w-full bg-savanna-charcoal/50 border-border/30 h-12"
                                        onChange={(e) => {
                                            if (e.target.files) handleFilesSelected(e.target.files);
                                        }}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Max 15MB per image</p>
                                </div>

                                {uploadFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Preview ({uploadFiles.length})</p>
                                        <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                                            {uploadFiles.map((item, idx) => (
                                                <div key={item.previewUrl} className="flex items-center gap-3 bg-savanna-charcoal/50 p-2 border border-border/30">
                                                    <img src={item.previewUrl} alt={item.title} className="h-16 w-16 rounded object-cover" />
                                                    <div className="flex-1 min-w-0">
                                                        <Input
                                                            value={item.title}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                setUploadFiles((cur) => cur.map((x, i) => (i === idx ? { ...x, title: v } : x)));
                                                            }}
                                                            className="h-8 text-sm bg-savanna-charcoal/30 border-border/30"
                                                        />
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => removeUploadFile(idx)} className="h-8 w-8 flex-shrink-0">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 pb-6">
                                    {uploading ? (
                                        <div className="space-y-2">
                                            <Progress value={uploadProgress} className="h-2" />
                                            <p className="text-xs text-muted-foreground">Uploading… {Math.round(uploadProgress)}%</p>
                                        </div>
                                    ) : (
                                        <Button
                                            className="w-full bg-savanna-gold text-savanna-charcoal hover:bg-savanna-gold/90 h-12 tracking-[0.2em] uppercase text-xs font-bold"
                                            disabled={!canUpload}
                                            onClick={async () => {
                                                await uploadMutation.mutateAsync();
                                            }}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload {uploadFiles.length} photo{uploadFiles.length > 1 ? 's' : ''}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile: FAB for Upload */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                onClick={() => setShowUploadPanel(true)}
                className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-savanna-gold text-savanna-charcoal flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-savanna-gold/30 active:scale-90 transition-all z-40"
                aria-label="Upload photos"
            >
                <Plus className="w-7 h-7" />
            </motion.button>

            {/* Edit Dialog */}
            <PhotoEditDialog
                photo={editingPhoto}
                imageUrl={editingPhoto ? getPhotoUrl(editingPhoto) : ''}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSaveDetails={handleSaveDetails}
                onSaveCrop={handleSaveCrop}
                saving={editSaving}
                setEditSaving={setEditSaving}
                setEditDialogOpen={setEditDialogOpen}
            />
        </div>
    );
};

// Photo Grid Sub-component
function PhotoGrid({
    photos,
    photosAll,
    sensors,
    handlePhotoDragEnd,
    handleDeletePhoto,
    handleEditPhoto,
    handleSaveInlineTitle,
    isSearching
}: {
    photos: Photo[];
    photosAll: Photo[];
    sensors: any;
    handlePhotoDragEnd: (event: DragEndEvent) => void;
    handleDeletePhoto: (photo: Photo) => void;
    handleEditPhoto: (photo: Photo) => void;
    handleSaveInlineTitle: (id: string, newTitle: string) => Promise<void>;
    isSearching: boolean;
}) {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-semibold uppercase text-savanna-gold tracking-widest">Current Photos</p>
                    <h3 className="mt-1 font-display text-xl text-foreground font-light">
                        {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
                    </h3>
                </div>
                {photosAll.length > 0 && (
                    <span className="hidden md:inline-flex items-center gap-2 text-[10px] uppercase text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                        Drag to reorder
                    </span>
                )}
            </div>

            {photos.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-16 text-center bg-savanna-charcoal/20 border border-dashed border-border/30"
                >
                    <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                        No photos found. Upload your first photo to get started.
                    </p>
                </motion.div>
            ) : (
                <>
                    {isSearching ? (
                        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
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
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePhotoDragEnd}>
                            <SortableContext items={photos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                                    <AnimatePresence mode="popLayout">
                                        {photos.map((photo) => (
                                            <SortablePhotoCard
                                                key={photo.id}
                                                photo={photo}
                                                onDelete={() => handleDeletePhoto(photo)}
                                                onEdit={() => handleEditPhoto(photo)}
                                                onSaveTitle={handleSaveInlineTitle}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </>
            )}
        </div>
    );
}

export default MediaLibraryTab;
