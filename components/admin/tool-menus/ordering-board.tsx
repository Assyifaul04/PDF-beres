"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DotsSixVerticalIcon,
  FloppyDiskIcon,
} from "@phosphor-icons/react";

interface MenuItem {
  id: string;
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  href: string;
  icon: string | null;
}

interface CategoryItem {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  menus: MenuItem[];
}

export function OrderingBoard({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ---- Category reorder ----
  function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex).map(
      (c, i) => ({ ...c, order: i })
    );
    setCategories(reordered);
    setDirty(true);
  }

  // ---- Menu reorder (per kategori) ----
  function handleMenuDragEnd(categoryId: string, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const oldIndex = cat.menus.findIndex((m) => m.id === active.id);
        const newIndex = cat.menus.findIndex((m) => m.id === over.id);
        const reordered = arrayMove(cat.menus, oldIndex, newIndex).map(
          (m, i) => ({ ...m, order: i })
        );
        return { ...cat, menus: reordered };
      })
    );
    setDirty(true);
  }

  // ---- Save ----
  function handleSave() {
    startTransition(async () => {
      const payload = {
        categories: categories.map((c) => ({
          id: c.id,
          order: c.order,
        })),
        menus: categories.flatMap((c) =>
          c.menus.map((m) => ({ id: m.id, order: m.order }))
        ),
      };

      const res = await fetch("/api/admin/tool-menus/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Gagal menyimpan urutan");
        return;
      }

      setDirty(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div>
          <p className="text-sm font-medium">
            {dirty ? "Ada perubahan belum disimpan" : "Semua tersimpan"}
          </p>
          <p className="text-xs text-muted-foreground">
            Drag ikon <DotsSixVerticalIcon className="inline h-3 w-3" /> untuk
            memindahkan
          </p>
        </div>
        <Button onClick={handleSave} disabled={!dirty || isPending}>
          <FloppyDiskIcon className="mr-2 h-4 w-4" />
          {isPending ? "Menyimpan..." : "Simpan Urutan"}
        </Button>
      </div>

      {/* Categories */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleCategoryDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {categories.map((cat) => (
              <SortableCategory
                key={cat.id}
                category={cat}
                onMenuDragEnd={(e) => handleMenuDragEnd(cat.id, e)}
                sensors={sensors}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableCategory({
  category,
  onMenuDragEnd,
  sensors,
}: {
  category: CategoryItem;
  onMenuDragEnd: (e: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border bg-card">
      {/* Category Header */}
      <div className="flex items-center gap-3 border-b p-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <DotsSixVerticalIcon className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <p className="font-semibold">{category.name}</p>
          <p className="text-xs text-muted-foreground">
            Order: {category.order} · {category.menus.length} menu
          </p>
        </div>
        <Badge variant={category.isActive ? "default" : "outline"}>
          {category.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      </div>

      {/* Menu List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onMenuDragEnd}
      >
        <SortableContext
          items={category.menus.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1 p-2">
            {category.menus.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Belum ada menu
              </p>
            ) : (
              category.menus.map((menu) => (
                <SortableMenu key={menu.id} menu={menu} />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableMenu({ menu }: { menu: MenuItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md border bg-background p-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <DotsSixVerticalIcon className="h-4 w-4 text-muted-foreground" />
      </button>
      <span className="w-8 text-center font-mono text-xs text-muted-foreground">
        {menu.order}
      </span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{menu.title}</p>
        <p className="truncate text-xs text-muted-foreground">{menu.href}</p>
      </div>
      <Badge variant={menu.isActive ? "default" : "outline"} className="text-xs">
        {menu.isActive ? "On" : "Off"}
      </Badge>
    </div>
  );
}