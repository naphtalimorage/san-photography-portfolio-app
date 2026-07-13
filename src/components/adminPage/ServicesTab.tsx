// src/components/adminpage/ServicesTab.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    MoreVertical,
    Clock,
    DollarSign,
    Star,
    Download,
    LayoutGrid,
    List,
    TrendingUp,
    Edit,
    Trash2,
    GripVertical,
    Search,
    X,
    Briefcase
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
import ServiceEditDialog, { type Service } from '@/components/dialog/ServiceEditDialog';

type ServiceInsert = {
    title: string;
    price: string;
    features: string[];
    icon_name: string;
    sort_order: number;
};

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

    const [showActions, setShowActions] = useState(false);

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    const handleDelete = () => {
        if (confirm('Delete this service? This action cannot be undone.')) {
            onDelete();
        }
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="group relative bg-savanna-charcoal/30 border border-border/30 overflow-hidden hover:border-savanna-gold/50 transition-all duration-500"
            onClick={() => setShowActions(!showActions)}
        >
            {/* Drag Handle - Always visible on mobile, hover on desktop */}
            <button
                className="absolute top-3 left-3 md:top-4 md:left-4 p-1.5 md:p-2 bg-savanna-charcoal/80 backdrop-blur text-savanna-gold md:text-muted-foreground md:hover:text-savanna-gold transition-colors cursor-grab active:cursor-grabbing z-10"
                {...attributes}
                {...listeners}
                aria-label="Drag to reorder"
            >
                <GripVertical className="w-4 h-4" />
            </button>

            {/* Service Content */}
            <div className="p-4 pl-14 md:p-6 md:pl-16">
                <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-display text-lg md:text-xl text-foreground group-hover:text-savanna-gold transition-colors truncate">
                            {service.title}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1 truncate">
                            {service.price}
                        </p>
                    </div>

                    {/* Desktop: More menu */}
                    <button
                        className="hidden md:block text-muted-foreground hover:text-savanna-gold transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 md:w-[18px] md:h-[18px] flex-shrink-0" />
                        <span className="text-xs md:text-sm truncate">
                            {service.features?.length || 0} Features
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="w-4 h-4 md:w-[18px] md:h-[18px] flex-shrink-0" />
                        <span className="text-xs md:text-sm font-bold text-foreground truncate">
                            {service.price}
                        </span>
                    </div>
                </div>

                {/* Features List */}
                {service.features && service.features.length > 0 && (
                    <div className="mb-4 md:mb-6 space-y-1.5 md:space-y-2">
                        {service.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 bg-savanna-gold rounded-full flex-shrink-0" />
                                <span className="truncate">{feature}</span>
                            </div>
                        ))}
                        {service.features.length > 3 && (
                            <p className="text-[10px] md:text-xs text-muted-foreground italic">
                                +{service.features.length - 3} more features
                            </p>
                        )}
                    </div>
                )}

                {/* Desktop: Footer with rating and actions */}
                <div className="hidden md:flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-savanna-gold fill-savanna-gold" />
                        <span className="text-xs text-foreground font-bold">4.9</span>
                        <span className="text-xs text-muted-foreground">(42 reviews)</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="p-2 border border-border/30 text-foreground hover:bg-savanna-gold hover:text-savanna-charcoal transition-all active:scale-95"
                            aria-label="Edit service"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="p-2 border border-border/30 text-foreground hover:bg-error hover:text-white transition-all active:scale-95"
                            aria-label="Delete service"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
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
                        className="md:hidden flex items-center justify-between px-4 py-3 bg-savanna-charcoal/50 border-t border-border/30 overflow-hidden"
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

const ServicesTab = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Services');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const servicesQuery = useQuery({
        queryKey: ['admin-services'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('sort_order', { ascending: true });
            if (error) throw error;
            return data as Service[];
        },
    });

    const services = servicesQuery.data ?? [];

    // Service mutations
    const serviceMutation = useMutation({
        mutationFn: async (service: Partial<Service>) => {
            if (editingService) {
                const { error } = await supabase
                    .from('services')
                    .update(service)
                    .eq('id', editingService.id);
                if (error) throw error;
                return;
            }

            const newService: ServiceInsert = {
                title: service.title || '',
                price: service.price || '',
                icon_name: service.icon_name || 'Compass',
                features: service.features || [],
                sort_order: services.length,
            };

            const { error } = await supabase.from('services').insert(newService);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-services'] });
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast.success(editingService ? 'Service updated' : 'Service added');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const deleteServiceMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-services'] });
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast.success('Service deleted');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const reorderServicesMutation = useMutation({
        mutationFn: async (reordered: Service[]) => {
            const updates = reordered.map((s, index) =>
                supabase.from('services').update({ sort_order: index }).eq('id', s.id)
            );
            await Promise.all(updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-services'] });
            queryClient.invalidateQueries({ queryKey: ['services'] });
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

            queryClient.setQueryData(['admin-services'], reordered);
            reorderServicesMutation.mutate(reordered);
        },
        [services, queryClient, reorderServicesMutation]
    );

    const handleDeleteService = useCallback(
        (service: Service) => deleteServiceMutation.mutate(service.id),
        [deleteServiceMutation]
    );

    const filters = ['All Services', 'Private Tours', 'Workshops', 'Expeditions', 'Archived'];

    const filteredItems = services.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="pb-24 md:pb-0">
            {/* Page Header */}
            <div className="flex flex-col gap-4 mb-6 md:mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-[1px] bg-savanna-gold" />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-savanna-gold font-bold">
                                Management
                            </span>
                        </div>
                        <h2 className="font-display text-2xl md:text-5xl text-foreground font-light leading-tight">
                            Service Inventory
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-lg max-w-2xl leading-relaxed mt-1 md:mt-2">
                            Curate your exclusive photographic experiences
                        </p>
                    </div>

                    {/* Desktop: Add Button */}
                    <button
                        onClick={() => {
                            setEditingService(null);
                            setServiceDialogOpen(true);
                        }}
                        className="hidden md:flex bg-savanna-gold text-savanna-charcoal px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold items-center gap-3 transition-transform active:scale-95 shadow-lg shadow-savanna-gold/10 hover:bg-savanna-gold/90"
                    >
                        <Plus className="w-5 h-5" />
                        ADD NEW SERVICE
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
                        placeholder="Search services..."
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
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col gap-4 mb-6 md:mb-8">
                {/* Filter Tabs - Horizontal Scroll on Mobile */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar w-full">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 md:px-6 py-2 whitespace-nowrap text-xs md:text-sm font-medium transition-colors flex-shrink-0 ${activeFilter === filter
                                    ? 'border-b-2 border-savanna-gold text-savanna-gold font-bold'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Results Count & View Toggle */}
                <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground">
                        Showing {filteredItems.length} of {services.length}
                    </span>
                    <div className="hidden md:flex bg-savanna-charcoal/30 p-1 border border-border/30">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 transition-colors ${viewMode === 'grid'
                                    ? 'bg-savanna-charcoal text-savanna-gold'
                                    : 'hover:text-savanna-gold'
                                }`}
                            aria-label="Grid view"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 transition-colors ${viewMode === 'list'
                                    ? 'bg-savanna-charcoal text-savanna-gold'
                                    : 'hover:text-savanna-gold'
                                }`}
                            aria-label="List view"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Services Grid/List */}
            {services.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-16 text-center bg-savanna-charcoal/20 border border-dashed border-border/30"
                >
                    <Briefcase className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm mb-4">
                        No services yet. Create your first service to get started.
                    </p>
                    <button
                        onClick={() => {
                            setEditingService(null);
                            setServiceDialogOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-savanna-gold text-savanna-charcoal text-xs tracking-[0.2em] uppercase font-bold active:scale-95 transition-transform"
                    >
                        <Plus className="w-4 h-4" />
                        Add Service
                    </button>
                </motion.div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleServiceDragEnd}>
                    <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                        <div className={`grid gap-3 md:gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                                : 'grid-cols-1'
                            }`}>
                            <AnimatePresence mode="popLayout">
                                {filteredItems.map((service) => (
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
                            </AnimatePresence>
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Summary Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mt-8 md:mt-16 bg-savanna-charcoal/30 backdrop-blur-sm p-5 md:p-8 border border-border/30"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    <div className="space-y-1">
                        <p className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground font-bold">
                            Total Value
                        </p>
                        <h4 className="font-display text-2xl md:text-3xl text-savanna-gold">
                            $124,500
                        </h4>
                        <p className="text-[10px] md:text-xs text-savanna-forest flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +12% from last month
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground font-bold">
                            Active Services
                        </p>
                        <h4 className="font-display text-2xl md:text-3xl text-foreground">
                            {services.length.toString().padStart(2, '0')}
                        </h4>
                        <div className="h-1 bg-savanna-charcoal w-full mt-2">
                            <div
                                className="h-full bg-savanna-gold transition-all duration-500"
                                style={{ width: `${services.length > 0 ? 75 : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground font-bold">
                            Pending Bookings
                        </p>
                        <h4 className="font-display text-2xl md:text-3xl text-foreground">
                            24
                        </h4>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                            Across all categories
                        </p>
                    </div>

                    <div className="col-span-2 md:col-span-1 flex items-end md:justify-end">
                        <button className="w-full md:w-auto flex items-center justify-center gap-2 text-[10px] md:text-xs tracking-widest uppercase font-bold text-foreground border border-border/30 px-4 md:px-6 py-2.5 md:py-3 hover:bg-savanna-charcoal transition-colors active:scale-95">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">DOWNLOAD REPORT</span>
                            <span className="sm:hidden">REPORT</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Mobile: FAB for Adding Service */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                onClick={() => {
                    setEditingService(null);
                    setServiceDialogOpen(true);
                }}
                className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-savanna-gold text-savanna-charcoal flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-savanna-gold/30 active:scale-90 transition-all z-40"
                aria-label="Add new service"
            >
                <Plus className="w-7 h-7" />
            </motion.button>

            {/* Service Edit Dialog */}
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

export default ServicesTab;
