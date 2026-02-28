import { useState, useCallback } from 'react'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableImageGridProps {
  images: string[]
  onReorder: (images: string[]) => void
  onRemove: (index: number) => void
  maxImages?: number
}

// Individual sortable image item
function SortableImageItem({
  url,
  index,
  isMain,
  onRemove,
  totalImages,
}: {
  url: string
  index: number
  isMain: boolean
  onRemove: () => void
  totalImages: number
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url + '__' + index })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style as any}
      className={`relative aspect-square rounded-xl overflow-hidden bg-[#111] border-2 group transition-all duration-200
        ${isDragging
          ? 'border-[#0070f3] ring-2 ring-[#0070f3]/30 scale-105 shadow-2xl'
          : 'border-[#222] hover:border-[#444]'
        }
      `}
    >
      <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover" />

      {/* Drag handle overlay — visible on hover/touch */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing touch-manipulation"
        aria-label={`Drag to reorder image ${index + 1}`}
      >
        {/* Grip indicator for desktop */}
        <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white/80">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="8" cy="4" r="2" /><circle cx="16" cy="4" r="2" />
            <circle cx="8" cy="12" r="2" /><circle cx="16" cy="12" r="2" />
            <circle cx="8" cy="20" r="2" /><circle cx="16" cy="20" r="2" />
          </svg>
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-[#ff4444]/90 hover:bg-[#ff4444] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white shadow-lg active:scale-90"
        title="Remove image"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Main badge */}
      {isMain && (
        <span className="absolute bottom-2 left-2 bg-white text-black text-[10px] px-2 py-1 rounded-md font-bold tracking-wide shadow-lg uppercase">
          Main
        </span>
      )}

      {/* Position number */}
      {!isMain && (
        <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white/90 text-[10px] px-2 py-1 rounded-md font-medium">
          {index + 1}
        </span>
      )}
    </div>
  )
}

export default function SortableImageGrid({
  images,
  onReorder,
  onRemove,
  maxImages = 10,
}: SortableImageGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Configure sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const items = images.map((url, i) => url + '__' + i)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string
    setActiveId(id)
    const idx = items.indexOf(id)
    setActiveIndex(idx)
  }, [items])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveIndex(null)

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string)
      const newIndex = items.indexOf(over.id as string)
      const newImages = arrayMove(images, oldIndex, newIndex)
      onReorder(newImages)
    }
  }, [items, images, onReorder])

  if (images.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <p className="text-[11px] uppercase tracking-wider text-[#555] font-medium">
          Drag to reorder
        </p>
        <span className="text-[11px] text-[#333]">•</span>
        <p className="text-[11px] text-[#555]">
          First image = main product photo
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((url, index) => (
              <SortableImageItem
                key={url + '__' + index}
                url={url}
                index={index}
                isMain={index === 0}
                onRemove={() => onRemove(index)}
                totalImages={images.length}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay — shows a floating copy of the dragged item */}
        <DragOverlay adjustScale>
          {activeId && activeIndex !== null ? (
            <div className="aspect-square rounded-xl overflow-hidden bg-[#111] border-2 border-[#0070f3] shadow-2xl shadow-[#0070f3]/20 w-[120px]">
              <Image
                src={images[activeIndex]}
                alt="Dragging"
                width={120}
                height={120}
                className="object-cover w-full h-full"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
