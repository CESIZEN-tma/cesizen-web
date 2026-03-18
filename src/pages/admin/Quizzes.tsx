import React, { useState } from 'react';
import { useQuizzes } from '../../services/admin-service/hooks/useQuizzes';
import { QuizEditor } from '../../services/admin-service/components/QuizEditor';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { Modal } from '../../shared/components/Modal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { MdQuiz, MdEdit, MdDelete, MdAdd, MdVisibility } from 'react-icons/md';
import type { QuizzDto, CreateQuizzDto } from '../../services/admin-service/api/adminTypes';

const Quizzes: React.FC = () => {
  const { quizzes, loading, create, delete: deleteQuiz, fetchById } = useQuizzes();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizzDto | null>(null);
  const [quizDetails, setQuizDetails] = useState<QuizzDto | null>(null);

  const handleCreate = () => {
    setSelectedQuiz(null);
    setIsCreateModalOpen(true);
  };

  const handleView = async (quiz: QuizzDto) => {
    const details = await fetchById(quiz.id);
    if (details) {
      setQuizDetails(details);
      setIsViewModalOpen(true);
    }
  };

  const handleDelete = (quiz: QuizzDto) => {
    setSelectedQuiz(quiz);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (quizData: CreateQuizzDto) => {
    try {
      await create(quizData);
      setIsCreateModalOpen(false);
    } catch (err) {
      // Error handled by hook
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    try {
      await deleteQuiz(selectedQuiz.id);
      setIsDeleteDialogOpen(false);
    } catch (err) {
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
      key: 'questions',
      render: (value: any) => {
        const count = Array.isArray(value) ? value.length : 0;
        return <Badge variant="default">{count} questions</Badge>;
      },
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
        <Button variant="primary" icon={MdAdd} onClick={handleCreate}>
          Create Quiz
        </Button>
      </div>

      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--color-gray-100)', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>
          <strong>Note:</strong> Quizzes can only be fully created or deleted. To modify questions or options, you'll need to delete and recreate the quiz.
        </p>
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
              icon={MdVisibility}
              onClick={() => handleView(quiz)}
            >
              View Details
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
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Quiz"
        size="large"
      >
        <QuizEditor
          onSave={handleSave}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={quizDetails?.nom || 'Quiz Details'}
        size="large"
      >
        {quizDetails && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p><strong>Name:</strong> {quizDetails.nom}</p>
              <p>
                <strong>Status:</strong>{' '}
                <Badge variant={quizDetails.active ? 'success' : 'default'}>
                  {quizDetails.active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>

            <div>
              <h3 style={{ marginBottom: '16px' }}>Questions ({quizDetails.questions?.length || 0})</h3>
              {!quizDetails.questions || quizDetails.questions.length === 0 ? (
                <p style={{ color: 'var(--color-gray-600)' }}>No questions in this quiz.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {quizDetails.questions.map((question, idx) => (
                    <div
                      key={question.id}
                      style={{
                        padding: '16px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-background)',
                      }}
                    >
                      <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                        {idx + 1}. {question.text}
                      </p>

                      {question.responsesOptions && question.responsesOptions.length > 0 && (
                        <div style={{ marginTop: '12px', paddingLeft: '16px' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>
                            Response Options:
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {question.responsesOptions.map((option, oidx) => (
                              <div
                                key={option.id}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: 'var(--color-gray-50)',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem',
                                }}
                              >
                                <span style={{ fontWeight: 500 }}>{oidx + 1}. {option.label}</span>
                                <span style={{ color: 'var(--color-gray-600)', marginLeft: '8px' }}>
                                  ({option.operation} {option.value} to {option.targetedField})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        )}
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
