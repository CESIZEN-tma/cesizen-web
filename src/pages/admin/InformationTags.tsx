import React, { useState } from 'react';
import { useInformationTags } from '../../services/admin-service/hooks/useInformationTags';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { Modal } from '../../shared/components/Modal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { MdAdd, MdEdit, MdDelete, MdLabel } from 'react-icons/md';
import type { InformationTagDto } from '../../services/admin-service/api/adminTypes';

const InformationTags: React.FC = () => {
  const { tags, loading, create, update, delete: deleteTag } = useInformationTags();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<InformationTagDto | null>(null);
  const [tagName, setTagName] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const handleOpenCreate = () => {
    setSelectedTag(null);
    setTagName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tag: InformationTagDto) => {
    setSelectedTag(tag);
    setTagName(tag.name);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (tag: InformationTagDto) => {
    setSelectedTag(tag);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (selectedTag) {
        await update(selectedTag.id, { name: tagName });
      } else {
        await create({ name: tagName });
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error already handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTag) return;
    try {
      await deleteTag(selectedTag.id);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      // Error already handled by hook
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const columns: Column<InformationTagDto>[] = [
    { label: 'Name', key: 'name' },
    {
      label: 'Created',
      key: 'creationTime',
      render: (value: string) => formatDate(value),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Information Tags</h1>
        <Button variant="primary" icon={MdAdd} onClick={handleOpenCreate}>
          Create Tag
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={tags}
        loading={loading}
        emptyMessage="No tags found"
        emptyIcon={MdLabel}
        emptyAction={
          <Button variant="primary" onClick={handleOpenCreate}>
            Create First Tag
          </Button>
        }
        getRowKey={(tag) => tag.id}
        actions={(tag) => (
          <>
            <Button variant="outline" size="small" icon={MdEdit} onClick={() => handleOpenEdit(tag)}>
              Edit
            </Button>
            <Button variant="danger" size="small" icon={MdDelete} onClick={() => handleOpenDelete(tag)}>
              Delete
            </Button>
          </>
        )}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTag ? 'Edit Tag' : 'Create Tag'}
        size="small"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={formLoading}>
              {selectedTag ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            label="Tag Name"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            disabled={formLoading}
            required
            fullWidth
            placeholder="Enter tag name"
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Tag"
        message={`Are you sure you want to delete the tag "${selectedTag?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default InformationTags;
