// PROJECT/server/index.js - COMPLETE CORRECTED FILE FOR AZURE SQL DATABASE

const express = require('express');
const cors = require('cors');
// const sqlite3 = require('sqlite3').verbose(); // REMOVED: No longer using SQLite
const sql = require('mssql'); // ADDED: For Azure SQL Database
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const axios = require('axios');
const Stripe = require('stripe');

const app = express();
const PORT = process.env.PORT || 3001; // PORT is ignored in Azure Functions, but kept for local dev flexibility

// --- Azure OpenAI & AI Search Configuration ---
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT_NAME || 'gpt-4o-mini';
const AZURE_OPENAI_O3_MINI_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_O3_MINI_DEPLOYMENT_NAME || 'o3-mini';
const AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME || 'text-embedding-3-small';

const AZURE_AI_SEARCH_ENDPOINT = process.env.AZURE_AI_SEARCH_ENDPOINT;
const AZURE_AI_SEARCH_KEY = process.env.AZURE_AI_SEARCH_KEY;
const AZURE_AI_SEARCH_INDEX_NAME = process.env.AZURE_AI_SEARCH_INDEX_NAME || 'code-docs';

// --- Stripe Configuration ---
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
// CORRECTED CORS CONFIGURATION: Explicitly allow frontend origin and credentials
app.use(cors({
  origin: FRONTEND_URL, // Use the FRONTEND_URL from .env or default to http://localhost:5173
  credentials: true // Allow cookies/auth headers to be sent
}));

app.use((req, res, next) => {
    // This specific middleware is for Stripe webhooks, which need raw body
    if (req.originalUrl === '/api/stripe/webhook') {
        next();
    } else {
        // For all other routes, parse JSON body
        express.json({ limit: '10mb' })(req, res, next);
    }
});

// --- Database setup (Azure SQL Database) ---
const SQL_SERVER = process.env.SQL_SERVER;
const SQL_DATABASE = process.env.SQL_DATABASE;
const SQL_USER = process.env.SQL_USER;
const SQL_PASSWORD = process.env.SQL_PASSWORD;
const SQL_PORT = parseInt(process.env.SQL_PORT || '1433', 10);

// --- ADDED: SQL Connection Debug Info ---
console.log('--- SQL Connection Debug Info ---');
console.log('SQL_SERVER:', SQL_SERVER);
console.log('SQL_DATABASE:', SQL_DATABASE);
console.log('SQL_USER:', SQL_USER);
console.log('SQL_PASSWORD:', SQL_PASSWORD ? 'Password is SET' : 'Password is NOT SET'); // DO NOT LOG THE ACTUAL PASSWORD
console.log('SQL_PORT:', SQL_PORT);
console.log('--- End SQL Connection Debug Info ---');

const sqlConfig = {
    user: SQL_USER,
    password: SQL_PASSWORD,
    server: SQL_SERVER,
    database: SQL_DATABASE,
    port: SQL_PORT,
    options: {
        encrypt: true, // For Azure SQL Database
        trustServerCertificate: false // Set to true if you're using a self-signed cert locally, but false for Azure SQL
    }
};

let pool; // Global variable for the SQL connection pool

// Function to connect to SQL Database
async function connectDb() {
    try {
        // If pool exists and is connected, return it
        if (pool && pool.connected) {
            // console.log('Already connected to Azure SQL Database.');
            return pool;
        }
        // console.log('Connecting to Azure SQL Database...');
        pool = await sql.connect(sqlConfig);
        console.log('Connected to Azure SQL Database successfully.');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err; // Re-throw to indicate critical failure
    }
}

// Middleware to ensure DB connection before routes
app.use(async (req, res, next) => {
    try {
        await connectDb(); // Ensure connection for every request
        next();
    } catch (error) {
        res.status(500).json({ error: 'Database connection error', details: error.message });
    }
});

// Initialize database tables (adjusted for SQL Server syntax)
async function initializeDbTables() {
    try {
        const request = pool.request();

        // Users table
        await request.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' and xtype='U')
            CREATE TABLE users (
                id INT IDENTITY(1,1) PRIMARY KEY,
                googleId NVARCHAR(255) UNIQUE,
                email NVARCHAR(255) UNIQUE NOT NULL,
                name NVARCHAR(255) NOT NULL,
                subscriptionStatus NVARCHAR(50) DEFAULT 'free',
                messagesUsed INT DEFAULT 0,
                lastMessageDate NVARCHAR(255),
                usageResetTime NVARCHAR(255),
                createdAt DATETIME DEFAULT GETDATE()
            );
        `);
        console.log('Table "users" checked/created.');

        // Review sessions table
        await request.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='review_sessions' and xtype='U')
            CREATE TABLE review_sessions (
                id INT IDENTITY(1,1) PRIMARY KEY,
                userId INT NOT NULL,
                language NVARCHAR(255) NOT NULL,
                codeSnippet NVARCHAR(MAX),
                aiResponse NVARCHAR(MAX),
                aiModel NVARCHAR(255) DEFAULT 'gpt-4o-mini',
                messageType NVARCHAR(255) DEFAULT 'review',
                timestamp DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (userId) REFERENCES users(id)
            );
        `);
        console.log('Table "review_sessions" checked/created.');

        // Feedback table
        await request.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='feedback' and xtype='U')
            CREATE TABLE feedback (
                id INT IDENTITY(1,1) PRIMARY KEY,
                userId INT NOT NULL,
                type NVARCHAR(255) NOT NULL,
                rating INT,
                subject NVARCHAR(255) NOT NULL,
                message NVARCHAR(MAX) NOT NULL,
                email NVARCHAR(255),
                status NVARCHAR(50) DEFAULT 'open',
                timestamp DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (userId) REFERENCES users(id)
            );
        `);
        console.log('Table "feedback" checked/created.');

    } catch (err) {
        console.error('Error initializing database tables:', err);
        throw err;
    }
}

// Call table initialization after connection
// This will run when the Function App starts up
connectDb().then(initializeDbTables).catch(err => {
    console.error("Failed to initialize database on startup:", err);
    // Depending on severity, you might want to exit the process here
});


// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// --- API Routes (Updated for SQL Server) ---

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// User registration/login
app.post('/api/auth/login', async (req, res) => {
    try {
        // The Google ID token is sent in the 'token' field of the request body
        const { token: googleIdToken } = req.body;

        if (!googleIdToken) {
            return res.status(400).json({ error: 'Google ID token is required' });
        }

        // Verify the Google ID token and get user info
        // For local development, we're decoding it directly.
        // For production, you should send this ID token to Google's verification endpoint:
        // https://oauth2.googleapis.com/tokeninfo?id_token=YOUR_ID_TOKEN
        // and verify the response.
        const decodedGoogleToken = jwt.decode(googleIdToken); // REMOVED: ': any' type annotation
        if (!decodedGoogleToken || !decodedGoogleToken.email) {
            return res.status(401).json({ error: 'Invalid Google ID token' });
        }

        const email = decodedGoogleToken.email;
        const name = decodedGoogleToken.name || decodedGoogleToken.email; // Use name from token, fallback to email
        const googleId = decodedGoogleToken.sub; // Google's unique user ID

        const request = pool.request();

        // Check if user exists by googleId or email
        let userResult = await request.input('googleId', sql.NVarChar, googleId)
                                     .input('email', sql.NVarChar, email)
                                     .query('SELECT id, email, name, subscriptionStatus, messagesUsed FROM users WHERE googleId = @googleId OR email = @email');
        let user = userResult.recordset[0];

        if (!user) {
            // Create new user if not found
            const insertResult = await pool.request()
                                         .input('googleId', sql.NVarChar, googleId)
                                         .input('email', sql.NVarChar, email)
                                         .input('name', sql.NVarChar, name)
                                         .query('INSERT INTO users (googleId, email, name) VALUES (@googleId, @email, @name); SELECT SCOPE_IDENTITY() AS id;');
            const newUserId = insertResult.recordset[0].id;

            const appToken = jwt.sign(
                { userId: newUserId, email: email, name: name }, // Include name in JWT
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '24h' }
            );

            res.json({
                token: appToken,
                user: {
                    id: newUserId,
                    email,
                    name,
                    subscriptionStatus: 'free',
                    messagesUsed: 0
                }
            });
        } else {
            // Login existing user
            // Ensure googleId is updated if user previously logged in via email/password
            if (!user.googleId && googleId) {
                await pool.request()
                          .input('googleId', sql.NVarChar, googleId)
                          .input('id', sql.Int, user.id)
                          .query('UPDATE users SET googleId = @googleId WHERE id = @id');
                user.googleId = googleId; // Update local user object
            }

            const appToken = jwt.sign(
                { userId: user.id, email: user.email, name: user.name }, // Include name in JWT
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '24h' }
            );

            res.json({
                token: appToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    subscriptionStatus: user.subscriptionStatus,
                    messagesUsed: user.messagesUsed
                }
            });
        }
    } catch (error) {
        console.error('Authentication failed:', error);
        res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
});

// Get user profile
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const request = pool.request();
        const result = await request.input('userId', sql.Int, req.user.userId)
                                   .query('SELECT id, email, name, subscriptionStatus, messagesUsed, lastMessageDate, usageResetTime FROM users WHERE id = @userId');
        const user = result.recordset[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            subscriptionStatus: user.subscriptionStatus,
            messagesUsed: user.messagesUsed,
            lastMessageDate: user.lastMessageDate,
            usageResetTime: user.usageResetTime
        });
    } catch (error) {
        console.error('Database error getting user profile:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Get usage limits
app.get('/api/usage', authenticateToken, async (req, res) => {
    try {
        const request = pool.request();
        const result = await request.input('userId', sql.Int, req.user.userId)
                                   .query('SELECT messagesUsed, usageResetTime, subscriptionStatus FROM users WHERE id = @userId');
        const user = result.recordset[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const now = new Date();
        const resetTime = user.usageResetTime ? new Date(user.usageResetTime) : null;

        let currentUsage = user.messagesUsed || 0;
        if (!resetTime || now >= resetTime) {
            currentUsage = 0;
            const newResetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            await pool.request()
                      .input('messagesUsed', sql.Int, 0)
                      .input('usageResetTime', sql.NVarChar, newResetTime.toISOString())
                      .input('userId', sql.Int, req.user.userId)
                      .query('UPDATE users SET messagesUsed = @messagesUsed, usageResetTime = @usageResetTime WHERE id = @userId');
            user.usageResetTime = newResetTime.toISOString(); // Update user object for response
        }

        const messageLimit = user.subscriptionStatus === 'pro' ? 5000 : 10;
        const lineLimit = user.subscriptionStatus === 'pro' ? 2500 : 250;

        res.json({
            messagesUsed: currentUsage,
            messageLimit: messageLimit,
            lineLimit: lineLimit,
            resetTime: user.usageResetTime
        });
    } catch (error) {
        console.error('Database error getting usage:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Message endpoint (main AI review logic)
app.post('/api/message', authenticateToken, async (req, res) => {
    try {
        const { codeSnippet, language, messageType = 'review', reviewFocus = [] } = req.body;
        const userId = req.user.userId;

        if (!codeSnippet || !language) {
            return res.status(400).json({ error: 'Code snippet and language are required' });
        }

        const request = pool.request();
        const userResult = await request.input('userId', sql.Int, userId)
                                         .query('SELECT messagesUsed, usageResetTime, subscriptionStatus FROM users WHERE id = @userId');
        const user = userResult.recordset[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const now = new Date();
        const resetTime = user.usageResetTime ? new Date(user.usageResetTime) : null;

        let currentUsage = user.messagesUsed || 0;
        if (!resetTime || now >= resetTime) {
            currentUsage = 0;
            const newResetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            await pool.request()
                      .input('messagesUsed', sql.Int, 0)
                      .input('usageResetTime', sql.NVarChar, newResetTime.toISOString())
                      .input('userId', sql.Int, userId)
                      .query('UPDATE users SET messagesUsed = @messagesUsed, usageResetTime = @usageResetTime WHERE id = @userId');
        }

        const messageLimit = user.subscriptionStatus === 'pro' ? 5000 : 10;
        const lineLimit = user.subscriptionStatus === 'pro' ? 2500 : 250;

        if (currentUsage >= messageLimit) {
            return res.status(429).json({
                error: 'Daily message limit reached',
                message: `You've used ${currentUsage}/${messageLimit} messages today. ${user.subscriptionStatus === 'free' ? 'Upgrade to Pro for more messages.' : 'Try again tomorrow.'}`
            });
        }

        const codeLines = codeSnippet.split('\n').length;
        if (codeLines > lineLimit) {
            return res.status(400).json({
                error: 'Code too long',
                message: `Code exceeds ${lineLimit} line limit. Current: ${codeLines} lines.`
            });
        }

        const aiModel = user.subscriptionStatus === 'pro' ? AZURE_OPENAI_O3_MINI_DEPLOYMENT_NAME : AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT_NAME;

        let aiResponse = '';
        try {
            const queryEmbedding = await getEmbedding(codeSnippet);
            const searchResults = await searchAzureAISearch(queryEmbedding, language, reviewFocus);
            const fullPrompt = constructReviewPrompt(codeSnippet, language, reviewFocus, searchResults);
            aiResponse = await callAzureOpenAI(fullPrompt, aiModel);

        } catch (aiError) {
            console.error('Azure OpenAI or AI Search error:', aiError.response ? aiError.response.data : aiError.message);
            if (aiError.response && aiError.response.status === 429) {
                return res.status(429).json({
                    error: 'AI service rate limit hit',
                    message: 'Our AI service is busy. Please try again in a moment.'
                });
            }
            return res.status(500).json({ error: 'Failed to get AI response' });
        }

        // Save message session
        await pool.request()
                    .input('userId', sql.Int, userId)
                    .input('language', sql.NVarChar, language)
                    .input('codeSnippet', sql.NVarChar(sql.MAX), codeSnippet)
                    .input('aiResponse', sql.NVarChar(sql.MAX), aiResponse)
                    .input('aiModel', sql.NVarChar, aiModel)
                    .input('messageType', sql.NVarChar, messageType)
                    .query('INSERT INTO review_sessions (userId, language, codeSnippet, aiResponse, aiModel, messageType) VALUES (@userId, @language, @codeSnippet, @aiResponse, @aiModel, @messageType)');

        // Update user's message count
        await pool.request()
                    .input('userId', sql.Int, userId)
                    .query('UPDATE users SET messagesUsed = messagesUsed + 1 WHERE id = @userId');

        res.json({
            response: JSON.parse(aiResponse),
            aiModel,
            language,
            messageType
        });

    } catch (error) {
        console.error('Message processing error:', error);
        res.status(500).json({ error: 'Message processing failed', details: error.message });
    }
});

// Feedback endpoint
app.post('/api/feedback', authenticateToken, async (req, res) => {
    try {
        const { type, rating, subject, message, email } = req.body;
        const userId = req.user.userId;

        if (!type || !subject || !message) {
            return res.status(400).json({ error: 'Type, subject, and message are required' });
        }

        await pool.request()
                    .input('userId', sql.Int, userId)
                    .input('type', sql.NVarChar, type)
                    .input('rating', sql.Int, rating || null)
                    .input('subject', sql.NVarChar, subject)
                    .input('message', sql.NVarChar(sql.MAX), message)
                    .input('email', sql.NVarChar, email || null)
                    .input('status', sql.NVarChar, 'open')
                    .query('INSERT INTO feedback (userId, type, rating, subject, message, email, status) VALUES (@userId, @type, @rating, @subject, @message, @email, @status)');

        res.json({
            message: 'Feedback submitted successfully'
        });
    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({ error: 'Failed to submit feedback', details: error.message });
    }
});

// Get message history
app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const request = pool.request();
        const result = await request.input('userId', sql.Int, req.user.userId)
                                   .query('SELECT id, language, aiResponse, aiModel, messageType, timestamp FROM review_sessions WHERE userId = @userId ORDER BY timestamp DESC OFFSET 0 ROWS FETCH NEXT 50 ROWS ONLY'); // SQL Server LIMIT equivalent

        const historyWithParsedResponses = result.recordset.map(row => ({
            ...row,
            aiResponse: JSON.parse(row.aiResponse)
        }));

        res.json(historyWithParsedResponses);
    } catch (error) {
        console.error('Database error getting history:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Stripe checkout endpoint
app.post('/api/stripe/checkout', authenticateToken, async (req, res) => {
    if (!STRIPE_PRO_PRICE_ID) {
        return res.status(500).json({ error: 'Stripe Pro Price ID not configured.' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: STRIPE_PRO_PRICE_ID, // Price ID from your Stripe Dashboard
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/cancel`,
            customer_email: req.user.email, // Pre-fill customer email
            client_reference_id: req.user.userId.toString(), // Link to your user ID
            metadata: {
                userId: req.user.userId, // Store userId in metadata for webhook verification
            },
        });
        res.json({ checkoutUrl: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
    }
});

// Stripe webhook endpoint
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout Session Completed:', session.id);
            const userIdFromSession = session.client_reference_id; // Retrieve user ID
            if (userIdFromSession) {
                await pool.request()
                            .input('subscriptionStatus', sql.NVarChar, 'pro')
                            .input('userId', sql.Int, userIdFromSession)
                            .query('UPDATE users SET subscriptionStatus = @subscriptionStatus WHERE id = @userId');
                console.log(`User ${userIdFromSession} upgraded to Pro.`);
            }
            break;
        case 'customer.subscription.updated':
            const subscription = event.data.object;
            console.log('Subscription Updated:', subscription.id);
            // This event can be used to handle renewals, cancellations, etc.
            // You might need to query your DB to find the user associated with this subscription.
            // For MVP, handling checkout.session.completed is often sufficient.
            break;
        case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object;
            console.log('Subscription Deleted:', deletedSubscription.id);
            // Find user by subscription ID and set subscriptionStatus to 'free' or 'cancelled'
            // This requires storing Stripe subscription IDs with your users.
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// --- Serve Static Frontend Files (ONLY IN PRODUCTION) ---
// This block ensures that in a production environment, the Express server
// serves the built React application.
// The path 'path.join(__dirname, '../dist')' assumes your frontend's 'dist' folder
// is one level up from the 'server' directory (i.e., at the PROJECT root).
// Verify this path after you run 'npm run build' in your frontend.
// This needs to be AFTER all API routes to avoid intercepting them.
if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = path.join(__dirname, '..', 'dist'); // Adjust if your 'dist' folder is elsewhere
    console.log(`Serving static files from: ${frontendBuildPath}`);
    app.use(express.static(frontendBuildPath));
}

// --- Catch-all handler: send back React's index.html file for production ---
// This MUST be the very last route definition in your Express app.
// It handles any GET request that hasn't been matched by an specific API route or static file.
// This needs to be AFTER all API routes and static file serving.
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')); // Adjust if your 'dist' folder is elsewhere
    });
}

// --- Helper Functions for AI Integration ---

// Function to get embedding from Azure OpenAI
async function getEmbedding(text) {
    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY || !AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME) {
        console.error("Azure OpenAI Embedding configuration missing.");
        throw new Error("Azure OpenAI Embedding configuration missing. Check environment variables.");
    }
    try {
        const response = await axios.post(
            `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME}/embeddings?api-version=2024-02-01`,
            { input: text },
            { headers: { 'api-key': AZURE_OPENAI_KEY } }
        );
        return response.data.data[0].embedding;
    } catch (error) {
        console.error("Error getting embedding from Azure OpenAI:", error.response ? error.response.data : error.message);
        if (error.response) {
            console.error("AI Search Response Data:", error.response.data);
        }
        throw new Error("Failed to get embedding from AI service.");
    }
}

// Function to search Azure AI Search
async function searchAzureAISearch(queryEmbedding, language, reviewFocus) {
    if (!AZURE_AI_SEARCH_ENDPOINT || !AZURE_AI_SEARCH_KEY || !AZURE_AI_SEARCH_INDEX_NAME) {
        console.warn("Azure AI Search configuration missing. RAG will be skipped.");
        return [];
    }

    const searchUrl = `${AZURE_AI_SEARCH_ENDPOINT}/indexes/${AZURE_AI_SEARCH_INDEX_NAME}/docs/search?api-version=2023-10-01-Preview`;

    let filter = `language eq '${language}'`;
    if (reviewFocus && reviewFocus.length > 0) {
        const focusFilters = reviewFocus.map(focus => `focus_area/any(f: f eq '${focus}')`).join(' or ');
        filter += ` and (${focusFilters})`;
    }

    try {
        const response = await axios.post(searchUrl, {
            vectors: [{
                value: queryEmbedding,
                fields: "contentVector",
                k: 5
            }],
            select: "content",
            filter: filter,
            queryType: "vector"
        }, {
            headers: {
                'api-key': AZURE_AI_SEARCH_KEY,
                'Content-Type': 'application/json'
            }
        });
        return response.data.value.map(doc => doc.content);
    } catch (error) {
        console.error("Error searching Azure AI Search:", error.response ? error.response.data : error.message);
        if (error.response) {
            console.error("AI Search Response Data:", error.response.data);
        }
        return [];
    }
}

// Function to call Azure OpenAI generative model
async function callAzureOpenAI(prompt, modelDeploymentName) {
    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY) {
        console.error("Azure OpenAI configuration missing.");
        throw new Error("Azure OpenAI configuration missing. Check environment variables.");
    }
    try {
        const response = await axios.post(
            `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${modelDeploymentName}/chat/completions?api-version=2024-02-01`,
            { messages: [{ role: "user", content: prompt }] },
            { headers: { 'api-key': AZURE_OPENAI_KEY } }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling Azure OpenAI:", error.response ? error.response.data : error.message);
        if (error.response) {
            console.error("OpenAI Response Data:", error.response.data);
        }
        throw error;
    }
}

// Construct the full prompt for the AI review
function constructReviewPrompt(codeSnippet, language, reviewFocus, ragContextChunks) {
    let focusInstruction = '';
    if (reviewFocus && reviewFocus.length > 0) {
        focusInstruction = `Focus your review on: ${reviewFocus.join(', ')}.`;
    }

    let ragContext = '';
    if (ragContextChunks && ragContextChunks.length > 0) {
        ragContext = "\n\n--- Relevant Documentation/Best Practices (from RAG): ---\n" +
                     ragContextChunks.map((chunk, index) => `Chunk ${index + 1}:\n${chunk}`).join('\n\n') +
                     "\n------------------------------------------------------\n";
    }

    let languageShortName = language.split(' ')[0].toLowerCase();
    if (languageShortName === 'javascript' || languageShortName === 'typescript') languageShortName = 'js';
    if (languageShortName === 'html/css') languageShortName = 'html';


    const prompt = `You are an expert Senior Software Engineer with a keen eye for detail and a passion for writing clean, efficient, secure, and maintainable code. Your task is to perform a comprehensive code review of the provided code snippet.

**Your Review Should Focus On:**
1.  **Potential Bugs/Errors:** Identify any syntax errors, logical flaws, or common pitfalls.
2.  **Readability & Maintainability:** Suggest improvements for clarity, structure, naming conventions, and comments.
3.  **Performance:** Point out any obvious performance bottlenecks or inefficient patterns.
4.  **Security (Basic):** Highlight common security vulnerabilities or insecure practices.
5.  **Best Practices & Idiomatic Code:** Recommend adherence to standard practices for the specified language/framework.
6.  **Clarity & Explanations:** For each point, explain *why* it's an issue and provide *actionable suggestions* for improvement, including revised code snippets if applicable.

**Instructions:**
* Be constructive, polite, and educational.
* Do not simply rewrite the code; explain the reasoning behind your suggestions.
* If you find no issues, state that the code looks good and adheres to best practices.
* **Crucially, leverage the "Relevant Documentation/Best Practices" provided below to inform your review and cite sources where appropriate.**
* **Format your response as a JSON string** with the following structure. Ensure the JSON is valid and complete. For code examples within JSON, use escaped newlines \`\\n\` and escaped backticks \`\\\`\`.
  \`\`\`json
  {
    "summary": "Brief summary of the review.",
    "issues": [
      {
        "title": "Issue Title",
        "explanation": "Explanation of the issue.",
        "suggestion": "Actionable suggestion for improvement.",
        "codeExample": "Optional: \`\`\`${languageShortName}\\n[Revised code snippet]\\n\`\`\`"
      }
    ],
    "suggestions": [
      {
        "title": "Suggestion Title",
        "explanation": "Explanation of the suggestion.",
        "suggestion": "Actionable suggestion for improvement.",
        "codeExample": "Optional: \`\`\`${languageShortName}\\n[Revised code snippet]\\n\`\`\`"
      }
    ],
    "score": "Optional: A numerical score for code quality (e.g., 1-100).",
    "language": "${language}",
    "aiModel": "${aiModel}",
    "messageType": "${messageType}",
    "linesAnalyzed": ${codeSnippet.split('\\n').length}
  }
  \`\`\`

---

**Programming Language/Framework:** ${language} ${focusInstruction}

**Code to Review:**
\`\`\`${languageShortName}\n${codeSnippet}\n\`\`\`

${ragContext}

**Your Detailed Code Review (JSON format):**
`;
    return prompt;
}

// Export the Express app for Azure Functions Custom Handler
module.exports = app;
