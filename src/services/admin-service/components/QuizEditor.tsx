import React, { useState, useEffect } from 'react';
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
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import { MdDragHandle, MdDelete, MdAdd, MdExpandMore, MdExpandLess } from 'react-icons/md';
import type {
  CreateQuizzDto,
  CreateQuestionForQuizDto,
  CreateResponseOptionForQuestionDto,
} from '../api/adminTypes';
import './css/quiz-editor.css';
import Icon from '../../../shared/components/Icon';

interface QuizEditorProps {
  initialData?: CreateQuizzDto;
  onSave: (quiz: CreateQuizzDto) => Promise<void>;
  onCancel: () => void;
}

interface TempQuestion extends Omit<CreateQuestionForQuizDto, 'options'> {
  tempId: string;
  expanded: boolean;
  options?: TempOption[];
}

interface TempOption extends CreateResponseOptionForQuestionDto {
  tempId: string;
}

interface SortableQuestionProps {
  question: TempQuestion;
  onUpdate: (tempId: string, updates: Partial<TempQuestion>) => void;
  onDelete: (tempId: string) => void;
  onAddOption: (questionTempId: string) => void;
  onUpdateOption: (questionTempId: string, optionTempId: string, updates: Partial<TempOption>) => void;
  onDeleteOption: (questionTempId: string, optionTempId: string) => void;
  onReorderOptions: (questionTempId: string, reordered: TempOption[]) => void;
}

const SortableQuestion: React.FC<SortableQuestionProps> = ({
  question,
  onUpdate,
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onReorderOptions,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOptionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!question.options || !over || active.id === over.id) return;

    const oldIndex = question.options.findIndex((o) => o.tempId === active.id);
    const newIndex = question.options.findIndex((o) => o.tempId === over.id);

    const reordered = arrayMove(question.options, oldIndex, newIndex);
    const updated = reordered.map((opt, idx) => ({ ...opt, position: idx }));

    onReorderOptions(question.tempId, updated);
  };

  return (
    <div ref={setNodeRef} style={style} className="quiz-question">
      <div className="quiz-question-header">
        <div className="quiz-question-drag" {...attributes} {...listeners}>
          <Icon icon={MdDragHandle} size={20} color="var(--color-gray-500)" />
        </div>

        <Input
          type="text"
          value={question.text}
          onChange={(e) => onUpdate(question.tempId, { text: e.target.value })}
          placeholder="Enter question text"
          required
        />

        <Button
          variant="secondary"
          size="small"
          icon={question.expanded ? MdExpandLess : MdExpandMore}
          onClick={() => onUpdate(question.tempId, { expanded: !question.expanded })}
        >
          {question.expanded ? 'Collapse' : 'Expand'}
        </Button>

        <Button
          variant="danger"
          size="small"
          icon={MdDelete}
          onClick={() => onDelete(question.tempId)}
        >
          Delete
        </Button>
      </div>

      {question.expanded && (
        <div className="quiz-question-options">
          <div className="quiz-question-options-header">
            <h4>Response Options</h4>
            <Button
              variant="secondary"
              size="small"
              icon={MdAdd}
              onClick={() => onAddOption(question.tempId)}
            >
              Add Option
            </Button>
          </div>

          {!question.options || question.options.length === 0 ? (
            <p className="quiz-empty-message">No response options yet. Click "Add Option" to create one.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleOptionDragEnd}
            >
              <SortableContext
                items={question.options.map((o) => o.tempId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="quiz-options-list">
                  {question.options.map((option) => (
                    <SortableOption
                      key={option.tempId}
                      option={option}
                      onUpdate={(updates) => onUpdateOption(question.tempId, option.tempId, updates)}
                      onDelete={() => onDeleteOption(question.tempId, option.tempId)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
};

interface SortableOptionProps {
  option: TempOption;
  onUpdate: (updates: Partial<TempOption>) => void;
  onDelete: () => void;
}

const SortableOption: React.FC<SortableOptionProps> = ({ option, onUpdate, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="quiz-option">
      <div className="quiz-option-drag" {...attributes} {...listeners}>
        <Icon icon={MdDragHandle} size={16} color="var(--color-gray-500)" />
      </div>

      <div className="quiz-option-fields">
        <Input
          type="text"
          value={option.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Option label"
          required
        />

        <Select
          value={option.targetedField}
          onChange={(e) => onUpdate({ targetedField: e.target.value })}
          required
        >
          <option value="">Select field</option>
          <option value="inhalation">Inhalation</option>
          <option value="retention1">Retention 1</option>
          <option value="exhalation">Exhalation</option>
          <option value="retention2">Retention 2</option>
          <option value="durationMinutes">Duration (minutes)</option>
          <option value="difficulty">Difficulty</option>
          <option value="objective">Objective</option>
          <option value="guidanceType">Guidance type</option>
        </Select>

        <Select
          value={option.operation}
          onChange={(e) => onUpdate({ operation: e.target.value })}
          required
        >
          <option value="">Select operation</option>
          <option value="SET">SET</option>
          <option value="ADD">ADD</option>
          <option value="MULTIPLY">MULTIPLY</option>
        </Select>

        <Input
          type="text"
          value={option.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Value"
          required
        />
      </div>

      <Button
        variant="danger"
        size="small"
        icon={MdDelete}
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  );
};

export const QuizEditor: React.FC<QuizEditorProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [nom, setNom] = useState(initialData?.nom || '');
  const [active, setActive] = useState(initialData?.active ?? true);
  const [questions, setQuestions] = useState<TempQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData?.questions) {
      const tempQuestions: TempQuestion[] = initialData.questions.map((q, idx) => ({
        ...q,
        tempId: `q-${idx}`,
        expanded: false,
        options: q.options?.map((o, oidx) => ({
          ...o,
          tempId: `q-${idx}-o-${oidx}`,
        })),
      }));
      setQuestions(tempQuestions);
    }
  }, [initialData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddQuestion = () => {
    const newQuestion: TempQuestion = {
      text: '',
      position: questions.length,
      options: [],
      tempId: `q-${Date.now()}`,
      expanded: true,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (tempId: string, updates: Partial<TempQuestion>) => {
    setQuestions(questions.map((q) =>
      q.tempId === tempId ? { ...q, ...updates } : q
    ));
  };

  const handleDeleteQuestion = (tempId: string) => {
    const filtered = questions.filter((q) => q.tempId !== tempId);
    const reindexed = filtered.map((q, idx) => ({ ...q, position: idx }));
    setQuestions(reindexed);
  };

  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.tempId === active.id);
    const newIndex = questions.findIndex((q) => q.tempId === over.id);

    const reordered = arrayMove(questions, oldIndex, newIndex);
    const updated = reordered.map((q, idx) => ({ ...q, position: idx }));

    setQuestions(updated);
  };

  const handleAddOption = (questionTempId: string) => {
    setQuestions(questions.map((q) => {
      if (q.tempId === questionTempId) {
        const newOption: TempOption = {
          label: '',
          position: q.options?.length || 0,
          targetedField: '',
          operation: '',
          value: '',
          tempId: `${questionTempId}-o-${Date.now()}`,
        };
        return {
          ...q,
          options: [...(q.options || []), newOption],
        };
      }
      return q;
    }));
  };

  const handleUpdateOption = (questionTempId: string, optionTempId: string, updates: Partial<TempOption>) => {
    setQuestions(questions.map((q) => {
      if (q.tempId === questionTempId && q.options) {
        return {
          ...q,
          options: q.options.map((o) =>
            o.tempId === optionTempId ? { ...o, ...updates } : o
          ),
        };
      }
      return q;
    }));
  };

  const handleDeleteOption = (questionTempId: string, optionTempId: string) => {
    setQuestions(questions.map((q) => {
      if (q.tempId === questionTempId && q.options) {
        const filtered = q.options.filter((o) => o.tempId !== optionTempId);
        const reindexed = filtered.map((o, idx) => ({ ...o, position: idx }));
        return { ...q, options: reindexed };
      }
      return q;
    }));
  };

  const handleReorderOptions = (questionTempId: string, reordered: TempOption[]) => {
    setQuestions(questions.map((q) =>
      q.tempId === questionTempId ? { ...q, options: reordered } : q
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const quizDto: CreateQuizzDto = {
        nom,
        active,
        questions: questions.map((q) => ({
          text: q.text,
          position: q.position,
          options: q.options?.map((o) => ({
            label: o.label,
            position: o.position,
            targetedField: o.targetedField,
            operation: o.operation,
            value: o.value,
          })),
        })),
      };

      await onSave(quizDto);
    } catch (err) {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="quiz-editor">
      <div className="quiz-editor-header">
        <Input
          label="Quiz Name"
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Enter quiz name"
          required
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          <input
            type="checkbox"
            id="quiz-active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <label htmlFor="quiz-active" style={{ margin: 0, cursor: 'pointer' }}>
            Active
          </label>
        </div>
      </div>

      <div className="quiz-editor-questions">
        <div className="quiz-editor-questions-header">
          <h3>Questions</h3>
          <Button
            type="button"
            variant="primary"
            icon={MdAdd}
            onClick={handleAddQuestion}
          >
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <p className="quiz-empty-message">No questions yet. Click "Add Question" to create one.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleQuestionDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.tempId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="quiz-questions-list">
                {questions.map((question) => (
                  <SortableQuestion
                    key={question.tempId}
                    question={question}
                    onUpdate={handleUpdateQuestion}
                    onDelete={handleDeleteQuestion}
                    onAddOption={handleAddOption}
                    onUpdateOption={handleUpdateOption}
                    onDeleteOption={handleDeleteOption}
                    onReorderOptions={handleReorderOptions}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="quiz-editor-actions">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving...' : initialData ? 'Update Quiz' : 'Create Quiz'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
