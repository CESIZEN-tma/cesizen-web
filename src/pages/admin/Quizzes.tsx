import React, { useState } from 'react';
import { useQuizzes } from '../../services/admin-service/hooks/useQuizzes';
import { QuizEditor } from '../../services/admin-service/components/QuizEditor';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { Modal } from '../../shared/components/Modal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { MdQuiz, MdEdit, MdDelete, MdAdd, MdToggleOn, MdToggleOff } from 'react-icons/md';
import type { QuizzDto, CreateQuizzDto } from '../../services/admin-service/api/adminTypes';

const Quizzes: React.FC = () => {
  const { quizzes, loading, create, updateFull, delete: deleteQuiz, setActive, fetchById } = useQuizzes();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizzDto | null>(null);
  const [editorInitialData, setEditorInitialData] = useState<CreateQuizzDto | undefined>(undefined);
  const [editorLoading, setEditorLoading] = useState(false);

  const handleCreate = () => {
    setSelectedQuiz(null);
    setEditorInitialData(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = async (quiz: QuizzDto) => {
    setEditorLoading(true);
    const details = await fetchById(quiz.id);
    if (details) {
      setSelectedQuiz(quiz);
      setEditorInitialData({
        nom: details.nom,
        active: details.active,
        questions: (details.questions ?? []).map((q) => ({
          text: q.text,
          position: q.position,
          options: (q.options ?? []).map((o) => ({
            label: o.label,
            position: o.position,
            targetedField: o.targetedField,
            operation: o.operation,
            value: o.value,
          })),
        })),
      });
      setIsEditorOpen(true);
    }
    setEditorLoading(false);
  };

  const handleDelete = (quiz: QuizzDto) => {
    setSelectedQuiz(quiz);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (quizData: CreateQuizzDto) => {
    if (selectedQuiz) {
      await updateFull(selectedQuiz.id, quizData);
    } else {
      await create(quizData);
    }
    setIsEditorOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    try {
      await deleteQuiz(selectedQuiz.id);
      setIsDeleteDialogOpen(false);
    } catch {
      // Error handled by hook
    }
  };

  const columns: Column<QuizzDto>[] = [
    {
      label: 'Name',
      key: 'nom',
      width: '40%',
    },
    {
      label: 'Questions',
      key: 'questionCount',
      render: (value: number) => (
        <Badge variant="default">{value ?? 0} questions</Badge>
      ),
    },
    {
      label: 'Status',
      key: 'active',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'default'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quizzes</h1>
        {!loading && quizzes.length > 0 && (
          <Button variant="primary" icon={MdAdd} onClick={handleCreate}>
            Create Quiz
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={quizzes}
        loading={loading}
        emptyMessage="No quizzes found"
        emptyIcon={MdQuiz}
        emptyAction={
          <Button variant="primary" icon={MdAdd} onClick={handleCreate}>
            Create First Quiz
          </Button>
        }
        getRowKey={(quiz) => quiz.id}
        actions={(quiz) => (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              size="small"
              icon={quiz.active ? MdToggleOn : MdToggleOff}
              onClick={() => setActive(quiz.id, !quiz.active)}
            >
              {quiz.active ? 'Désactiver' : 'Activer'}
            </Button>
            <Button
              variant="secondary"
              size="small"
              icon={MdEdit}
              loading={editorLoading && selectedQuiz?.id === quiz.id}
              onClick={() => handleEdit(quiz)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="small"
              icon={MdDelete}
              onClick={() => handleDelete(quiz)}
            >
              Delete
            </Button>
          </div>
        )}
      />

      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={selectedQuiz ? `Edit Quiz — ${selectedQuiz.nom}` : 'Create Quiz'}
        size="large"
      >
        <QuizEditor
          key={selectedQuiz?.id ?? 'new'}
          initialData={editorInitialData}
          onSave={handleSave}
          onCancel={() => setIsEditorOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${selectedQuiz?.nom}"? This will also delete all questions and response options. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default Quizzes;
