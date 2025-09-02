import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Note {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

class NotesAPI {
  private getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getNotes(token: string): Promise<Note[]> {
    const response = await axios.get(`${API_BASE_URL}/notes`, {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }

  async createNote(token: string, content: string): Promise<Note> {
    const response = await axios.post(
      `${API_BASE_URL}/notes`,
      { content },
      { headers: this.getAuthHeaders(token) }
    );
    return response.data;
  }

  async updateNote(token: string, noteId: string, content: string): Promise<Note> {
    const response = await axios.put(
      `${API_BASE_URL}/notes/${noteId}`,
      { content },
      { headers: this.getAuthHeaders(token) }
    );
    return response.data;
  }

  async deleteNote(token: string, noteId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/notes/${noteId}`, {
      headers: this.getAuthHeaders(token),
    });
  }
}

export const notesAPI = new NotesAPI();
