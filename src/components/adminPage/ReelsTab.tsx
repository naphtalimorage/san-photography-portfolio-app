// src/components/adminpage/ReelsTab.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Trash2,
    Check,
    Film,
    TrendingUp,
    Users,
    Activity,
    Upload,
    GripVertical,
    Plus,
    X,
    Eye,
    Heart,
    MoreVertical,
    Edit
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

type VideoReel = {
    id: string;
    title: string;
    storage_video_path: string;
    storage_thumbnail_path: string;
    thumbnail_url: string | null;
    sort_order: number;
    views?: number;
    likes?: number;
};

function getPublicUrl(path?: string, bucket: string = 'video_reels') {
    if (!path) return '';
    const res = supabase.storage.from(bucket).getPublicUrl(path);
    const data = (res as any).data;
    return data?.publicUrl || '';
}

function SortableReelCard({
    reel,
    index,
    onDelete,
}: {
    reel: VideoReel;
    index: number;
    onDelete: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: reel.id });
    const [showActions, setShowActions] = useState(false);

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    const thumbnailUrl = reel.thumbnail_url || getPublicUrl(reel.storage_thumbnail_path);

    const handleDelete = () => {
        if (confirm('Delete this reel? This action cannot be undone.')) {
            onDelete();
        }
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="group bg-savanna-charcoal/30 border border-border/30 overflow-hidden hover:border-savanna-gold/50 transition-all duration-300"
            onClick={() => setShowActions(!showActions)}
        >
            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
                {/* Drag Handle - Always visible on mobile */}
                <button
                    className="p-1.5 md:p-2 text-savanna-gold md:text-muted-foreground md:hover:text-savanna-gold transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
                    {...attributes}
                    {...listeners}
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Thumbnail */}
                <div className="relative h-20 w-14 md:h-24 md:w-16 overflow-hidden border border-border/30 flex-shrink-0">
                    {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={reel.title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-savanna-charcoal/50 flex items-center justify-center">
                            <Film className="w-6 h-6 text-muted-foreground" />
                        </div>
                    )}

                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-savanna-charcoal/30">
                        <div className="w-8 h-8 rounded-full bg-savanna-gold/80 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-savanna-charcoal ml-0.5" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-display text-base md:text-lg text-foreground font-light truncate mb-1">
                        {reel.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] md:text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {reel.views?.toLocaleString() || '0'}
                        </span>
                        <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {reel.likes?.toLocaleString() || '0'}
                        </span>
                    </div>
                    <p className="text-[9px] md:text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        Reel #{index + 1}
                    </p>
                </div>

                {/* Desktop: Delete button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}
                    className="hidden md:block p-2 border border-border/30 text-foreground hover:bg-error hover:text-white transition-all active:scale-90"
                    aria-label="Delete reel"
                >
                    <Trash2 className="w-4 h-4" />
                </button>

                {/* Mobile: More icon */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(!showActions);
                    }}
                    className="md:hidden p-2 text-muted-foreground"
                    aria-label="More actions"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>

            {/* Mobile: Action Bar - Appears on tap */}
            <AnimatePresence>
                {showActions && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden flex items-center justify-between px-4 py-3 bg-savanna-charcoal/50 border-t border-border/30 overflow-hidden"
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toast.info('Edit reel - Coming soon');
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

const analytics = [
    {
        label: 'Total Views (7d)',
        value: '1.2M',
        change: '+12%',
        icon: TrendingUp,
        color: 'text-savanna-gold'
    },
    {
        label: 'Engagement Rate',
        value: '8.4%',
        change: '+0.8%',
        icon: Users,
        color: 'text-foreground'
    },
    {
        label: 'Active Distributions',
        value: '24',
        change: 'REELS LIVE',
        icon: Activity,
        color: 'text-foreground'
    },
    {
        label: 'Network Health',
        value: 'Optimal',
        change: '',
        icon: Check,
        color: 'text-savanna-forest'
    }
];

const ReelsTab = () => {
    const queryClient = useQueryClient();
    const [showUploadPanel, setShowUploadPanel] = useState(false);

    // Upload state
    const [title, setTitle] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const reelsQuery = useQuery({
        queryKey: ['admin-video-reels'],
        queryFn: async () => {
            const res = await (supabase as any)
                .from('video_reels')
                .select('id,title,storage_video_path,storage_thumbnail_path,thumbnail_url,sort_order')
                .order('sort_order', { ascending: true });
            if (res.error) throw res.error;
            return (res.data ?? []) as VideoReel[];
        },
    });

    const reels = reelsQuery.data ?? [];

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!title.trim()) throw new Error('Title is required');
            if (!thumbnailFile) throw new Error('Thumbnail is required');
            if (!videoFile) throw new Error('Video file is required');

            const nextSortBase = reels.length;

            const videoExt = videoFile.name.split('.').pop() || 'mp4';
            const videoPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${videoExt}`;

            const thumbExt = thumbnailFile.name.split('.').pop() || 'jpg';
            const thumbPath = `thumb-${Date.now()}-${Math.random().toString(36).slice(2)}.${thumbExt}`;

            const vidRes = await supabase.storage.from('video_reels').upload(videoPath, videoFile, {
                contentType: videoFile.type || 'video/mp4',
            });
            if (vidRes.error) throw vidRes.error;

            const thRes = await supabase.storage.from('video_reels').upload(thumbPath, thumbnailFile, {
                contentType: thumbnailFile.type || 'image/jpeg',
            });
            if (thRes.error) throw thRes.error;

            const thumbnailUrl = getPublicUrl(thumbPath);

            const dbRes = await (supabase as any).from('video_reels').insert({
                title: title.trim(),
                storage_video_path: videoPath,
                storage_thumbnail_path: thumbPath,
                thumbnail_url: thumbnailUrl,
                sort_order: nextSortBase,
            });
            if (dbRes.error) throw dbRes.error;
        },
        onSuccess: () => {
            setTitle('');
            setThumbnailFile(null);
            setVideoFile(null);
            setThumbnailPreview(null);
            setVideoPreview(null);
            setUploading(false);
            setUploadProgress(0);
            setShowUploadPanel(false);
            toast.success('Reel uploaded successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-video-reels'] });
        },
        onError: (err: any) => {
            setUploading(false);
            setUploadProgress(0);
            toast.error(err?.message || 'Failed to upload reel');
        },
        onMutate: () => {
            setUploading(true);
            setUploadProgress(50);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (reel: VideoReel) => {
            const vid = reel.storage_video_path;
            const th = reel.storage_thumbnail_path;

            await supabase.storage.from('video_reels').remove([vid, th]);

            const res = await (supabase as any).from('video_reels').delete().eq('id', reel.id);
            if (res.error) throw res.error;
        },
        onSuccess: () => {
            toast.success('Reel deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-video-reels'] });
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to delete reel'),
    });

    const reorderMutation = useMutation({
        mutationFn: async (ordered: VideoReel[]) => {
            const updates = ordered.map((r, index) =>
                (supabase as any).from('video_reels').update({ sort_order: index }).eq('id', r.id)
            );
            await Promise.all(updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-video-reels'] });
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to reorder'),
    });

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = reels.findIndex((r) => r.id === active.id);
            const newIndex = reels.findIndex((r) => r.id === over.id);
            const ordered = arrayMove(reels, oldIndex, newIndex);

            queryClient.setQueryData(['admin-video-reels'], ordered);
            reorderMutation.mutate(ordered);
        },
        [reels, queryClient, reorderMutation]
    );

    const handleDelete = (reel: VideoReel) => {
        deleteMutation.mutate(reel);
    };

    // Upload Form Component (reused for desktop and mobile)
    const UploadForm = () => (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold">
                    Title
                </Label>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Behind the Scenes"
                    className="bg-savanna-charcoal/50 border border-border/30 focus:border-savanna-gold focus:ring-0 h-11 md:h-12 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold">
                    Thumbnail Image
                </Label>
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        if (f) {
                            setThumbnailFile(f);
                            setThumbnailPreview(URL.createObjectURL(f));
                        } else {
                            setThumbnailFile(null);
                            setThumbnailPreview(null);
                        }
                    }}
                    className="bg-savanna-charcoal/50 border border-border/30 h-11 md:h-12 px-4 text-sm text-foreground"
                />
            </div>

            {thumbnailPreview && (
                <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Thumbnail preview</p>
                    <img
                        src={thumbnailPreview}
                        alt="thumbnail"
                        className="h-20 w-20 md:h-24 md:w-24 object-cover border border-border/30"
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-savanna-gold font-bold">
                    Video File
                </Label>
                <p className="text-[10px] text-muted-foreground">
                    Max size: <span className="font-medium text-savanna-gold">50MB</span>
                </p>
                <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        if (!f) {
                            setVideoFile(null);
                            setVideoPreview(null);
                            return;
                        }

                        const MAX_BYTES = 50 * 1024 * 1024;
                        if (f.size > MAX_BYTES) {
                            toast.error(`"${f.name}" is too large. Max allowed is 50MB.`);
                            setVideoFile(null);
                            setVideoPreview(null);
                            return;
                        }

                        setVideoFile(f);
                        setVideoPreview(URL.createObjectURL(f));
                    }}
                    className="bg-savanna-charcoal/50 border border-border/30 h-11 md:h-12 px-4 text-sm text-foreground"
                />
            </div>

            {videoPreview && (
                <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Video preview</p>
                    <video
                        src={videoPreview}
                        className="w-full max-w-xs border border-border/30"
                        muted
                        controls
                    />
                </div>
            )}

            <div className="pt-2">
                {uploading ? (
                    <div className="space-y-2">
                        <Progress value={uploadProgress || 50} className="h-2" />
                        <p className="text-xs text-muted-foreground">Uploading… {Math.round(uploadProgress)}%</p>
                    </div>
                ) : (
                    <Button
                        className="w-full bg-savanna-gold text-savanna-charcoal hover:bg-savanna-gold/90 h-11 md:h-12 tracking-[0.2em] uppercase text-[10px] md:text-xs font-bold transition-all shadow-lg shadow-savanna-gold/20 active:scale-95"
                        disabled={!title.trim() || !thumbnailFile || !videoFile || uploading}
                        onClick={async () => uploadMutation.mutateAsync()}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Reel
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <div className="pb-24 md:pb-0">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6 md:mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-[1px] bg-savanna-gold" />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-savanna-gold font-bold">
                                Video Content
                            </span>
                        </div>
                        <h2 className="font-display text-2xl md:text-5xl text-foreground font-light leading-tight">
                            Video Reels
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-lg max-w-xl leading-relaxed mt-1 md:mt-2">
                            Manage your cinematic library
                        </p>
                    </div>

                    {/* Desktop: Upload Button */}
                    <button
                        onClick={() => setShowUploadPanel(true)}
                        className="hidden md:flex bg-savanna-gold text-savanna-charcoal px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold items-center gap-3 transition-transform active:scale-95 shadow-lg shadow-savanna-gold/10 hover:bg-savanna-gold/90"
                    >
                        <Plus className="w-5 h-5" />
                        UPLOAD REEL
                    </button>
                </div>
            </div>

            {/* Analytics Preview Bento */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
                {analytics.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-savanna-charcoal/30 border border-border/30 p-4 md:p-6 flex flex-col justify-between relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <span className="text-[9px] md:text-xs tracking-[0.2em] uppercase text-muted-foreground font-bold">
                                    {stat.label}
                                </span>
                                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl md:text-4xl font-display ${stat.color}`}>
                                    {stat.value}
                                </span>
                                {stat.change && (
                                    <span className="text-[10px] md:text-sm font-bold text-savanna-forest">
                                        {stat.change}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Desktop: Upload Panel + Reels List */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-8">
                {showUploadPanel && (
                    <aside className="lg:col-span-4 bg-savanna-charcoal/30 border border-border/30 p-6 relative">
                        <button
                            onClick={() => setShowUploadPanel(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="mb-4">
                            <p className="text-[10px] font-semibold uppercase text-savanna-gold tracking-widest">Upload</p>
                            <h3 className="mt-1 font-display text-xl text-foreground font-light">Add new video reel</h3>
                        </div>
                        <UploadForm />
                    </aside>
                )}

                <section className={showUploadPanel ? "lg:col-span-8" : "lg:col-span-12"}>
                    <ReelsList
                        reels={reels}
                        sensors={sensors}
                        handleDragEnd={handleDragEnd}
                        handleDelete={handleDelete}
                    />
                </section>
            </div>

            {/* Mobile: Reels List Only */}
            <section className="lg:hidden">
                <ReelsList
                    reels={reels}
                    sensors={sensors}
                    handleDragEnd={handleDragEnd}
                    handleDelete={handleDelete}
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
                            className="lg:hidden fixed inset-0 bg-savanna-charcoal/80 backdrop-blur-sm z-40"
                            onClick={() => setShowUploadPanel(false)}
                        />

                        {/* Bottom Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-savanna-gold/20 max-h-[85vh] overflow-y-auto"
                        >
                            {/* Handle bar */}
                            <div className="sticky top-0 bg-background border-b border-border/30 p-4 flex items-center justify-between">
                                <div className="w-12 h-1 bg-border/50 rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2" />
                                <h3 className="font-display text-lg text-foreground mt-2">Upload Reel</h3>
                                <button
                                    onClick={() => setShowUploadPanel(false)}
                                    className="mt-2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-5">
                                <UploadForm />
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
                className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-savanna-gold text-savanna-charcoal flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-savanna-gold/30 active:scale-90 transition-all z-40"
                aria-label="Upload reel"
            >
                <Plus className="w-7 h-7" />
            </motion.button>
        </div>
    );
};

// Reels List Sub-component
function ReelsList({
    reels,
    sensors,
    handleDragEnd,
    handleDelete,
}: {
    reels: VideoReel[];
    sensors: any;
    handleDragEnd: (event: DragEndEvent) => void;
    handleDelete: (reel: VideoReel) => void;
}) {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-semibold uppercase text-savanna-gold tracking-widest">
                        Current Reels
                    </p>
                    <h3 className="mt-1 font-display text-lg md:text-xl text-foreground font-light">
                        {reels.length} {reels.length === 1 ? 'reel' : 'reels'}
                    </h3>
                </div>
                {reels.length > 0 && (
                    <span className="hidden md:inline-flex items-center gap-2 text-[10px] uppercase text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                        Drag to reorder
                    </span>
                )}
            </div>

            {reels.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 p-12 bg-savanna-charcoal/20 border border-dashed border-border/30 text-center"
                >
                    <Film className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm mb-4">
                        No reels uploaded yet. Start by uploading your first video reel.
                    </p>
                </motion.div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={reels.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2 md:space-y-3">
                            <AnimatePresence mode="popLayout">
                                {reels.map((reel, idx) => (
                                    <SortableReelCard
                                        key={reel.id}
                                        reel={reel}
                                        index={idx}
                                        onDelete={() => handleDelete(reel)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}

export default ReelsTab;
