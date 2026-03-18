import React, { useState } from 'react';
import { useNavigationMenus } from '../../services/admin-service/hooks/useNavigationMenus';
import { MenuBuilder } from '../../services/admin-service/components/MenuBuilder';
import { Modal } from '../../shared/components/Modal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Spinner } from '../../shared/components/Spinner';
import type { NavigationMenuDto, CreateNavigationMenuDto } from '../../services/admin-service/api/adminTypes';

const NavigationMenus: React.FC = () => {
  const { menus, loading, create, update, delete: deleteMenu, updatePositions } = useNavigationMenus();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<NavigationMenuDto | null>(null);
  const [formData, setFormData] = useState<CreateNavigationMenuDto>({
    label: '',
    url: '',
    position: 1,
  });

  const handleCreate = () => {
    setSelectedMenu(null);
    setFormData({
      label: '',
      url: '',
      position: menus.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (menu: NavigationMenuDto) => {
    setSelectedMenu(menu);
    setFormData({
      label: menu.label,
      url: menu.url,
      position: menu.position,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (menu: NavigationMenuDto) => {
    setSelectedMenu(menu);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedMenu) {
        await update(selectedMenu.id, formData);
      } else {
        await create(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMenu) return;
    try {
      await deleteMenu(selectedMenu.id);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleReorder = async (reorderedMenus: NavigationMenuDto[]) => {
    try {
      await updatePositions(reorderedMenus);
    } catch (err) {
      // Error handled by hook
    }
  };

  if (loading && menus.length === 0) {
    return (
      <div className="admin-page">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Navigation Menus</h1>
      </div>

      <p style={{ color: 'var(--color-gray-600)', marginBottom: '24px' }}>
        Drag and drop menu items to reorder them. The order will be saved automatically.
      </p>

      <MenuBuilder
        menus={menus}
        onReorder={handleReorder}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMenu ? 'Edit Menu Item' : 'Create Menu Item'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Label"
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
            placeholder="Enter menu label (e.g., About Us)"
          />

          <Input
            label="URL"
            type="text"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
            placeholder="Enter URL (e.g., /about or https://example.com)"
          />

          <Input
            label="Position"
            type="number"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
            required
            min={1}
            placeholder="Enter position (1, 2, 3...)"
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button type="submit" variant="primary">
              {selectedMenu ? 'Update Menu' : 'Create Menu'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${selectedMenu?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default NavigationMenus;
