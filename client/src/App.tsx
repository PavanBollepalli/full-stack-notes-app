import { useState } from 'react'
import './App.css'
import Auth from './components/Auth';
import Notes from './components/Notes';

interface Note {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);

  const handleAuthSuccess = async (user: any, token: string) => {
    setUser(user);
    setToken(token);
    // Fetch notes from backend
    try {
      const response = await fetch('http://localhost:5000/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setNotes(data);
      } else {
        console.error('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Network error');
    }
  };

  const handleCreateNote = (note: any) => {
    setNotes([note, ...notes]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n._id !== id));
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setNotes([]);
  };

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-white shadow">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="text-lg sm:text-xl font-bold text-gray-800">Notes App</span>
        </div>
        <div className="user-info text-gray-700 font-medium flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <span className="text-sm sm:text-base">Welcome, {user.email || user.name}</span>
          <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm">Logout</button>
        </div>
      </header>
      <main>
        <Notes notes={notes} onCreate={handleCreateNote} onDelete={handleDeleteNote} token={token} />
      </main>
    </div>
  );
}

export default App
