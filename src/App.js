// App.js (Complete with CRUD and Edit State Management)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/books`;

function App() {
    // 1. STATE for Data and Creation
    const [books, setBooks] = useState([]); 
    const [newBook, setNewBook] = useState({ title: '', author: '', publicationYear: '' });

    // 2. STATE for Editing
    const [editId, setEditId] = useState(null); 
    const [editData, setEditData] = useState({ title: '', author: '', publicationYear: '' });

    // --- UTILITY FUNCTIONS ---

    // READ (GET): Fetch all books
    const fetchBooks = async () => {
        try {
            const response = await axios.get(API_URL);
            setBooks(response.data); 
        } catch (error) {
            console.error('Error fetching books:', error);
            // This alert helps debug if the server is not running
            alert("Could not connect to the backend server. Make sure node server.js is running.");
        }
    };

    // Handler for creating a new book (reused for multiple inputs)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBook(prevBook => ({
            ...prevBook,
            [name]: value
        }));
    };

    // --- CRUD FUNCTIONS ---

    // CREATE (POST): Add a new book
    const addBook = async () => {
        if (!newBook.title.trim() || !newBook.author.trim()) {
            alert('Title and Author are required!');
            return;
        } 

        try {
            await axios.post(API_URL, newBook); 

            setNewBook({ title: '', author: '', publicationYear: '' }); // Clear form
            fetchBooks(); // Refresh list
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Failed to add book.');
        }
    };

    // DELETE: Remove a book
    const deleteBook = async (id) => {
        try {
            if (window.confirm("Are you sure you want to delete this book?")) {
                await axios.delete(`${API_URL}/${id}`); 
                fetchBooks(); // Refresh list
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book.');
        }
    };
    
    // UPDATE Start: Prepare editing mode
    const startEdit = (book) => {
        setEditId(book._id);
        setEditData({
            title: book.title,
            author: book.author,
            publicationYear: book.publicationYear
        });
    };

    // UPDATE Finish (PATCH): Save changes
    const updateBook = async () => {
        if (!editData.title.trim() || !editData.author.trim()) {
            alert('Title and Author cannot be empty!');
            return;
        } 

        try {
            await axios.patch(`${API_URL}/${editId}`, editData); 

            setEditId(null); // Exit editing mode
            setEditData({ title: '', author: '', publicationYear: '' }); 
            fetchBooks(); // Refresh list
        } catch (error) {
            console.error('Error updating book:', error);
            alert('Failed to update book.');
        }
    };

    // --- LIFECYCLE HOOK ---

    // Run on initial load
    useEffect(() => {
        fetchBooks();
    }, []); 

    // --- RENDER FUNCTION ---

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
            <h1>📚 Library Manager (MERN CRUD)</h1>

            {/* CREATE SECTION */}
            <h2>Add New Book</h2>
            <div className="App">
                <input
                    type="text"
                    name="title"
                    value={newBook.title}
                    onChange={handleInputChange}
                    placeholder="Title (Required)"
                    style={{ padding: '10px' }}
                />
                <input
                    type="text"
                    name="author"
                    value={newBook.author}
                    onChange={handleInputChange}
                    placeholder="Author (Required)"
                    style={{ padding: '10px' }}
                />
                <input
                    type="number"
                    name="publicationYear"
                    value={newBook.publicationYear}
                    onChange={handleInputChange}
                    placeholder="Year (Optional)"
                    style={{ padding: '10px', width: '100px' }}
                />
                <button onClick={addBook} style={{ padding: '10px' }}>
                    Add Book
                </button>
            </div>

            <hr/>

            {/* READ / UPDATE / DELETE SECTION */}
            <h2>Book List ({books.length} Total)</h2>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                {books.map((book) => (
                    <li key={book._id} style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #eee', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        
                        {/* Conditional Rendering: Show form if editing, otherwise show text */}
                        {editId === book._id ? (
                            // --- EDITING FORM ---
                            <div style={{ display: 'flex', gap: '10px', flexGrow: 1 }}>
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    style={{ padding: '5px', flexGrow: 1 }}
                                />
                                <input
                                    type="text"
                                    value={editData.author}
                                    onChange={(e) => setEditData({ ...editData, author: e.target.value })}
                                    style={{ padding: '5px', flexGrow: 1 }}
                                />
                                <button onClick={updateBook} style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white' }}>
                                    Save
                                </button>
                                <button onClick={() => setEditId(null)} style={{ padding: '5px 10px' }}>
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            // --- STANDARD DISPLAY ---
                            <div style={{ flexGrow: 1 }}>
                                <strong>{book.title}</strong> by {book.author} 
                                {book.publicationYear && ` (${book.publicationYear})`}
                            </div>
                        )}
                        
                        {/* Action Buttons (Only show Edit/Delete if NOT currently editing) */}
                        {editId !== book._id && (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button 
                                    onClick={() => startEdit(book)}
                                    style={{ padding: '5px 10px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}>
                                    Edit
                                </button>
                                <button 
                                    onClick={() => deleteBook(book._id)} 
                                    style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}>
                                    Delete
                                </button>
                            </div>
                        )}
                        
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;