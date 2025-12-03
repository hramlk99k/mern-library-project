// server.js (Consolidated File with all CRUD routes)

// --- 1. Import Dependencies ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- 2. Initialize App and Middleware ---
const app = express();
const PORT = 5000; 

app.use(express.json()); // Allows the server to read JSON data from client requests (req.body)
app.use(cors()); // Allows your frontend (on port 3000) to communicate with this backend (on port 5000)

// --- 3. Database Connection ---
const MONGO_URI = 'mongodb://127.0.0.1:27017/libraryDB';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected to libraryDB...'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));


// --- 4. Define the Mongoose Schema and Model ---

// Schema: The blueprint for the 'Book' document
const BookSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    publicationYear: { 
        type: Number, 
        min: 1000, 
        max: new Date().getFullYear(),
        default: null
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Model: The primary tool used for database operations
const Book = mongoose.model('Book', BookSchema);


// --- 5. API Routes (CRUD Endpoints) ---

// GET /api/books: Read all books (READ)
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find().sort({ title: 1 });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// POST /api/books: Create a new book (CREATE)
app.post('/api/books', async (req, res) => {
    try {
        const newBook = new Book(req.body); // req.body contains the {title, author, ...} data
        
        const savedBook = await newBook.save();
        res.status(201).json(savedBook); // 201 Created
    } catch (err) {
        res.status(400).json({ message: err.message }); // 400 Bad Request for validation errors
    }
});

// PATCH /api/books/:id: Update an existing book (UPDATE)
app.patch('/api/books/:id', async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id, 
            req.body,      // Apply changes from the request body
            { new: true, runValidators: true } // Return updated doc, enforce schema rules
        );
        
        if (!updatedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        res.json(updatedBook); // 200 OK is implied
        
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/books/:id: Delete a book (DELETE)
app.delete('/api/books/:id', async (req, res) => {
    try {
        const result = await Book.findByIdAndDelete(req.params.id);
        
        if (!result) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        res.json({ message: 'Book successfully deleted' }); // 200 OK is implied
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 6. Start the Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});