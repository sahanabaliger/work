import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// ------------------
// MongoDB Connection
// ------------------
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Atlas Connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// ------------------
// Schema & Model
// ------------------
const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    pinned: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Note = mongoose.model("Note", noteSchema);

// ------------------
// ROUTES
// ------------------

// READ ALL
app.get("/api/notes", async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// CREATE
app.post("/api/notes", async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !title.trim() || !content || !content.trim()) {
            return res.status(400).json({ message: "Title and Content are required" });
        }

        const newNote = await Note.create({
            title: title.trim(),
            content: content.trim()
        });

        res.status(201).json(newNote);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// UPDATE
app.put("/api/notes/:id", async (req, res) => {
    try {
        const { title, content, pinned } = req.body;

        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (title !== undefined) note.title = title.trim();
        if (content !== undefined) note.content = content.trim();
        if (pinned !== undefined) note.pinned = pinned;

        await note.save();
        res.json(note);

    } catch (error) {
        res.status(400).json({ message: "Invalid ID" });
    }
});

// DELETE
app.delete("/api/notes/:id", async (req, res) => {
    try {
        const deleted = await Note.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json({ message: "Deleted successfully" });

    } catch (error) {
        res.status(400).json({ message: "Invalid ID" });
    }
});

// ------------------
// SERVER START
// ------------------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});