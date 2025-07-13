import React, { useEffect, useState } from 'react';
import personalNoteService from '../../services/personalNoteService';

const PersonalNoteModal = ({ show, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingNote, setEditingNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) fetchNotes();
    // eslint-disable-next-line
  }, [show]);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await personalNoteService.getMyNotes();
      console.log('Personal notes response:', res);
      setNotes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error fetching personal notes:', err);
      setError('Failed to load notes: ' + (err.message || 'Unknown error'));
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await personalNoteService.create({ note: newNote });
      setNewNote('');
      fetchNotes();
    } catch (err) {
      setError('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id, note) => {
    setEditingId(id);
    setEditingNote(note);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingNote.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await personalNoteService.update(editingId, { note: editingNote });
      setEditingId(null);
      setEditingNote('');
      fetchNotes();
    } catch (err) {
      setError('Failed to update note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await personalNoteService.delete(id);
      fetchNotes();
    } catch {
      setError('Failed to delete note');
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Personal Notes</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add a personal note..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  disabled={submitting}
                  maxLength={500}
                  required
                />
                <button className="btn btn-info" type="submit" disabled={submitting || !newNote.trim()}>
                  {submitting ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
            <h6>Your Notes</h6>
            {loading ? (
              <div>Loading...</div>
            ) : notes.length === 0 ? (
              <div className="text-muted">No notes yet.</div>
            ) : (
              <ul className="list-group">
                {notes.map(note => (
                  <li key={note.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {editingId === note.id ? (
                      <form onSubmit={handleEditSubmit} className="w-100 d-flex align-items-center gap-2">
                        <input
                          type="text"
                          className="form-control"
                          value={editingNote}
                          onChange={e => setEditingNote(e.target.value)}
                          maxLength={500}
                          required
                        />
                        <button className="btn btn-success btn-sm" type="submit">Save</button>
                        <button className="btn btn-secondary btn-sm" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                      </form>
                    ) : (
                      <>
                        <div>{note.note}</div>
                        <div>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(note.id, note.note)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(note.id)}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalNoteModal; 