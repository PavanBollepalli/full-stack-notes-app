import React, { useState } from 'react';

interface Note {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesProps {
  notes: Note[];
  onCreate: (content: string) => void;
  onDelete: (id: string) => void;
  token: string;
}

const Notes: React.FC<NotesProps> = ({ notes, onCreate, onDelete, token }) => {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        onDelete(id);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete note');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Note cannot be empty');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: note }),
      });
      const data = await response.json();
      if (response.ok) {
        onCreate(data.content);
        setNote('');
        setError('');
      } else {
        setError(data.error || 'Failed to create note');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8">
      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Write a note..."
          value={note}
          onChange={e => setNote(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition">Add</button>
      </form>
      {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
      <ul className="space-y-2">
        {notes.map(n => (
          <li key={n._id} className="flex items-center justify-between bg-white rounded shadow p-3">
            <span className="break-words flex-1 mr-4">{n.content}</span>
            <button onClick={() => handleDelete(n._id)} className="text-red-600 hover:underline text-sm">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
