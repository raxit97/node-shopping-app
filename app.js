const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
// const expressHandlebars = require('express-handlebars');

// Import routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const { get404 } = require('./controllers/error');
const User = require('./models/user');

// Initialize Express object
const app = express();

const MONGODB_URI = `mongodb+srv://raxitjain:Pwu0YVxueSozErp6@cluster0.z8bnvsw.mongodb.net/shopping?retryWrites=true&w=majority`;

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
    const user = await User.findById("64001ee2442a09c5763b8bcf");
    req.user = user;
    next();
});

// Use Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(get404);

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log("Connected to MongoDB!!");
        const user = await User.findOne();
        if (!user) {
            const newUser = new User({
                name: "Raxit Jain",
                email: "raxit.jain18@gmail.com",
                cart: {
                    items: []
                }
            });
            newUser.save();
        }
        app.listen(3000);
    });
