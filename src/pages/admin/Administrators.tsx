import React, { useState } from 'react';
import { useAdministrators } from '../../services/admin-service/hooks/useAdministrators';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { Modal } from '../../shared/components/Modal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Badge } from '../../shared/components/Badge';
import { MdAdd, MdEdit, MdDelete, MdPerson } from 'react-icons/md';
import type { GetAdministratorDto, CreateAdministratorDto } from '../../services/admin-service/api/adminTypes';

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const Administrators: React.FC = () => {
  const { administrators, loading, create, update, delete: deleteAdmin } = useAdministrators();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<GetAdministratorDto | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  const handleOpenCreate = () => {
    setSelectedAdmin(null);
    setFormData({ email: '', password: '', firstName: '', lastName: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (admin: GetAdministratorDto) => {
    setSelectedAdmin(admin);
    setFormData({
      email: admin.email,
      password: '',
      firstName: admin.firstName,
      lastName: admin.lastName,
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (admin: GetAdministratorDto) => {
    setSelectedAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (selectedAdmin) {
        const updateData: Partial<CreateAdministratorDto> = {
          firstName: formData.firstName,
          lastName: formData.lastName,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await update(selectedAdmin.id, updateData);
      } else {
        await create(formData as CreateAdministratorDto);
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error already handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;
    try {
      await deleteAdmin(selectedAdmin.id);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      // Error already handled by hook
    }
  };

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const columns: Column<GetAdministratorDto>[] = [
    { label: 'Email', key: 'email' },
    { label: 'First Name', key: 'firstName' },
    { label: 'Last Name', key: 'lastName' },
    {
      label: 'Status',
      key: 'accountActivated',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'warning'}>
          {value ? 'Active' : 'Pending'}
        </Badge>
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
        <h1>Administrators</h1>
        {!loading && administrators.length > 0 && (
          <Button variant="primary" icon={MdAdd} onClick={handleOpenCreate}>
            Create Administrator
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={administrators}
        loading={loading}
        emptyMessage="No administrators found"
        emptyIcon={MdPerson}
        emptyAction={
          <Button variant="primary" onClick={handleOpenCreate}>
            Create First Administrator
          </Button>
        }
        getRowKey={(admin) => admin.id}
        actions={(admin) => (
          <>
            <Button variant="outline" size="small" icon={MdEdit} onClick={() => handleOpenEdit(admin)}>
              Edit
            </Button>
            <Button variant="danger" size="small" icon={MdDelete} onClick={() => handleOpenDelete(admin)}>
              Delete
            </Button>
          </>
        )}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAdmin ? 'Edit Administrator' : 'Create Administrator'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={formLoading}>
              {selectedAdmin ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange('email')}
            disabled={formLoading || !!selectedAdmin}
            required
            fullWidth
          />

          <Input
            type="password"
            label={selectedAdmin ? 'Password (leave empty to keep current)' : 'Password'}
            value={formData.password}
            onChange={handleChange('password')}
            disabled={formLoading}
            required={!selectedAdmin}
            fullWidth
          />

          <Input
            type="text"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            disabled={formLoading}
            required
            fullWidth
          />

          <Input
            type="text"
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange('lastName')}
            disabled={formLoading}
            required
            fullWidth
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Administrator"
        message={`Are you sure you want to delete ${selectedAdmin?.email}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default Administrators;
