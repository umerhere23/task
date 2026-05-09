'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useApiClient } from '@/hooks/useAuth';
import { useGlobalToast } from '@/hooks/useGlobalToast';
import { LoadingSpinner } from '@/components/ui/UI';
import styles from './EditCustomerModal.module.css';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  assignedToId: string | null;
  assignedToName?: string | null;
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
  const { addToast } = useGlobalToast();
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      addToast('success', 'Customer updated successfully');
      onUpdate();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update customer';
      setError(message);
      addToast('error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignUser = async () => {
    if (!customer || !selectedUserId) return;

    setAssigningUser(true);
    setError(null);

    try {
      const assignedUser = users.find(u => u.id === selectedUserId);
      await api.assignCustomer(customer.id, selectedUserId);
      addToast('success', `Customer assigned to ${assignedUser?.name || 'user'}`);
      onUpdate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to assign customer';
      setError(message);
      addToast('error', message);
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
      addToast('success', 'Note added successfully');
      setNewNote('');
      await fetchNotes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add note';
      setError(message);
      addToast('error', message);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setError(null);
    try {
      await api.deleteNote(noteId);
      addToast('success', 'Note deleted successfully');
      await fetchNotes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete note';
      setError(message);
      addToast('error', message);
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
      addToast('success', 'Note updated successfully');
      setEditingNoteId(null);
      setEditingNoteContent('');
      await fetchNotes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update note';
      setError(message);
      addToast('error', message);
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

        <div className={styles.body}>
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

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Assign to</h3>
              {loadingUsers && <span className={styles.helper}>Loading users...</span>}
            </div>
            <div className={styles.row}>
              <label htmlFor="customer-assignee" className={styles.srOnly}>Assign to user</label>
              <select
                id="customer-assignee"
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                disabled={loadingUsers || assigningUser}
                title="Assign customer to user"
                className={styles.select}
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
                className={styles.assignButton}
              >
                {assigningUser ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Notes</h3>
            </div>

            <div className={styles.noteComposer}>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                disabled={addingNote}
                className={styles.noteInput}
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={!newNote.trim() || addingNote}
                className={styles.noteAddButton}
              >
                {addingNote ? 'Adding...' : 'Add'}
              </button>
            </div>

            {loadingNotes ? (
              <div className={styles.centeredLoading}>
                <LoadingSpinner />
              </div>
            ) : notes.length === 0 ? (
              <div className={styles.emptyNotes}>No notes yet</div>
            ) : (
              <div className={styles.notesList}>
                {notes.map((note) => (
                  <div key={note.id} className={styles.noteCard}>
                    {editingNoteId === note.id ? (
                      <div className={styles.noteEditor}>
                        <textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          disabled={updatingNote}
                          placeholder="Update note text"
                          className={styles.noteTextarea}
                        />
                        <div className={styles.noteActions}>
                          <button
                            type="button"
                            onClick={handleEditNoteCancel}
                            disabled={updatingNote}
                            className={styles.cancelSmallButton}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleEditNoteSave}
                            disabled={!editingNoteContent.trim() || updatingNote}
                            className={styles.saveSmallButton}
                          >
                            {updatingNote ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.noteRow}>
                        <div className={styles.noteBody}>
                          <p className={styles.noteText}>{note.content}</p>
                          <div className={styles.noteMeta}>
                            {note.createdByName} • {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={styles.noteActions}>
                          <button
                            type="button"
                            onClick={() => handleEditNoteStart(note)}
                            className={styles.noteActionButton}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className={styles.noteDeleteButton}
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

          <div className={styles.modalActionsFooter}>
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
