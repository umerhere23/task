'use client';

import { useState, useEffect } from 'react';
import { useApiClient } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/UI';
import styles from './EditCustomerModal.module.css';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  assignedCustomerCount?: number;
}

interface Note {
  id: string;
  content: string;
  createdByName: string;
  createdAt: string;
}

interface EditCustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditCustomerModal({ customer, isOpen, onClose, onUpdate }: EditCustomerModalProps) {
  const api = useApiClient();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [assigningUser, setAssigningUser] = useState(false);
  const [updatingNote, setUpdatingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
      });
      setSelectedUserId(customer.assignedToId);
      setError(null);
      fetchUsers();
      fetchNotes();
    }
  }, [customer, isOpen]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const userList = await api.listUsers();
      setUsers(userList);
    } catch (err: unknown) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchNotes = async () => {
    if (!customer) return;
    setLoadingNotes(true);
    try {
      const notesList = await api.getNotes(customer.id);
      setNotes(notesList);
    } catch (err: unknown) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.updateCustomer(customer.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
      });
      onUpdate();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignUser = async () => {
    if (!customer || !selectedUserId) return;

    setAssigningUser(true);
    setError(null);

    try {
      await api.assignCustomer(customer.id, selectedUserId);
      onUpdate();
      // Don't close modal, let user see confirmation and continue
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to assign customer');
    } finally {
      setAssigningUser(false);
    }
  };

  const handleAddNote = async () => {
    if (!customer || !newNote.trim()) return;

    setAddingNote(true);
    setError(null);

    try {
      await api.addNote(customer.id, { content: newNote });
      setNewNote('');
      await fetchNotes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setError(null);
    try {
      await api.deleteNote(noteId);
      await fetchNotes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const handleEditNoteStart = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  const handleEditNoteCancel = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const handleEditNoteSave = async () => {
    if (!editingNoteId || !editingNoteContent.trim()) return;

    setUpdatingNote(true);
    setError(null);

    try {
      await api.updateNote(editingNoteId, { content: editingNoteContent.trim() });
      setEditingNoteId(null);
      setEditingNoteContent('');
      await fetchNotes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
    } finally {
      setUpdatingNote(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Edit Customer - {customer.name}</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>

        <div style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                disabled={submitting}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                disabled={submitting}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                disabled={submitting}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Customer'}
              </button>
            </div>
          </form>

          {/* Assignment Section */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>Assign To</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                disabled={loadingUsers || assigningUser}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.assignedCustomerCount || 0}/5)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssignUser}
                disabled={!selectedUserId || assigningUser || loadingUsers}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: (!selectedUserId || assigningUser) ? 0.5 : 1,
                }}
              >
                {assigningUser ? 'Assigning...' : 'Assign'}
              </button>
            </div>
            {loadingUsers && <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>Loading users...</div>}
          </div>

          {/* Notes Section */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>Notes</h3>

            {/* Add Note */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                disabled={addingNote}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                }}
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={!newNote.trim() || addingNote}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: (!newNote.trim() || addingNote) ? 0.5 : 1,
                }}
              >
                {addingNote ? 'Adding...' : 'Add'}
              </button>
            </div>

            {/* Notes List */}
            {loadingNotes ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <LoadingSpinner />
              </div>
            ) : notes.length === 0 ? (
              <div style={{ color: '#6b7280', fontSize: '0.875rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                No notes yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.375rem',
                      borderLeft: '3px solid #3b82f6',
                    }}
                  >
                    {editingNoteId === note.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          disabled={updatingNote}
                          style={{
                            padding: '0.5rem',
                            border: '1px solid #3b82f6',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            minHeight: '60px',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={handleEditNoteCancel}
                            disabled={updatingNote}
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: '#d1d5db',
                              color: '#111827',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleEditNoteSave}
                            disabled={!editingNoteContent.trim() || updatingNote}
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              opacity: (!editingNoteContent.trim() || updatingNote) ? 0.5 : 1,
                            }}
                          >
                            {updatingNote ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#111827' }}>
                            {note.content}
                          </p>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {note.createdByName} • {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleEditNoteStart(note)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#6366f1',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.modalActions} style={{ marginTop: '2rem' }}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={submitting || addingNote || assigningUser}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
