const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const expressHandlebars = require('express-handlebars');

// Import routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const { get404 } = require('./controllers/error');
const { connectToMongoDB } = require('./utils/database');
const User = require('./models/user');

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
    const user = await User.findById("63ff0f7496de13917cca7e65");
    req.user = new User(user.name, user.email, user.cart, user._id);
    next();
});

// Use Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(get404);

connectToMongoDB(async () => {
    console.log("Connected to MongoDB!!");
    app.listen(3000);
});
