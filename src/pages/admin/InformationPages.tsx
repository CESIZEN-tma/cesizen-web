import React, { useState } from 'react';
import { useInformationPages } from '../../services/admin-service/hooks/useInformationPages';
import { useInformationTags } from '../../services/admin-service/hooks/useInformationTags';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { Modal } from '../../shared/components/Modal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import { Badge } from '../../shared/components/Badge';
import { RichTextEditor } from '../../services/admin-service/components/RichTextEditor';
import { MdArticle, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import type { InformationPageDto, CreateInformationPageDto } from '../../services/admin-service/api/adminTypes';

const emptyForm: CreateInformationPageDto = {
  title: '',
  description: '',
  content: '',
  contentType: 'html',
  status: 'draft',
  tagIds: [],
};

const InformationPages: React.FC = () => {
  const { pages, loading, create, update, delete: deletePage } = useInformationPages();
  const { tags } = useInformationTags();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<InformationPageDto | null>(null);
  const [formData, setFormData] = useState<CreateInformationPageDto>(emptyForm);

  const handleCreate = () => {
    setSelectedPage(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleEdit = (page: InformationPageDto) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      description: page.description,
      content: page.content,
      contentType: page.contentType,
      status: page.status,
      tagIds: page.tagIds ?? [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (page: InformationPageDto) => {
    setSelectedPage(page);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPage) {
        await update(selectedPage.id, formData);
      } else {
        await create(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPage) return;
    try {
      await deletePage(selectedPage.id);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getStatusVariant = (status: string): 'success' | 'warning' | 'default' => {
    if (status === 'published') return 'success';
    if (status === 'draft') return 'warning';
    return 'default';
  };

  const columns: Column<InformationPageDto>[] = [
    { label: 'Title', key: 'title', width: '25%' },
    {
      label: 'Description',
      key: 'description',
      render: (value: string) => (
        <span style={{ display: 'block', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </span>
      ),
    },
    {
      label: 'Tags',
      key: 'tagIds',
      render: (_: unknown, row: InformationPageDto) => {
        const pageTags = tags.filter((t) => row.tagIds?.includes(t.id));
        if (pageTags.length === 0) return <span style={{ color: 'var(--color-gray-400)' }}>—</span>;
        return (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {pageTags.map((t) => <Badge key={t.id} variant="default">{t.label}</Badge>)}
          </div>
        );
      },
    },
    {
      label: 'Status',
      key: 'status',
      render: (value: string) => (
        <Badge variant={getStatusVariant(value)}>{value.charAt(0).toUpperCase() + value.slice(1)}</Badge>
      ),
    },
    {
      label: 'Created',
      key: 'creationTime',
      render: (value: string) => formatDate(value),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Information Pages</h1>
        {!loading && pages.length > 0 && (
          <Button variant="primary" icon={MdAdd} onClick={handleCreate}>
            Create Page
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={pages}
        loading={loading}
        emptyMessage="No information pages found"
        emptyIcon={MdArticle}
        emptyAction={
          <Button variant="primary" icon={MdAdd} onClick={handleCreate}>
            Create First Page
          </Button>
        }
        getRowKey={(page) => page.id}
        actions={(page) => (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="small" icon={MdEdit} onClick={() => handleEdit(page)}>
              Edit
            </Button>
            <Button variant="danger" size="small" icon={MdDelete} onClick={() => handleDelete(page)}>
              Delete
            </Button>
          </div>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPage ? 'Edit Information Page' : 'Create Information Page'}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter page title"
          />

          <Input
            label="Description"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            placeholder="Enter page description"
          />

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
              Content
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Write your page content..."
            />
          </div>

          <Select
            label="Content Type"
            value={formData.contentType}
            onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
            required
          >
            <option value="html">HTML</option>
            <option value="raw">Plain Text</option>
          </Select>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="masked">Masked</option>
          </Select>

          {tags.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
                Tags
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {tags.map((tag) => {
                  const selected = formData.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: selected ? 'var(--color-primary)' : 'transparent',
                        color: selected ? '#fff' : 'var(--color-text)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button type="submit" variant="primary">
              {selectedPage ? 'Update Page' : 'Create Page'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Information Page"
        message={`Are you sure you want to delete "${selectedPage?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default InformationPages;
