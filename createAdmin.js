const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    const uri = "mongodb://localhost:27017/"; // Replace with your MongoDB Atlas connection string
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('schoolPortal');
        const collection = database.collection('users');

        const admin = {
            rollno: "admin",
            password: bcrypt.hashSync("adminpassword", 10), // Replace with your admin password
            role: "admin"
        };

        const result = await collection.insertOne(admin);
        console.log(`Admin user created with _id: ${result.insertedId}`);
    } finally {
        await client.close();
    }
}

createAdmin().catch(console.dir);
