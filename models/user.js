const mongodb = require('mongodb');
const { getDB } = require("../utils/database");
const ObjectId = mongodb.ObjectId;

class User {

    constructor(name, email, cart, id) {
        this.name = name;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDB();
        db.collection('users').insertOne(this);
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(item => {
            return item.productId.toString() === product._id.toString();
        });
        const updatedCartItems = [...this.cart.items];
        if (cartProductIndex >= 0) {
            updatedCartItems[cartProductIndex].quantity++;
        } else {
            updatedCartItems.push({ productId: new ObjectId(product._id), quantity: 1 });
        }
        const updatedCart = { items: updatedCartItems };
        const db = getDB();
        return db.collection('users').updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: updatedCart } }
        );
    }

    async getCart() {
        const db = getDB();
        const productIds = this.cart.items.map(item => item.productId);
        const products = await db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray();
        // Check whether the products from MongoDB matches exactly with the cart items
        // This check is done in case if any product in the cart 
        const updatedCartItems = this.cart.items.filter((item) => {
            return products.some((product) => product._id.toString() === item.productId.toString());
        });
        const productsWithQuantity = products.map((product) => {
            const { quantity } = updatedCartItems.find(item => item.productId.toString() === product._id.toString());
            return {
                ...product,
                quantity
            }
        });
        return productsWithQuantity;
    }

    deleteFromCart(productId) {
        const db = getDB();
        const updatedCartItems = this.cart.items
            .filter(item => item.productId.toString() !== productId.toString());
        return db.collection('users').updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: updatedCartItems } } }
        );
    }

    async addOrder() {
        const db = getDB();
        const products = await this.getCart();
        const order = {
            items: products,
            user: {
                _id: new ObjectId(this._id),
                name: this.name,
                email: this.email
            }
        };
        await db.collection('orders').insertOne(order);
        this.cart = { items: [] };
        return db.collection('users').updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
        );
    }

    getOrders() {
        const db = getDB();
        return db.collection('orders')
            .find({ "user._id": new ObjectId(this._id) })
            .toArray();
    }
    
    static findById(userId) {
        const db = getDB();
        return db.collection('users').findOne({ _id: new ObjectId(userId) });
    }
}

module.exports = User;
