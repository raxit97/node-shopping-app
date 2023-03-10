const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');
// const expressHandlebars = require('express-handlebars');  

// Import routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const { get404, get500 } = require('./controllers/error');
const User = require('./models/user');

// Initialize Express object
const app = express();

const MONGODB_URI = `mongodb+srv://raxitjain:Pwu0YVxueSozErp6@cluster0.z8bnvsw.mongodb.net/shopping?retryWrites=true&w=majority`;
const mongoDBStore = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

// app.set('view engine', 'pug');
// app.engine('hbs', expressHandlebars.engine({ layoutsDir: 'views/layouts', defaultLayout: 'main-layout', extname: 'hbs' }));
// app.set('view engine', 'hbs');
app.set('view engine', 'ejs');
app.set('views', 'views');

// Use body parser for URL encoding and JSON requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cookie parser
app.use(cookieParser());

// Initialize session middleware
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: mongoDBStore
}));
app.use(csurf());
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(async (req, res, next) => {
    try {
        if (req.session.user && req.session.user._id) {
            const user = await User.findById(req.session.user._id);
            req.user = user;
        }
        next();
    } catch (error) {
        next(new Error(error));
    }
});

// Use Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(get500);
app.use(get404);

app.use((error, req, res, next) => {
    console.error(error);
    get500(req, res, next);
});

mongoose
    .connect(MONGODB_URI)
    .then(() => app.listen(3000, () => console.log("Listening to port 3000...")));
