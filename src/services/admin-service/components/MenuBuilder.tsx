import React from 'react';
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
import { Icon } from '../../../shared/components/Icon';
import { MdDragHandle, MdEdit, MdDelete } from 'react-icons/md';
import type { NavigationMenuDto } from '../api/adminTypes';
import './css/menu-builder.css';

interface MenuBuilderProps {
  menus: NavigationMenuDto[];
  onReorder: (reorderedMenus: NavigationMenuDto[]) => void;
  onEdit: (menu: NavigationMenuDto) => void;
  onDelete: (menu: NavigationMenuDto) => void;
  onCreate: () => void;
}

interface SortableMenuItemProps {
  menu: NavigationMenuDto;
  onEdit: (menu: NavigationMenuDto) => void;
  onDelete: (menu: NavigationMenuDto) => void;
}

const SortableMenuItem: React.FC<SortableMenuItemProps> = ({ menu, onEdit, onDelete }) => {
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
    <div ref={setNodeRef} style={style} className="menu-item">
      <div className="menu-item-drag" {...attributes} {...listeners}>
        <Icon icon={MdDragHandle} size={20} color="var(--color-gray-500)" />
      </div>

      <div className="menu-item-content">
        <div className="menu-item-info">
          <span className="menu-item-label">{menu.label}</span>
          <span className="menu-item-url">{menu.url}</span>
        </div>
        <span className="menu-item-position">#{menu.position}</span>
      </div>

      <div className="menu-item-actions">
        <Button
          variant="secondary"
          size="small"
          icon={MdEdit}
          onClick={() => onEdit(menu)}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="small"
          icon={MdDelete}
          onClick={() => onDelete(menu)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export const MenuBuilder: React.FC<MenuBuilderProps> = ({
  menus,
  onReorder,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = menus.findIndex((m) => m.id === active.id);
      const newIndex = menus.findIndex((m) => m.id === over.id);

      const reordered = arrayMove(menus, oldIndex, newIndex);

      const updated = reordered.map((menu, index) => ({
        ...menu,
        position: index + 1,
      }));

      onReorder(updated);
    }
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
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={menus.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="menu-items-list">
              {menus.map((menu) => (
                <SortableMenuItem
                  key={menu.id}
                  menu={menu}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
