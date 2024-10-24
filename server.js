// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));


app.put('/api/files/:id', async (req, res) => {
    const { content } = req.body;
    try {
        const updatedFile = await File.findByIdAndUpdate(req.params.id, { content }, { new: true });
        if (!updatedFile) return res.status(404).json({ message: 'File not found' });
        res.status(200).json(updatedFile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// File Schema
const fileSchema = new mongoose.Schema({
  name: String,
  content: String,
});

const File = mongoose.model('File', fileSchema);

// Routes
// Save a file
app.post('/api/files', async (req, res) => {
  const { name, content } = req.body;
  const file = new File({ name, content });
  try {
    await file.save();
    res.status(201).json(file);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Load all files
app.get('/api/files', async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a file
app.delete('/api/files/:id', async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
