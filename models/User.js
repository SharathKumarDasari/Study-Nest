const bcrypt = require('bcryptjs');

async function createUser(collection, rollno, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { rollno, password: hashedPassword, role };
    await collection.insertOne(user);
}

async function findUser(collection, rollno) {
    return await collection.findOne({ rollno });
}

module.exports = { createUser, findUser };
