const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    },
});

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(item => {
        return item.productId.toString() === product._id.toString();
    });
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        updatedCartItems[cartProductIndex].quantity++;
    } else {
        updatedCartItems.push({ productId: product._id, quantity: 1 });
    }
    const updatedCart = { items: updatedCartItems };
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.deleteFromCart = function (productId) {
    const updatedCartItems = this.cart.items
        .filter(item => item.productId.toString() !== productId.toString());
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function (productId) {
    this.cart = { items: [] };
    return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
