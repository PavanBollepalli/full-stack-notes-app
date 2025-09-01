import { useState } from 'react'
import './App.css'
import Auth from './components/Auth';
import Notes from './components/Notes';

interface Note {
  id: string;
  content: string;
 }

function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);

  const handleAuthSuccess = (user: any, token: string) => {
    setUser(user);
    setToken(token);
    // TODO: Fetch notes from backend
    setNotes([]);
  };

  const handleCreateNote = (content: string) => {
    // TODO: Call backend to create note
    const newNote = { id: Date.now().toString(), content };
    setNotes([newNote, ...notes]);
  };

  const handleDeleteNote = (id: string) => {
    // TODO: Call backend to delete note
    setNotes(notes.filter(n => n.id !== id));
  };

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-10 h-10" />
          <span className="text-xl font-bold text-gray-800">Notes App</span>
        </div>
        <div className="user-info text-gray-700 font-medium">
          Welcome, {user.email || user.name}
          {/* Add logout button if needed */}
        </div>
      </header>
      <main>
        <Notes notes={notes} onCreate={handleCreateNote} onDelete={handleDeleteNote} />
      </main>
    </div>
  );
}

export default App
