import React, { useState } from 'react';

interface Note {
  id: string;
  content: string;
}

interface NotesProps {
  notes: Note[];
  onCreate: (content: string) => void;
  onDelete: (id: string) => void;
}

const Notes: React.FC<NotesProps> = ({ notes, onCreate, onDelete }) => {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Note cannot be empty');
      return;
    }
    onCreate(note);
    setNote('');
    setError('');
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
          <li key={n.id} className="flex items-center justify-between bg-white rounded shadow p-3">
            <span className="break-words flex-1 mr-4">{n.content}</span>
            <button onClick={() => onDelete(n.id)} className="text-red-600 hover:underline text-sm">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
