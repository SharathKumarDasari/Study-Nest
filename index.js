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
                </li>
            `;
        }).join('');

        const content = `
            <!DOCTYPE html>
            <html lang="en">
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
            /* Add the same CSS here or link to an external stylesheet */
            body {
                background-image: linear-gradient(135deg, #EA9344 30%, #B2EDD7 80%);
                font-family: 'Quicksand', sans-serif;
                font-size: 18px;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .sub-body {
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                padding: 20px;
            }
            h1 {
                font-size: 3rem;
                color: #333;
                text-align: center;
                margin-bottom: 20px;
                font-weight: 700;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            }
            h3 {
                font-size: 1.5rem;
                color: #444;
                margin-bottom: 20px;
                text-align: center;
                font-weight: 500;
            }
            ul {
                list-style-type: none;
                padding: 0;
                width: 100%;
                text-align: center;
            }
            ul li {
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            ul li a {
                color: #EA9344;
                text-decoration: none;
                font-weight: 600;
                transition: color 0.3s ease;
            }
            ul li a:hover {
                color: #B2EDD7;
            }
            .btn-danger {
                background-color: #ff4d4d;
                color: white;
                padding: 6px 12px;
                border: none;
                cursor: pointer;
                border-radius: 5px;
                transition: background-color 0.3s ease;
            }
            .btn-danger:hover {
                background-color: #ff0000;
            }
            #subjectPageContainer {
                margin-top: 30px;
                padding: 15px;
                background-color: rgba(255, 255, 255, 0.8);
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                width: 100%;
                max-width: 800px;
            }
        </style>
                <title>${subjectName}</title>
            </head>
            <body class="sub-body">
                <h1>Welcome to ${subjectName} page</h1>
                <h3>Uploaded Files:</h3>
                
                <div id="subjectPageContainer">
                <ul>
                    ${fileLinks}
                </ul>
                </div>
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
                <!DOCTYPE html>
                <html lang="en">
                <html>
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
            /* Add the same CSS here or link to an external stylesheet */
            body {
                background-image: linear-gradient(135deg, #EA9344 30%, #B2EDD7 80%);
                font-family: 'Quicksand', sans-serif;
                font-size: 18px;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .sub-body {
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                padding: 20px;
            }
            h1 {
                font-size: 3rem;
                color: #333;
                text-align: center;
                margin-bottom: 20px;
                font-weight: 700;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            }
            h3 {
                font-size: 1.5rem;
                color: #444;
                margin-bottom: 20px;
                text-align: center;
                font-weight: 500;
            }
            ul {
                list-style-type: none;
                padding: 0;
                width: 100%;
                text-align: center;
            }
            ul li {
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            ul li a {
                color: #EA9344;
                text-decoration: none;
                font-weight: 600;
                transition: color 0.3s ease;
            }
            ul li a:hover {
                color: #B2EDD7;
            }
            .btn-danger {
                background-color: #ff4d4d;
                color: white;
                padding: 6px 12px;
                border: none;
                cursor: pointer;
                border-radius: 5px;
                transition: background-color 0.3s ease;
            }
            .btn-danger:hover {
                background-color: #ff0000;
            }
            #subjectPageContainer {
                margin-top: 30px;
                padding: 15px;
                background-color: rgba(255, 255, 255, 0.8);
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                width: 100%;
                max-width: 800px;
            }
        </style>
                    <title>${subjectName}</title>
                </head>
                <body class="sub-body">
                    <h1>Welcome to ${subjectName} page</h1>
                    <h3>Uploaded Files:</h3>
                    
                    <div id="subjectPageContainer">
                    <ul>
                        <li><a href="/uploads/${file.originalname}" target="_blank">${file.originalname}</a></li>
                    </ul>
                    </div>
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
                <!DOCTYPE html><!DOCTYPE html>
                <html lang="en">
                <html>
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
            /* Add the same CSS here or link to an external stylesheet */
            body {
                background-image: linear-gradient(135deg, #EA9344 30%, #B2EDD7 80%);
                font-family: 'Quicksand', sans-serif;
                font-size: 18px;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .sub-body {
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                padding: 20px;
            }
            h1 {
                font-size: 3rem;
                color: #333;
                text-align: center;
                margin-bottom: 20px;
                font-weight: 700;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            }
            h3 {
                font-size: 1.5rem;
                color: #444;
                margin-bottom: 20px;
                text-align: center;
                font-weight: 500;
            }
            ul {
                list-style-type: none;
                padding: 0;
                width: 100%;
                text-align: center;
            }
            ul li {
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            ul li a {
                color: #EA9344;
                text-decoration: none;
                font-weight: 600;
                transition: color 0.3s ease;
            }
            ul li a:hover {
                color: #B2EDD7;
            }
            .btn-danger {
                background-color: #ff4d4d;
                color: white;
                padding: 6px 12px;
                border: none;
                cursor: pointer;
                border-radius: 5px;
                transition: background-color 0.3s ease;
            }
            .btn-danger:hover {
                background-color: #ff0000;
            }
            #subjectPageContainer {
                margin-top: 30px;
                padding: 15px;
                background-color: rgba(255, 255, 255, 0.8);
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                width: 100%;
                max-width: 800px;
            }
        </style>
                    <title>${subjectName}</title>
                </head>
                <body class="sub-body">
                    <h1>Welcome to ${subjectName} page</h1>
                    <h3>Uploaded Files:</h3>
                    <div id="subjectPageContainer">
                    <ul>
                        ${fileLinks}
                    </ul>
                    </div>
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
