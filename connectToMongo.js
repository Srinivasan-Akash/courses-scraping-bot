const { MongoClient } = require('mongodb');

async function connectToMongo() {
    const uri = 'mongodb://127.0.0.1:27017';
    const client = new MongoClient(uri);
    try {
        await client.connect();
        return client;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}
module.exports = connectToMongo;