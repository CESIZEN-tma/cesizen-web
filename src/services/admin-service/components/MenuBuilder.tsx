import React, { useState } from 'react';
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
import { Button } from '../../../shared/components/Button';
import {
  MdDragHandle,
  MdEdit,
  MdDelete,
  MdSubdirectoryArrowRight,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md';
import type { NavigationMenuDto } from '../api/adminTypes';
import './css/menu-builder.css';
import Icon from '../../../shared/components/Icon';

const INFO_PAGE_SCHEME = 'cesizen://info-page/';

function displayUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith(INFO_PAGE_SCHEME)) return `Page: ${url.slice(INFO_PAGE_SCHEME.length)}`;
  return url;
}

interface MenuBuilderProps {
  menus: NavigationMenuDto[];
  onReorderRoots: (reorderedRoots: NavigationMenuDto[]) => void;
  onReorderChildren: (parentId: string, reorderedChildren: NavigationMenuDto[]) => void;
  onEdit: (menu: NavigationMenuDto) => void;
  onDelete: (menu: NavigationMenuDto) => void;
  onCreate: () => void;
  onCreateChild: (parent: NavigationMenuDto) => void;
}

// ── Child sortable item ──────────────────────────────────────────────────────

interface SortableChildItemProps {
  menu: NavigationMenuDto;
  onEdit: (menu: NavigationMenuDto) => void;
  onDelete: (menu: NavigationMenuDto) => void;
}

const SortableChildItem: React.FC<SortableChildItemProps> = ({ menu, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: menu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="menu-item menu-item--child">
      <div className="menu-item-indent">
        <Icon icon={MdSubdirectoryArrowRight} size={16} color="var(--color-gray-400)" />
      </div>
      <div className="menu-item-drag" {...attributes} {...listeners}>
        <Icon icon={MdDragHandle} size={20} color="var(--color-gray-500)" />
      </div>
      <div className="menu-item-content">
        <div className="menu-item-info">
          <span className="menu-item-label">{menu.label}</span>
          {menu.url && (
            <span className="menu-item-url">{displayUrl(menu.url)}</span>
          )}
          {!menu.url && (
            <span className="menu-item-url" style={{ fontStyle: 'italic' }}>
              Pas de lien
            </span>
          )}
        </div>
        <span className="menu-item-position">#{menu.position}</span>
      </div>
      <div className="menu-item-actions">
        <Button variant="secondary" size="small" icon={MdEdit} onClick={() => onEdit(menu)}>
          Edit
        </Button>
        <Button variant="danger" size="small" icon={MdDelete} onClick={() => onDelete(menu)}>
          Delete
        </Button>
      </div>
    </div>
  );
};

// ── Root sortable group ──────────────────────────────────────────────────────

interface SortableRootGroupProps {
  menu: NavigationMenuDto;
  collapsed: boolean;
  onToggleCollapse: (id: string) => void;
  onEdit: (menu: NavigationMenuDto) => void;
  onDelete: (menu: NavigationMenuDto) => void;
  onCreateChild: (parent: NavigationMenuDto) => void;
  onReorderChildren: (parentId: string, reorderedChildren: NavigationMenuDto[]) => void;
}

const SortableRootGroup: React.FC<SortableRootGroupProps> = ({
  menu,
  collapsed,
  onToggleCollapse,
  onEdit,
  onDelete,
  onCreateChild,
  onReorderChildren,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: menu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChildren = menu.children && menu.children.length > 0;

  const childSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleChildDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const children = menu.children ?? [];
    const oldIndex = children.findIndex((c) => c.id === active.id);
    const newIndex = children.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(children, oldIndex, newIndex);
    onReorderChildren(menu.id, reordered);
  };

  return (
    <div ref={setNodeRef} style={style} className="menu-group">
      {/* Root item row */}
      <div className="menu-item">
        <div className="menu-item-drag" {...attributes} {...listeners}>
          <Icon icon={MdDragHandle} size={20} color="var(--color-gray-500)" />
        </div>

        {hasChildren && (
          <button
            type="button"
            className="menu-collapse-btn"
            onClick={() => onToggleCollapse(menu.id)}
            title={collapsed ? 'Déplier' : 'Replier'}
          >
            <Icon
              icon={collapsed ? MdExpandMore : MdExpandLess}
              size={20}
              color="var(--color-gray-500)"
            />
          </button>
        )}

        <div className="menu-item-content">
          <div className="menu-item-info">
            <span className="menu-item-label">{menu.label}</span>
            {!hasChildren && menu.url && (
              <span className="menu-item-url">{displayUrl(menu.url)}</span>
            )}
            {!hasChildren && !menu.url && (
              <span className="menu-item-url" style={{ fontStyle: 'italic' }}>
                Pas de lien
              </span>
            )}
            {hasChildren && (
              <span className="menu-item-url" style={{ fontStyle: 'italic' }}>
                {menu.children.length} sous-menu{menu.children.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <span className="menu-item-position">#{menu.position}</span>
        </div>

        <div className="menu-item-actions">
          <Button variant="secondary" size="small" onClick={() => onCreateChild(menu)}>
            + Sous-menu
          </Button>
          <Button variant="secondary" size="small" icon={MdEdit} onClick={() => onEdit(menu)}>
            Edit
          </Button>
          <Button variant="danger" size="small" icon={MdDelete} onClick={() => onDelete(menu)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div className="menu-children">
          <DndContext
            sensors={childSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleChildDragEnd}
          >
            <SortableContext
              items={(menu.children ?? []).map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {(menu.children ?? []).map((child) => (
                <SortableChildItem
                  key={child.id}
                  menu={child}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

// ── MenuBuilder ──────────────────────────────────────────────────────────────

export const MenuBuilder: React.FC<MenuBuilderProps> = ({
  menus,
  onReorderRoots,
  onReorderChildren,
  onEdit,
  onDelete,
  onCreate,
  onCreateChild,
}) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const rootSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRootDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = menus.findIndex((m) => m.id === active.id);
    const newIndex = menus.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(menus, oldIndex, newIndex);
    onReorderRoots(reordered);
  };

  return (
    <div className="menu-builder">
      <div className="menu-builder-header">
        <h3>Menu Items</h3>
        <Button variant="primary" onClick={onCreate}>
          Add Menu Item
        </Button>
      </div>

      {menus.length === 0 ? (
        <div className="menu-builder-empty">
          <p>No menu items yet. Click "Add Menu Item" to create one.</p>
        </div>
      ) : (
        <DndContext
          sensors={rootSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleRootDragEnd}
        >
          <SortableContext
            items={menus.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="menu-items-list">
              {menus.map((menu) => (
                <SortableRootGroup
                  key={menu.id}
                  menu={menu}
                  collapsed={collapsed.has(menu.id)}
                  onToggleCollapse={toggleCollapse}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCreateChild={onCreateChild}
                  onReorderChildren={onReorderChildren}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
