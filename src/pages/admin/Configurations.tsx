import React, { useState } from 'react';
import { useConfigurations } from '../../services/admin-service/hooks/useConfigurations';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { Modal } from '../../shared/components/Modal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import { Rating } from '../../shared/components/Rating';
import { Badge } from '../../shared/components/Badge';
import { MdAdd, MdEdit, MdDelete, MdSettings } from 'react-icons/md';
import type { ConfigurationDto, CreateConfigurationDto } from '../../services/admin-service/api/adminTypes';

const Configurations: React.FC = () => {
  const { configurations, loading, create, update, delete: deleteConfig } = useConfigurations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ConfigurationDto | null>(null);
  const [formData, setFormData] = useState<CreateConfigurationDto>({
    name: '',
    inhalation: 4,
    retention1: 0,
    exhalation: 4,
    retention2: 0,
    durationMinutes: 5,
    difficulty: 1,
    objective: '',
    guidanceType: 'visual',
  });
  const [formLoading, setFormLoading] = useState(false);

  const guidanceTypeOptions = [
    { value: 'visual', label: 'Visual' },
    { value: 'audio', label: 'Audio' },
    { value: 'haptic', label: 'Haptic' },
    { value: 'combined', label: 'Combined' },
  ];

  const handleOpenCreate = () => {
    setSelectedConfig(null);
    setFormData({
      name: '',
      inhalation: 4,
      retention1: 0,
      exhalation: 4,
      retention2: 0,
      durationMinutes: 5,
      difficulty: 1,
      objective: '',
      guidanceType: 'visual',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (config: ConfigurationDto) => {
    setSelectedConfig(config);
    setFormData({
      name: config.name,
      inhalation: config.inhalation,
      retention1: config.retention1,
      exhalation: config.exhalation,
      retention2: config.retention2,
      durationMinutes: config.durationMinutes,
      difficulty: config.difficulty,
      objective: config.objective,
      guidanceType: config.guidanceType,
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (config: ConfigurationDto) => {
    setSelectedConfig(config);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (selectedConfig) {
        await update(selectedConfig.id, formData);
      } else {
        await create(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error already handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedConfig) return;
    try {
      await deleteConfig(selectedConfig.id);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      // Error already handled by hook
    }
  };

  const handleChange = (field: keyof CreateConfigurationDto) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const columns: Column<ConfigurationDto>[] = [
    { label: 'Name', key: 'name' },
    {
      label: 'Pattern',
      key: 'inhalation',
      render: (_: any, row: ConfigurationDto) =>
        `${row.inhalation}s - ${row.retention1}s - ${row.exhalation}s - ${row.retention2}s`,
    },
    { label: 'Duration (min)', key: 'durationMinutes' },
    {
      label: 'Difficulty',
      key: 'difficulty',
      render: (value: number) => <Rating value={value} readonly size={16} />,
    },
    {
      label: 'Guidance',
      key: 'guidanceType',
      render: (value: string) => <Badge variant="info">{value}</Badge>,
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Configurations</h1>
        <Button variant="primary" icon={MdAdd} onClick={handleOpenCreate}>
          Create Configuration
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={configurations}
        loading={loading}
        emptyMessage="No configurations found"
        emptyIcon={MdSettings}
        emptyAction={
          <Button variant="primary" onClick={handleOpenCreate}>
            Create First Configuration
          </Button>
        }
        getRowKey={(config) => config.id}
        actions={(config) => (
          <>
            <Button variant="outline" size="small" icon={MdEdit} onClick={() => handleOpenEdit(config)}>
              Edit
            </Button>
            <Button variant="danger" size="small" icon={MdDelete} onClick={() => handleOpenDelete(config)}>
              Delete
            </Button>
          </>
        )}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedConfig ? 'Edit Configuration' : 'Create Configuration'}
        size="large"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={formLoading}>
              {selectedConfig ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            type="text"
            label="Configuration Name"
            value={formData.name}
            onChange={handleChange('name')}
            disabled={formLoading}
            required
            fullWidth
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              type="number"
              label="Inhalation (seconds)"
              value={formData.inhalation}
              onChange={handleChange('inhalation')}
              disabled={formLoading}
              required
              fullWidth
              min={1}
            />

            <Input
              type="number"
              label="Retention 1 (seconds)"
              value={formData.retention1}
              onChange={handleChange('retention1')}
              disabled={formLoading}
              required
              fullWidth
              min={0}
            />

            <Input
              type="number"
              label="Exhalation (seconds)"
              value={formData.exhalation}
              onChange={handleChange('exhalation')}
              disabled={formLoading}
              required
              fullWidth
              min={1}
            />

            <Input
              type="number"
              label="Retention 2 (seconds)"
              value={formData.retention2}
              onChange={handleChange('retention2')}
              disabled={formLoading}
              required
              fullWidth
              min={0}
            />
          </div>

          <Input
            type="number"
            label="Duration (minutes)"
            value={formData.durationMinutes}
            onChange={handleChange('durationMinutes')}
            disabled={formLoading}
            required
            fullWidth
            min={1}
          />

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--color-text)' }}>
              Difficulty
            </label>
            <Rating
              value={formData.difficulty}
              onChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
              readonly={formLoading}
            />
          </div>

          <Select
            label="Guidance Type"
            value={formData.guidanceType}
            onChange={(value) => setFormData((prev) => ({ ...prev, guidanceType: value }))}
            options={guidanceTypeOptions}
            disabled={formLoading}
            required
            fullWidth
          />

          <div>
            <label
              htmlFor="objective"
              style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--color-text)' }}
            >
              Objective
            </label>
            <textarea
              id="objective"
              value={formData.objective}
              onChange={handleChange('objective')}
              disabled={formLoading}
              required
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'vertical',
              }}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Configuration"
        message={`Are you sure you want to delete "${selectedConfig?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default Configurations;
