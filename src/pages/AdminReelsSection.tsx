import React, { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/intergration/supabase/client";

type VideoReel = {
  id: string;
  title: string;
  storage_video_path: string;
  storage_thumbnail_path: string;
  thumbnail_url: string | null;
  sort_order: number;
};

type Props = {
  // Reuse existing dnd-kit sensors from parent if you want; for now we keep internal
};

function getPublicUrl(path?: string, bucket: string = "video_reels") {
  if (!path) return "";
  const res = supabase.storage.from(bucket).getPublicUrl(path);
  // supabase types can be strict; but this is fine at runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (res as any).data;
  return data?.publicUrl || "";
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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const thumbnailUrl = reel.thumbnail_url || getPublicUrl(reel.storage_thumbnail_path);

  return (
    <Card ref={setNodeRef} style={style} className="rounded-lg border-border bg-card shadow-sm">
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

        <div className="relative h-16 w-24 overflow-hidden rounded border-border bg-background">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={reel.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-foreground/5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-display text-lg text-foreground font-light truncate">{reel.title}</h4>
          <p className="text-xs text-muted-foreground uppercase">{index + 1}</p>
        </div>

        <Button variant="destructive" size="icon" className="h-9 w-9 rounded-md" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

const AdminReelsSection = ({}: Props) => {
  const queryClient = useQueryClient();

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

  const reels = reelsQuery.data ?? [];

  // Upload state
  const [title, setTitle] = useState("");
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

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required");
      if (!thumbnailFile) throw new Error("Thumbnail is required");
      if (!videoFile) throw new Error("Video file is required");

      const nextSortBase = reels.length;

      const videoExt = videoFile.name.split(".").pop() || "mp4";
      const videoPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${videoExt}`;

      const thumbExt = thumbnailFile.name.split(".").pop() || "jpg";
      const thumbPath = `thumb-${Date.now()}-${Math.random().toString(36).slice(2)}.${thumbExt}`;

      const vidRes = await supabase.storage.from("video_reels").upload(videoPath, videoFile, {
        contentType: videoFile.type || "video/mp4",
      });
      if (vidRes.error) throw vidRes.error;

      const thRes = await supabase.storage.from("video_reels").upload(thumbPath, thumbnailFile, {
        contentType: thumbnailFile.type || "image/jpeg",
      });
      if (thRes.error) throw thRes.error;

      const thumbnailUrl = getPublicUrl(thumbPath);

      const dbRes = await (supabase as any).from("video_reels").insert({
        title: title.trim(),
        storage_video_path: videoPath,
        storage_thumbnail_path: thumbPath,
        thumbnail_url: thumbnailUrl,
        sort_order: nextSortBase,
      });
      if (dbRes.error) throw dbRes.error;
    },
    onSuccess: () => {
      setTitle("");
      setThumbnailFile(null);
      setVideoFile(null);
      setThumbnailPreview(null);
      setVideoPreview(null);
      setUploading(false);
      setUploadProgress(0);
      toast.success("Reel uploaded");
      queryClient.invalidateQueries({ queryKey: ["admin-video-reels"] });
    },
    onError: (err: any) => {
      setUploading(false);
      setUploadProgress(0);
      toast.error(err?.message || "Failed to upload reel");
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

      await supabase.storage.from("video_reels").remove([vid, th]);

      const res = await (supabase as any).from("video_reels").delete().eq("id", reel.id);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      toast.success("Reel deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-video-reels"] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete reel"),
  });

  const reorderMutation = useMutation({
    mutationFn: async (ordered: VideoReel[]) => {
      const updates = ordered.map((r, index) =>
        (supabase as any).from("video_reels").update({ sort_order: index }).eq("id", r.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-video-reels"] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to reorder"),
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = reels.findIndex((r) => r.id === active.id);
      const newIndex = reels.findIndex((r) => r.id === over.id);
      const ordered = arrayMove(reels, oldIndex, newIndex);

      queryClient.setQueryData(["admin-video-reels"], ordered);
      reorderMutation.mutate(ordered);
    },
    [reels, queryClient, reorderMutation]
  );

  return (
    <Card className="border-border">
        <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Upload</p>
                <h3 className="mt-1 font-display text-xl font-light">Add new video reels</h3>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Behind the Scenes" />
              </div>

              <div className="space-y-2">
                <Label>Thumbnail image</Label>
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
                />
              </div>

              {thumbnailPreview ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Thumbnail preview</p>
                  <img src={thumbnailPreview} alt="thumbnail" className="h-24 w-24 object-cover rounded border-border" />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label>Video file</Label>
                <p className="text-xs text-muted-foreground">
                  Max size: <span className="font-medium">50MB</span> (upload limit may be lower depending on Supabase settings)
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

                    const MAX_BYTES = 50 * 1024 * 1024; // 50MB
                    if (f.size > MAX_BYTES) {
                      toast.error(`"${f.name}" is too large. Max allowed is 50MB.`);
                      setVideoFile(null);
                      setVideoPreview(null);
                      return;
                    }

                    setVideoFile(f);
                    setVideoPreview(URL.createObjectURL(f));
                  }}
                />
              </div>


              {videoPreview ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Video preview</p>
                  <video src={videoPreview} className="w-full max-w-xs rounded border-border" muted />
                </div>
              ) : null}

              <div className="pt-2">
                {uploading ? (
                  <div className="space-y-2">
                    <Progress value={uploadProgress || 50} />
                    <p className="text-xs text-muted-foreground">Uploading…</p>
                  </div>
                ) : (
                  <Button
                    className="w-full border border-border bg-card hover:bg-card/90 focus:ring-1 focus:ring-foreground/10 h-10 rounded-md cursor-pointer"
                    disabled={!title.trim() || !thumbnailFile || !videoFile || uploading}
                    onClick={async () => uploadMutation.mutateAsync()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Reel
                  </Button>
                )}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-8">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Current reels</p>
              <h3 className="mt-1 font-display text-xl font-light">Reorder & delete</h3>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={reels.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {reels.map((reel, idx) => (
                    <SortableReelCard key={reel.id} reel={reel} index={idx} onDelete={() => {
                      if (!confirm("Delete this reel?")) return;
                      deleteMutation.mutate(reel);
                    }} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </section>
        </div>
        </CardContent>
    </Card> 
  );
};

export default AdminReelsSection;

