import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { notesAPI } from '../utils/api';
import type { Note } from '../utils/api';

const NotesPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formContent, setFormContent] = useState('');

  useEffect(() => {
    if (token) {
      loadNotes();
    }
  }, [token]);

  const loadNotes = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const fetchedNotes = await notesAPI.getNotes(token);
      setNotes(fetchedNotes);
    } catch (err: any) {
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formContent.trim()) return;

    try {
      const newNote = await notesAPI.createNote(token, formContent);
      setNotes([newNote, ...notes]);
      setFormContent('');
      setShowCreateForm(false);
    } catch (err: any) {
      setError('Failed to create note');
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingNote || !formContent.trim()) return;

    try {
      const updatedNote = await notesAPI.updateNote(token, editingNote._id, formContent);
      setNotes(notes.map(note => note._id === editingNote._id ? updatedNote : note));
      setEditingNote(null);
      setFormContent('');
    } catch (err: any) {
      setError('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!token) return;

    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesAPI.deleteNote(token, noteId);
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (err: any) {
      setError('Failed to delete note');
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setFormContent(note.content);
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setFormContent('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/icon.png" alt="Notes App" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right ml-4 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Create Note Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>New Note</span>
          </button>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingNote) && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h3>
            <form onSubmit={editingNote ? handleUpdateNote : handleCreateNote}>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                rows={4}
                placeholder="Write your note here..."
                required
              />
              <div className="flex space-x-3 mt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingNote ? 'Update' : 'Create'} Note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    cancelEdit();
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <img src="/container.png" alt="Empty notes" className="w-32 h-32 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No notes yet</h3>
            <p className="text-gray-500">Create your first note to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => startEdit(note)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit note"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleDateString()} at{' '}
                  {new Date(note.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotesPage;
