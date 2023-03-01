const mongodb = require('mongodb');
const { getDB } = require("../utils/database");

class Product {
    constructor(title, description, imageUrl, price, id, userId) {
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.userId = userId;
    }

    async save() {
        try {
            const db = getDB();
            if (this._id) {
                await db
                    .collection('products')
                    .updateOne({ _id: this._id }, { $set: this });
            } else {
                await db.collection('products').insertOne(this);
            }
        } catch (error) {
            console.error(error);
        }
    }

    static fetchAll() {
        const db = getDB();
        return db.collection('products').find().toArray();
    }

    static findById(productId) {
        const db = getDB();
        return db.collection('products').find({ _id: new mongodb.ObjectId(productId) }).next();
    }

    static deleteById(productId) {
        const db = getDB();
        return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(productId) });
    }
}

module.exports = Product;
