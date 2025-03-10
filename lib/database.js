const { MongoClient, ObjectId } = require("mongodb");

let client = null;
// This is the collection object for querying the users collection in the database
let collectionUsers = null;

// Function to connect to DB and get the collection object
async function initDBIfNecessary() {
    if (!client) {
        // Only connect to the database if we are not already connected
        client = await MongoClient.connect("mongodb://localhost:27017");
        const db = client.db("jolliville");
        collectionUsers = db.collection("users");
        console.log("work");
    }
} // End initDBIfNecessary

// Function to disconnect from the database
async function disconnect() {
    if (client) {
        await client.close();
        client = null;
    }
} // End disconnect

// Function to insert a new user into the database
async function insertUser(user) {
    await initDBIfNecessary();
    return await collectionUsers.insertOne(user);
}

async function getAllusers() {
    await initDBIfNecessary();
    return await collectionUsers.find().toArray();
}

async function deleteUser(userId) {
    await initDBIfNecessary();
    await collectionUsers.deleteOne({
        _id: ObjectId.createFromHexString(userId)
    });
}

async function getUserById(userId) {
    await initDBIfNecessary();
    return collectionUsers.findOne({
        _id: ObjectId.createFromHexString(userId)
    });
}

async function updateUser(userId, user) {
    await initDBIfNecessary();
    const { name, gender, dob } = user;
    await collectionUsers.updateOne({
        _id: ObjectId.createFromHexString(userId)
    }, {
        $set: {
            name,
            gender,
            dob
        }
    });
} 

// Export the functions so they can be used in other files
module.exports = {
    insertUser,
    disconnect,
    getAllusers,
    deleteUser,
    getUserById,
    updateUser
};

