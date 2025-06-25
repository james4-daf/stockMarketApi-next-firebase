import { useEffect, useState } from 'react';
import {
  Note,
  addNote,
  deleteNote,
  getNotesByUserId,
  updateNote,
} from '../firebase/firebase';
import { useAuth } from './useAuth';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotes = async () => {
    if (!user?.uid) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startTime = Date.now();
      const userNotes = await getNotesByUserId(user.uid);
      const elapsedTime = Date.now() - startTime;

      const minimumLoadingTime = 800; // 800ms
      if (elapsedTime < minimumLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minimumLoadingTime - elapsedTime),
        );
      }

      setNotes(userNotes);
    } catch (err) {
      setError('Failed to fetch notes');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (content: string) => {
    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const noteId = await addNote(content, user.uid);
      const newNote: Note = {
        id: noteId,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes((prev) => [newNote, ...prev]);
      return noteId;
    } catch (err) {
      setError('Failed to create note');
      console.error('Error creating note:', err);
    }
  };

  const editNote = async (noteId: string, content: string) => {
    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }
    try {
      setError(null);
      await updateNote(user.uid, noteId, content);
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, content, updatedAt: new Date() }
            : note,
        ),
      );
    } catch (err) {
      setError('Failed to update note');
      console.error('Error updating note:', err);
    }
  };

  const removeNote = async (noteId: string) => {
    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }
    try {
      setError(null);
      await deleteNote(user.uid, noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (err) {
      setError('Failed to delete note');
      console.error('Error deleting note:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user?.uid]);

  return {
    notes,
    loading,
    error,
    createNote,
    editNote,
    removeNote,
    refetch: fetchNotes,
  };
};
