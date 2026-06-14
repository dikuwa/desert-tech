"use client";

import { GripVertical, X } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

function SortableImage({
  id,
  url,
  index,
  isSelected,
  onSelect,
  onRemove,
}: {
  id: string;
  url: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative w-20 overflow-hidden rounded-lg border-2 bg-card transition-all",
        isSelected ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/40",
        isDragging && "z-50 scale-105 opacity-90 shadow-lg",
      )}
    >
      <button type="button" onClick={onSelect} className="block h-16 w-full">
        <img src={url} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
      </button>
      <div className="flex h-7 items-center border-t border-border/70 bg-background/95">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-full flex-1 touch-none cursor-grab items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
          title={`Drag image ${index + 1} to reorder`}
          aria-label={`Drag image ${index + 1} to reorder`}
        >
          <GripVertical className="h-3 w-3" />
          {index + 1}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-full w-7 items-center justify-center border-l border-border/70 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title={`Remove image ${index + 1}`}
          aria-label={`Remove image ${index + 1}`}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      {index === 0 && (
        <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
          Primary
        </span>
      )}
    </div>
  );
}

export function SortableImageGallery({
  images,
  selectedImage,
  onSelectImage,
  onRemoveImage,
  onReorder,
  className,
}: {
  images: string[];
  selectedImage: number;
  onSelectImage: (index: number) => void;
  onRemoveImage: (index: number) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  className?: string;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const imageIds = images.map((url, index) => `image-${index}-${url}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = imageIds.indexOf(String(active.id));
    const newIndex = imageIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(oldIndex, newIndex);
  };

  if (images.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <GripVertical className="h-3.5 w-3.5 text-primary" />
          Drag images to reorder
        </p>
        <p className="text-[10px] text-muted-foreground">Image 1 is used as the primary image</p>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={imageIds} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-2">
            {images.map((url, index) => (
              <SortableImage
                key={imageIds[index]}
                id={imageIds[index]}
                url={url}
                index={index}
                isSelected={selectedImage === index}
                onSelect={() => onSelectImage(index)}
                onRemove={() => onRemoveImage(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
