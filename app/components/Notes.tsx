'use client';

import { Edit, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Textarea } from './ui/textarea';

export const Notes = () => {
  const { notes, loading, error, createNote, editNote, removeNote } =
    useNotes();
  const { user } = useAuth();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [adding, setAdding] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editingNoteId && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      const textLength = textarea.value.length;
      textarea.setSelectionRange(textLength, textLength);
    }
  }, [editingNoteId]);

  const handleAddNote = async () => {
    setAdding(true);
    const noteId = await createNote('');
    if (noteId) {
      setEditingNoteId(noteId);
      setEditContent('');
    }
    setAdding(false);
  };

  const handleEditNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    await editNote(noteId, editContent.trim());
    setEditingNoteId(null);
    setEditContent('');
  };

  const handleCancelEdit = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note && !note.content) {
      removeNote(noteId);
    }
    setEditingNoteId(null);
    setEditContent('');
  };

  const handleDeleteNote = async (noteId: string) => {
    await removeNote(noteId);
    if (editingNoteId === noteId) handleCancelEdit(noteId);
  };

  if (!user && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Please sign in to view your notes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 m-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Notes</h2>
        <Button
          className="flex items-center gap-2"
          onClick={handleAddNote}
          disabled={adding}
        >
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-[200px]" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">
              No notes yet. Create your first note!
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">
                    {note.createdAt.toLocaleDateString()} at{' '}
                    {note.createdAt.toLocaleTimeString()}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditContent(note.content);
                      }}
                      disabled={editingNoteId === note.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingNoteId === note.id ||
                (!note.content && editingNoteId === null) ? (
                  <div className="space-y-2">
                    <Textarea
                      ref={editingNoteId === note.id ? textareaRef : undefined}
                      placeholder="Enter your note content..."
                      value={editContent}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setEditContent(e.target.value)
                      }
                      rows={4}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleCancelEdit(note.id)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleEditNote(note.id)}
                        disabled={!editContent.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    {note.updatedAt > note.createdAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Edited: {note.updatedAt.toLocaleDateString()} at{' '}
                        {note.updatedAt.toLocaleTimeString()}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
