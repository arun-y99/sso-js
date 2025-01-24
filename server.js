const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Initialize JWT_SECRET - Do not hardcode
const JWT_SECRET = process.env.JWT_SECRET;

// Mock database
// const passwordTable = {}; // { username: { publicSalt, passwordHash } }

// MongoDB Connection
const DB_URI = 'mongodb://127.0.0.1:27017/authentication'; 
mongoose
    .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    publicSalt: { type: String, required: true },
    passwordHash: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);


//Constants
const PRIVATE_SALT_LENGTH = 8;
const PRIVATE_SALTS_COUNT = 10;
let privateSalts = ["9=2avcT", "5U0qlaIF", "J;GvwZ%.", "TDIo#nT}", ">)!)Y:,g", "r@5k#ISW", "%VZtC17J", "afcE5]%9" , "bEy&jg36", "SsDCLFpO"];

// //Generate random private salts
// const initializePrivateSalts = () => {
//     privateSalts = Array.from({ length : PRIVATE_SALTS_COUNT }, () => 
//         generatePrivateSalt(PRIVATE_SALT_LENGTH)
//     );
// };

// //Helper function to generate private salts
// const generatePrivateSalt = (length) => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
//     let privateSalt = '';
//     for(let i=0; i < length; i++) {
//         privateSalt += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return privateSalt;
// }

// Generate token
const generateToken = (user) => {
    return jwt.sign({ username : user }, JWT_SECRET, { expiresIn : "1h"});
}

// Authenticate token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Bearer token
    if (!token) return res.status(401).json({ error: "Access Denied" });
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid Token" });
      req.user = user; // Add user data to the request
      next();
    });
  };

// Password validation function
const isValidPassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpperCase && hasDigit && hasSpecialChar;
};

// Helper function to hash password
const hashPassword = async (password, publicSalt, privateSalt) => {
    const combinedSalt = publicSalt + privateSalt;
    return await bcrypt.hash(password + combinedSalt, 10);
};

// Endpoint to register a user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    // if (passwordTable[username]) {
    //     return res.status(400).json({ message: 'User already exists.' });
    // }

    if (!isValidPassword(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long, include at least one uppercase letter, one digit, and one special character.',
        });
    }

    try {
        const existingUser = await User.findOne({ username });
        if(existingUser) {
            return res.status(400).json({ message : "User already exists."});
        }

        const publicSalt = uuidv4(); // Generate a unique public salt
        const privateSalt = privateSalts[Math.floor(Math.random() * privateSalts.length)]; // Random private salt
        const passwordHash = await hashPassword(password, publicSalt, privateSalt);

        // Store only public salt and password hash
        // passwordTable[username] = { publicSalt, passwordHash };

        const newUser = new User({ username, publicSalt, passwordHash });
        await newUser.save();

        

        res.status(201).json({ message: 'User registered successfully.'});
    } catch (error) {
        print(error.message)
        res.status(500).json({ message: 'Error while registering user.', error });
        return;
    }
});

// Endpoint to authenticate a user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    // const userData = passwordTable[username];
    // //console.log(userData);
    // if (!userData) {
    //     return res.status(401).json({ message: 'Invalid username or password.' });
    // }

    // const { publicSalt, passwordHash } = userData;
    // for(let i=0; i<privateSalts.length; i++) {
    //     console.log(privateSalts[i]);
    // }
    try {
        const user = await User.findOne({ username });
        if(!user) {
            res.status(401).json({ message : "Invalid username or password"});
        }
        
        const publicSalt = user.publicSalt;
        const passwordHash = user.passwordHash;
    
        for (const privateSalt of privateSalts) {
            const combinedPassword = password + publicSalt + privateSalt;
            console.log(await hashPassword(combinedPassword));
            // Use bcrypt.compare to check if the password matches
            if (await bcrypt.compare(combinedPassword, passwordHash)) {
                // console.log(privateSalt);
                console.log(await hashPassword(combinedPassword));

                //Generate token
                const token = generateToken(username);
                return res.status(200).json({ message: 'Authentication successful.', token: token });
            }
            
        }
        return res.status(401).json({ message: 'Invalid username or password.' });
    } catch (error) {
        res.status(500).json({ message: 'Error during authentication.', error });
        return;
    }
});

app.get('/verify', authenticateToken, (req, res) => {
    res.json({ message: `Valid Token` });
  });

// Initialize private salts before starting the server
// initializePrivateSalts();

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});