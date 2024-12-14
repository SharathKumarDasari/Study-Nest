const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const { log } = require('console');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/auth', authRoutes);
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
app.use(cors()); // Serve uploaded files


mongoose.connect('mongodb://localhost:27017/fileupload', { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas and models for different uploads
const fileSchema = new mongoose.Schema({
    subjectName: String,  // Include subject name to keep track of where the file belongs
    filename: String,
    contentType: String,
    data: Buffer
});
const FileUpload = mongoose.model('FileUpload', fileSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

// Create subject page
// Create subject page
app.post('/create-page/:subject', async (req, res) => {
    const subjectName = req.params.subject;
    const filePath = path.join(__dirname, 'public', `${subjectName}.html`);

    try {
        // Fetch the uploaded files for the subject from MongoDB
        const files = await FileUpload.find({ subjectName }).lean();

        const fileLinks = files.map(file => {
            return `
                <li>
                    <a href="/uploads/${file.filename}" target="_blank">${file.filename}</a>
                    <button onclick="deleteFile('${subjectName}', '${file.filename}')" class="btn btn-danger btn-sm ml-3">Delete</button>
                </li>
            `;
        }).join('');

        const content = `
            <html>
            <head>
                <title>${subjectName}</title>
            </head>
            <body>
                <h1>Welcome to ${subjectName} page</h1>
                <h3>Uploaded Files:</h3>
                <ul>
                    ${fileLinks}
                </ul>
                <div id="subjectPageContainer"></div>
            </body>
            </html>
        `;

        fs.writeFile(filePath, content, (err) => {
            if (err) {
                return res.status(500).send('Error creating page');
            }
            res.send(`${subjectName}.html page created successfully`);
        });
    } catch (err) {
        console.error('Error retrieving files for the subject:', err);
        res.status(500).send('Error retrieving files for the subject');
    }
});



// Delete subject page
app.delete('/delete-page/:subject', (req, res) => {
    const subjectName = req.params.subject;
    const filePath = path.join(__dirname, 'public', `${subjectName}.html`);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).send('Error deleting page');
        }
        res.send(`${subjectName}.html page deleted successfully`);
    });
});

// Upload file for a specific subject
// Upload file for a specific subject
app.post('/upload/:subject', upload.single('file'), async (req, res) => {
    const subjectName = req.params.subject;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const newFile = new FileUpload({
            subjectName: subjectName,  // Save the subject name to keep track of which subject the file belongs to
            filename: file.originalname,
            contentType: file.mimetype,
            data: file.buffer
        });

        await newFile.save();
        console.log('File uploaded for subject:', subjectName, file);

        // Create the subject page if it doesn't exist
        const subjectPagePath = path.join(__dirname, 'public', `${subjectName}.html`);
        if (!fs.existsSync(subjectPagePath)) {
            // Page does not exist, create it
            const content = `
                <html>
                <head>
                    <title>${subjectName}</title>
                </head>
                <body>
                    <h1>Welcome to ${subjectName} page</h1>
                    <h3>Uploaded Files:</h3>
                    <ul>
                        <li><a href="/uploads/${file.originalname}" target="_blank">${file.originalname}</a></li>
                    </ul>
                    <div id="subjectPageContainer"></div>
                </body>
                </html>
            `;

            // Write the new page to the filesystem
            fs.writeFile(subjectPagePath, content, (err) => {
                if (err) {
                    return res.status(500).send('Error creating page');
                }
                res.send('File uploaded and subject page created successfully');
            });
        } else {
            // Subject page already exists, update it
            const existingFiles = await FileUpload.find({ subjectName }).lean().exec();
            const fileLinks = existingFiles.map(file => {
                return `<li><a href="/uploads/${file.filename}" target="_blank">${file.filename}</a></li>`;
            }).join('');

            const updatedContent = `
                <html>
                <head>
                    <title>${subjectName}</title>
                </head>
                <body>
                    <h1>Welcome to ${subjectName} page</h1>
                    <h3>Uploaded Files:</h3>
                    <ul>
                        ${fileLinks}
                    </ul>
                    <div id="subjectPageContainer"></div>
                </body>
                </html>
            `;

            // Update the existing page with the new file link
            fs.writeFile(subjectPagePath, updatedContent, (err) => {
                if (err) {
                    return res.status(500).send('Error updating page');
                }
                res.send('File uploaded successfully and subject page updated');
            });
        }
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).send('Error uploading file.');
    }
});


app.get('/uploads/:filename', async (req, res) => {
    const { filename } = req.params;

    try {
        // Find the file in the MongoDB database
        const file = await FileUpload.findOne({ filename });

        if (!file) {
            return res.status(404).send('File not found.');
        }

        // Set the content type and send the file data
        res.set('Content-Type', file.contentType);
        res.send(file.data);
    } catch (err) {
        console.error('Error retrieving file:', err);
        res.status(500).send('Error retrieving file.');
    }
});

// Delete file from MongoDB and uploads folder
app.delete('/delete-file/:subject/:filename', async (req, res) => {
    const { subject, filename } = req.params;

    try {
        // Find the file in the database
        const file = await FileUpload.findOneAndDelete({ subjectName: subject, filename });

        if (!file) {
            return res.status(404).send('File not found.');
        }

        // Delete the file from the uploads folder
        const filePath = path.join(__dirname, 'uploads', filename);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(500).send('Error deleting file from server.');
            }
            res.send('File deleted successfully');
        });
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).send('Error deleting file.');
    }
});


// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
