const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [{
        title: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    user: {
        email: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
