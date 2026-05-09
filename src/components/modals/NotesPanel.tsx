'use client';

import { useEffect, useState } from 'react';
import { useApiClient } from '@/hooks/useAuth';
import { useGlobalToast } from '@/hooks/useGlobalToast';
import { NoteDTO, CreateNoteDTO } from '@/types';
import { LoadingSpinner, ErrorAlert } from '@/components/ui/UI';
import styles from './NotesPanel.module.css';

interface NotesPanelProps {
  customerId: string;
  customerName: string;
  onRefresh?: () => void;
}

export function NotesPanel({ customerId, customerName, onRefresh }: NotesPanelProps) {
  const api = useApiClient();
  const { addToast } = useGlobalToast();
  const [notes, setNotes] = useState<NoteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [updatingNote, setUpdatingNote] = useState(false);

  useEffect(() => {
    void loadNotes();
  }, [customerId]);

  const loadNotes = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getNotes(customerId);
      setNotes(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Note content cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newNote: CreateNoteDTO = { content: content.trim() };
      await api.addNote(customerId, newNote);
      setContent('');
      await loadNotes();
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;

    try {
      setError(null);
      await api.deleteNote(noteId);
      addToast('success', 'Note deleted successfully');
      await loadNotes();
      onRefresh?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete note';
      setError(message);
      addToast('error', message);
    }
  };

  const handleEditNoteStart = (note: NoteDTO) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
    setExpandedNote(note.id);
  };

  const handleEditNoteCancel = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const handleEditNoteSave = async () => {
    if (!editingNoteId || !editingNoteContent.trim()) {
      setError('Note content cannot be empty');
      return;
    }

    setUpdatingNote(true);
    setError(null);

    try {
      await api.updateNote(editingNoteId, { content: editingNoteContent.trim() });
      addToast('success', 'Note updated successfully');
      setEditingNoteId(null);
      setEditingNoteContent('');
      await loadNotes();
      onRefresh?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update note';
      setError(message);
      addToast('error', message);
    } finally {
      setUpdatingNote(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>Notes for {customerName}</h3>
        </div>
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Notes</h3>
        <span className={styles.count}>{notes.length}</span>
      </div>

      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleAddNote} className={styles.addNoteForm}>
        <div className={styles.formGroup}>
          <label htmlFor="note-content">Add a new note</label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter note content... (e.g., 'Client requested pricing details.')"
            className={styles.textarea}
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className={styles.addButton}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner /> Adding...
            </>
          ) : (
            'Add Note'
          )}
        </button>
      </form>

      <div className={styles.notesList}>
        {notes.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No notes yet. Add one to get started!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`${styles.noteItem} ${expandedNote === note.id ? styles.expanded : ''}`}
            >
              <div
                className={styles.noteHeader}
                onClick={() => {
                  if (editingNoteId !== note.id) {
                    setExpandedNote(expandedNote === note.id ? null : note.id);
                  }
                }}
              >
                <div className={styles.noteInfo}>
                  <p className={styles.noteAuthor}>{note.createdByName}</p>
                  <p className={styles.noteDate}>
                    {new Date(note.createdAt).toLocaleDateString()} at{' '}
                    {new Date(note.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNoteStart(note);
                    }}
                    title="Edit note"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeleteNote(note.id);
                    }}
                    title="Delete note"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {editingNoteId === note.id ? (
                <div className={styles.noteEditContainer}>
                  <textarea
                    value={editingNoteContent}
                    onChange={(e) => setEditingNoteContent(e.target.value)}
                    disabled={updatingNote}
                    className={styles.editTextarea}
                    rows={4}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleEditNoteCancel}
                      disabled={updatingNote}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleEditNoteSave}
                      disabled={!editingNoteContent.trim() || updatingNote}
                      className={styles.saveButton}
                    >
                      {updatingNote ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : expandedNote === note.id ? (
                <div className={styles.noteContent}>
                  <p>{note.content}</p>
                </div>
              ) : (
                <div className={styles.notePreview}>
                  <p>{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
