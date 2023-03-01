const { MongoClient } = require('mongodb');

let _db;

exports.connectToMongoDB = async (callback) => {
    const client = await MongoClient.connect(
        `mongodb+srv://raxitjain:Pwu0YVxueSozErp6@cluster0.z8bnvsw.mongodb.net/?retryWrites=true&w=majority`
    );
    _db = client.db('shopping');
    callback(client);
};

exports.getDB = () => {
    if (_db) {
        return _db;
    }
    throw 'No databse found!!';
}
