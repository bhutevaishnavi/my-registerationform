const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();

// Middleware for serving static files (like HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

// Middleware to parse URL-encoded data from forms
app.use(bodyParser.urlencoded({ extended: true }));

// Use session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/registerationform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define Mongoose schema and model
const userSchema = new mongoose.Schema({
    fullname: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Serve login.html
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Serve register.html
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

// Serve home page (after login)
app.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }
    res.send(`
        
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
         body{
        background-image: linear-gradient( 1350deg,#340319,#ed21b0);    
    }
    body{
        background-image: url(img30.jpg);
        background-repeat:no-repeat ;
        background-size: cover;
    }
    .nav{
        color: white;
        float:left;
        font-size: x-large;
        margin-top: 20px;
        margin-left: 100px;
        margin-right: 100px;
        font-weight: bolder;
    }

    #a{
      position: absolute;
      left:430px;
      color:white;
      text-decoration: none;
    }
    #a:hover{
        color:aqua;
    }
    #b{
        position: absolute;
        left:630px;
        color:white;
        text-decoration: none;
    }
    #b:hover{
        color: aqua;
    }
    
    #c{
        position: absolute;
        left:830px; 
        color: white;
        text-decoration: none;  
    }
    #c:hover{
        color: aqua;

    }

    #d{
        position: absolute;
        left:1000px;
        color: white;
        text-decoration: none;
    }
    #d:hover{
        color: aqua;

    }
    .section {
        text-align: center;
        padding: 5rem 2rem;
        color: white;
    }
    .section h2 {
        font-size: 30px;
        margin-bottom: 1px;
        color: aqua;
        text-shadow: 2px 2px black;
    }
    .button {
        background-color: gray;
        color: white;
        padding: 10px 20px;
        border-radius: 30px;
        text-decoration: none;


    }
    </style>
</head>
<body>
    <div class="nav">
        <a id="a" href="home.html" >Home</a>
        <a id="b" href="about.html">About</a>
        <a id="c" href="service.html">service</a>
        <a id="d" href="contact.html">Contact</a>
     </div>

     <section class="section">
     <h2>Welcome, ${req.session.user.fullname}!</h2>
     <p>You are logged in.</p>
     <a href="/logout">Logout</a>
    </section>

    <script>
        // Get user data from the session using JavaScript (passed by the server)
        const user = JSON.parse('<%= JSON.stringify(session.user) %>');
        
        // Display user's full name in the home page
        document.getElementById('username').textContent = user.fullname;
    </script>

</body>
<script src="index.js"></script>
</html>
    `);
});

// Handle registration form submission
app.post('/register', async (req, res) => {
    const { fullname, email, password, confirmPassword } = req.body;

    // Validate the form data
    if (password !== confirmPassword) {
        return res.send('Passwords do not match! <a href="/register">Go back</a>');
    }

    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send('User already exists with this email! <a href="/register">Go back</a>');
        }

        // Save the new user to MongoDB
        const newUser = new User({ fullname, email, password });
        await newUser.save();

        res.send('Registration successful! <a href="/login">Login</a>');
    } catch (error) {
        console.error('Error registering user:', error);
        res.send('Error registering user! <a href="/register">Try again</a>');
    }
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;


    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.send('User not found! <a href="/login">Try again</a>');
        }

        // Compare the entered password with the stored password
        if (password === user.password) {
            // Store user info in session
            req.session.user = user;
            return res.redirect('/home'); // Redirect to home page
        } else {
            return res.send('Incorrect password! <a href="/login">Try again</a>');
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.send('Error logging in! <a href="/login">Try again</a>');
    }
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out!');
        }
        // Clear session data and redirect to login page
        res.redirect('/login');
    });
});

// Start the server 
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
