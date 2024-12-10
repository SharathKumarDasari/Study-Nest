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

app.use(express.static(path.join(__dirname, 'public')));

app.post('/create-page/:subject', (req, res) => {
    const subjectName = req.params.subject;
    const filePath = path.join(__dirname, 'public', `${subjectName}.html`);

    const content = `<html>
<head>
    <title>${subjectName}</title>
</head>
<body>
    <h1>Welcome to ${subjectName} page</h1>
</body>
</html>`;

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            return res.status(500).send('Error creating page');
        }
        res.send(console.log(`${subjectName}.html page created successfully`));
    });
});

app.delete('/delete-page/:subject', (req, res) => {
    const subjectName = req.params.subject;
    const filePath = path.join(__dirname, 'public', `${subjectName}.html`);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).send('Error deleting page');
        }
        res.send(console.log(`${subjectName}.html page deleted successfully`));
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});






