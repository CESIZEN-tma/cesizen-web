import React, { useState } from 'react';
import { useNavigationMenus } from '../../services/admin-service/hooks/useNavigationMenus';
import { useInformationPages } from '../../services/admin-service/hooks/useInformationPages';
import { MenuBuilder } from '../../services/admin-service/components/MenuBuilder';
import { Modal } from '../../shared/components/Modal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import { Spinner } from '../../shared/components/Spinner';
import type { NavigationMenuDto, CreateNavigationMenuDto } from '../../services/admin-service/api/adminTypes';

const INFO_PAGE_SCHEME = 'cesizen://info-page/';

function pageIdFromUrl(url?: string | null): string {
  if (!url || !url.startsWith(INFO_PAGE_SCHEME)) return '';
  return url.slice(INFO_PAGE_SCHEME.length);
}

const emptyForm = (): CreateNavigationMenuDto => ({
  parentId: null,
  label: '',
  url: null,
  position: 1,
});

const NavigationMenus: React.FC = () => {
  const { menus, loading, create, update, delete: deleteMenu, updatePositions } = useNavigationMenus();
  const { pages } = useInformationPages();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<NavigationMenuDto | null>(null);
  const [formData, setFormData] = useState<CreateNavigationMenuDto>(emptyForm());
  const [selectedPageId, setSelectedPageId] = useState<string>('');

  const rootMenus = menus.filter((m) => !m.parentId);

  // Only Published+active pages available as link targets
  const publishedPages = pages.filter((p) => p.active !== false && p.status.toLowerCase() === 'published');

  const openModal = (form: CreateNavigationMenuDto, menu: NavigationMenuDto | null, pageId: string) => {
    setSelectedMenu(menu);
    setFormData(form);
    setSelectedPageId(pageId);
    setIsModalOpen(true);
  };

  const handleCreate = () =>
    openModal({ ...emptyForm(), position: menus.length + 1 }, null, '');

  const handleCreateChild = (parent: NavigationMenuDto) =>
    openModal(
      { parentId: parent.id, label: '', url: null, position: (parent.children?.length ?? 0) + 1 },
      null,
      ''
    );

  const handleEdit = (menu: NavigationMenuDto) =>
    openModal(
      { parentId: menu.parentId ?? null, label: menu.label, url: menu.url ?? null, position: menu.position },
      menu,
      pageIdFromUrl(menu.url)
    );

  const handleDelete = (menu: NavigationMenuDto) => {
    setSelectedMenu(menu);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedPageId ? `${INFO_PAGE_SCHEME}${selectedPageId}` : null;
      const payload: CreateNavigationMenuDto = {
        ...formData,
        url,
        parentId: formData.parentId || null,
      };
      if (selectedMenu) {
        await update(selectedMenu.id, payload);
      } else {
        await create(payload);
      }
      setIsModalOpen(false);
    } catch {
      // Error handled by hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMenu) return;
    try {
      await deleteMenu(selectedMenu.id);
      setIsDeleteDialogOpen(false);
    } catch {
      // Error handled by hook
    }
  };

  const handleReorderRoots = async (reorderedRoots: NavigationMenuDto[]) => {
    const positions = reorderedRoots.map((m, i) => ({ id: m.id, position: i + 1 }));
    try {
      await updatePositions(positions);
    } catch {
      // Error handled by hook
    }
  };

  const handleReorderChildren = async (parentId: string, reorderedChildren: NavigationMenuDto[]) => {
    const positions = reorderedChildren.map((m, i) => ({ id: m.id, position: i + 1 }));
    try {
      await updatePositions(positions);
    } catch {
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

  const isChild = !!formData.parentId;
  const parentLabel = formData.parentId
    ? rootMenus.find((m) => m.id === formData.parentId)?.label
    : null;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Navigation Menus</h1>
      </div>

      <p style={{ color: 'var(--color-gray-600)', marginBottom: '24px' }}>
        Drag and drop to reorder. Cliquer sur le chevron pour replier/déplier un menu.
      </p>

      <MenuBuilder
        menus={menus}
        onReorderRoots={handleReorderRoots}
        onReorderChildren={handleReorderChildren}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onCreateChild={handleCreateChild}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedMenu
            ? 'Modifier le menu'
            : parentLabel
            ? `Nouveau sous-menu dans "${parentLabel}"`
            : 'Créer un menu'
        }
      >
        <form onSubmit={handleSubmit}>
          {!isChild && (
            <Select
              label="Parent"
              value={formData.parentId ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value || null })
              }
            >
              <option value="">Aucun (menu racine)</option>
              {rootMenus.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </Select>
          )}

          <Input
            label="Label"
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
            placeholder="Ex : À propos"
          />

          <Select
            label="Page liée (optionnel)"
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value)}
          >
            <option value="">Aucune page</option>
            {publishedPages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button type="submit" variant="primary">
              {selectedMenu ? 'Modifier' : 'Créer'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Supprimer le menu"
        message={`Supprimer "${selectedMenu?.label}" ?${
          selectedMenu?.children?.length
            ? ` Ses ${selectedMenu.children.length} sous-menu(s) seront aussi supprimés.`
            : ''
        }`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default NavigationMenus;
