'use client';

import { useEffect, useState } from 'react';
import { useApiClient } from '@/hooks/useAuth';
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
  const [notes, setNotes] = useState<NoteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

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
      await loadNotes();
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
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
                onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
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

              {expandedNote === note.id && (
                <div className={styles.noteContent}>
                  <p>{note.content}</p>
                </div>
              )}

              {expandedNote !== note.id && (
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
