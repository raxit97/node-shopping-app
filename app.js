const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const expressHandlebars = require('express-handlebars');

// Import routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const { get404 } = require('./controllers/error');

// Import instance of databse
const sequelize = require('./utils/database');

// Import DB models
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

// Initialize Express object
const app = express();

// app.set('view engine', 'pug');
// app.engine('hbs', expressHandlebars.engine({ layoutsDir: 'views/layouts', defaultLayout: 'main-layout', extname: 'hbs' }));
// app.set('view engine', 'hbs');
app.set('view engine', 'ejs');
app.set('views', 'views');

// Use body parser for URL encoding and JSON requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
    const user = await User.findByPk(1);
    req.user = user;
    next();
})

// Use Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(get404);

// Define Associations of DB models
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize.sync()
    .then(async _ => {
        let user = await User.findByPk(1);
        if (!user) {
            const newUser = await User.create({ name: "Raxit Jain", email: "raxit.jain18@gmail.com" })
            await newUser.createCart();
        }
        app.listen(3000);
    })
    .catch(err => console.log(err));
