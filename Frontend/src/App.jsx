import "./App.css";
import { useState, useEffect } from "react";
import {
    getNotes,
    createNote,
    updateNote,
    deleteNoteApi
} from "./api/noteApi.js";

function App() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const data = await getNotes();
            setNotes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addNote = async () => {
        if (!title.trim() || !content.trim()) return;

        try {
            const newNote = await createNote(title, content);
            setNotes([newNote, ...notes]);
            setTitle("");
            setContent("");
        } catch (err) {
            setError(err.message);
        }
    };

    const togglePin = async (note) => {
        try {
            const updated = await updateNote(note._id, {
                pinned: !note.pinned
            });

            setNotes(notes.map(n => n._id === updated._id ? updated : n));
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteNote = async (id) => {
        try {
            await deleteNoteApi(id);
            setNotes(notes.filter(n => n._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <h2>Loading...</h2>;
    if (error) return <h2>Error: {error}</h2>;

    return (
        <div className="container">
            <h1>Notes App</h1>

            <div className="input-group">
                <input
                    placeholder="Note Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Write your note..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                <button onClick={addNote}>Add Note</button>
            </div>

            <div className="notes-grid">
                {notes.map((note) => (
                    <div key={note._id} className={`note-card ${note.pinned ? "pinned" : ""}`}>
                        <h3>{note.title}</h3>
                        <p>{note.content}</p>

                        <div className="actions">
                            <button onClick={() => togglePin(note)}>
                                {note.pinned ? "Unpin" : "Pin"}
                            </button>
                            <button onClick={() => deleteNote(note._id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;