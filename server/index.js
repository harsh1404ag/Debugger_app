const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs'); // Keep if needed for future password auth, otherwise can remove
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

// Import axios for making HTTP requests to Azure OpenAI/AI Search
const axios = require('axios');
const Stripe = require('stripe'); // Import Stripe library

const app = express();
const PORT = process.env.PORT || 3001;

// --- Azure OpenAI & AI Search Configuration ---
// Ensure these environment variables are set in your Azure Function App settings
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT_NAME || 'gpt-4o-mini';
const AZURE_OPENAI_O3_MINI_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_O3_MINI_DEPLOYMENT_NAME || 'o3-mini';
const AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME || 'text-embedding-3-small';

const AZURE_AI_SEARCH_ENDPOINT = process.env.AZURE_AI_SEARCH_ENDPOINT;
const AZURE_AI_SEARCH_KEY = process.env.AZURE_AI_SEARCH_KEY;
const AZURE_AI_SEARCH_INDEX_NAME = process.env.AZURE_AI_SEARCH_INDEX_NAME || 'code-docs'; // Default search index name for your RAG data

// --- Stripe Configuration ---
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID; // e.g., 'price_12345' from Stripe Dashboard
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Your frontend URL for Stripe redirects

// Middleware
app.use(cors()); // Enable CORS for frontend-backend communication
// For Stripe webhooks, we need raw body, so apply express.json conditionally
app.use((req, res, next) => {
    if (req.originalUrl === '/api/stripe/webhook') {
        next(); // Skip JSON parsing for webhook
    } else {
        express.json({ limit: '10mb' })(req, res, next); // Parse JSON request bodies, increase limit for code snippets
    }
});


// --- Database setup (SQLite) ---
// Note: For production on Azure, you will replace this with Azure SQL Database or Supabase integration
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            googleId TEXT UNIQUE,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            subscriptionStatus TEXT DEFAULT 'free',
            messagesUsed INTEGER DEFAULT 0,
            lastMessageDate TEXT,
            usageResetTime TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Review sessions table (renamed from message_sessions for clarity in context)
    db.run(`
        CREATE TABLE IF NOT EXISTS review_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            language TEXT NOT NULL,
            codeSnippet TEXT NOT NULL,
            aiResponse TEXT,
            aiModel TEXT DEFAULT 'gpt-4o-mini',
            messageType TEXT DEFAULT 'review',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `);

    // Feedback table
    db.run(`
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            type TEXT NOT NULL,
            rating INTEGER,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            email TEXT,
            status TEXT DEFAULT 'open',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `);
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

// --- API Routes ---

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// User registration/login (simplified for demo)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, name } = req.body;

        // Check if user exists
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
            if (err) {
                console.error('Database error during login:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                // Create new user
                db.run(
                    'INSERT INTO users (email, name) VALUES (?, ?)',
                    [email, name],
                    function(err) {
                        if (err) {
                            console.error('Failed to create user:', err);
                            return res.status(500).json({ error: 'Failed to create user' });
                        }

                        const token = jwt.sign(
                            { userId: this.lastID, email },
                            process.env.JWT_SECRET || 'fallback-secret',
                            { expiresIn: '24h' }
                        );

                        res.json({
                            token,
                            user: {
                                id: this.lastID,
                                email,
                                name,
                                subscriptionStatus: 'free',
                                messagesUsed: 0
                            }
                        });
                    }
                );
            } else {
                // Login existing user
                const token = jwt.sign(
                    { userId: user.id, email: user.email },
                    process.env.JWT_SECRET || 'fallback-secret',
                    { expiresIn: '24h' }
                );

                res.json({
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        subscriptionStatus: user.subscriptionStatus,
                        messagesUsed: user.messagesUsed
                    }
                });
            }
        });
    } catch (error) {
        console.error('Authentication failed:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Get user profile
app.get('/api/user', authenticateToken, (req, res) => {
    db.get('SELECT * FROM users WHERE id = ?', [req.user.userId], (err, user) => {
        if (err) {
            console.error('Database error getting user profile:', err);
            return res.status(500).json({ error: 'Database error' });
        }

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
    });
});

// Get usage limits
app.get('/api/usage', authenticateToken, (req, res) => {
    db.get('SELECT * FROM users WHERE id = ?', [req.user.userId], (err, user) => {
        if (err) {
            console.error('Database error getting usage:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const now = new Date();
        const resetTime = user.usageResetTime ? new Date(user.usageResetTime) : null;

        // Reset usage if 24 hours have passed
        let currentUsage = user.messagesUsed || 0;
        if (!resetTime || now >= resetTime) {
            currentUsage = 0; // Reset usage
            const newResetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Set new reset time for 24h from now
            db.run(
                'UPDATE users SET messagesUsed = 0, usageResetTime = ? WHERE id = ?',
                [newResetTime.toISOString(), req.user.userId],
                (updateErr) => {
                    if (updateErr) console.error('Failed to reset user usage:', updateErr);
                }
            );
        }

        // --- Updated Usage Limits based on our plan ---
        const messageLimit = user.subscriptionStatus === 'pro' ? 5000 : 10; // High limit for Pro (effectively unlimited)
        const lineLimit = user.subscriptionStatus === 'pro' ? 2500 : 250; // Max lines per review

        res.json({
            messagesUsed: currentUsage,
            messageLimit: messageLimit,
            lineLimit: lineLimit,
            resetTime: user.usageResetTime ? user.usageResetTime : new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // Provide a reset time
        });
    });
});

// Message endpoint (main AI review logic)
app.post('/api/message', authenticateToken, async (req, res) => {
    try {
        const { codeSnippet, language, messageType = 'review', reviewFocus = [] } = req.body; // Added reviewFocus
        const userId = req.user.userId;

        if (!codeSnippet || !language) {
            return res.status(400).json({ error: 'Code snippet and language are required' });
        }

        // Get user to check subscription and limits
        db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
            if (err) {
                console.error('Database error getting user for message:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // --- Usage Limit Check & Reset ---
            const now = new Date();
            const resetTime = user.usageResetTime ? new Date(user.usageResetTime) : null;

            let currentUsage = user.messagesUsed || 0;
            if (!resetTime || now >= resetTime) {
                currentUsage = 0;
                const newResetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                db.run(
                    'UPDATE users SET messagesUsed = 0, usageResetTime = ? WHERE id = ?',
                    [newResetTime.toISOString(), userId]
                );
            }

            const messageLimit = user.subscriptionStatus === 'pro' ? 5000 : 10; // High limit for Pro
            const lineLimit = user.subscriptionStatus === 'pro' ? 2500 : 250; // Max lines per review

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
            // --- End Usage Limit Check ---

            // Determine AI model based on subscription
            const aiModel = user.subscriptionStatus === 'pro' ? AZURE_OPENAI_O3_MINI_DEPLOYMENT_NAME : AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT_NAME;

            let aiResponse = '';
            try {
                // --- RAG & Azure OpenAI Integration ---
                // 1. Get embedding for the user's code snippet
                const queryEmbedding = await getEmbedding(codeSnippet);

                // 2. Search Azure AI Search for relevant documentation
                const searchResults = await searchAzureAISearch(queryEmbedding, language, reviewFocus);

                // 3. Construct the prompt for the generative AI model
                const fullPrompt = constructReviewPrompt(codeSnippet, language, reviewFocus, searchResults);

                // 4. Call Azure OpenAI Service
                aiResponse = await callAzureOpenAI(fullPrompt, aiModel);

            } catch (aiError) {
                console.error('Azure OpenAI or AI Search error:', aiError.response ? aiError.response.data : aiError.message);
                // Handle 429 (rate limit) specifically
                if (aiError.response && aiError.response.status === 429) {
                    return res.status(429).json({
                        error: 'AI service rate limit hit',
                        message: 'Our AI service is busy. Please try again in a moment.'
                    });
                }
                return res.status(500).json({ error: 'Failed to get AI response' });
            }

            // Save message session
            db.run(
                'INSERT INTO review_sessions (userId, language, codeSnippet, aiResponse, aiModel, messageType) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, language, codeSnippet, aiResponse, aiModel, messageType],
                function(err) {
                    if (err) {
                        console.error('Failed to save message session:', err);
                        return res.status(500).json({ error: 'Failed to save message session' });
                    }

                    // Update user's message count
                    db.run(
                        'UPDATE users SET messagesUsed = messagesUsed + 1 WHERE id = ?',
                        [userId]
                    );

                    res.json({
                        messageId: this.lastID,
                        response: JSON.parse(aiResponse), // Assuming AI response is JSON string
                        aiModel,
                        language,
                        messageType
                    });
                }
            );
        });
    } catch (error) {
        console.error('Message processing error:', error);
        res.status(500).json({ error: 'Message processing failed' });
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

        db.run(
            'INSERT INTO feedback (userId, type, rating, subject, message, email) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, type, rating || null, subject, message, email || null],
            function(err) {
                if (err) {
                    console.error('Failed to save feedback:', err);
                    return res.status(500).json({ error: 'Failed to save feedback' });
                }

                res.json({
                    feedbackId: this.lastID,
                    message: 'Feedback submitted successfully'
                });
            }
        );
    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// Get message history
app.get('/api/history', authenticateToken, (req, res) => {
    db.all(
        'SELECT id, language, aiResponse, aiModel, messageType, timestamp FROM review_sessions WHERE userId = ? ORDER BY timestamp DESC LIMIT 50',
        [req.user.userId],
        (err, rows) => {
            if (err) {
                console.error('Database error getting history:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Parse aiResponse from string to JSON object for each row
            const historyWithParsedResponses = rows.map(row => ({
                ...row,
                aiResponse: JSON.parse(row.aiResponse) // Assuming it's stored as JSON string
            }));

            res.json(historyWithParsedResponses);
        }
    );
});

// Stripe checkout endpoint
app.post('/api/stripe/checkout', authenticateToken, async (req, res) => {
    // TODO: Ensure 'stripe' npm package is installed: npm install stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Already imported at top

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
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Stripe webhook endpoint
// Use express.raw() to get the raw body for Stripe signature verification
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
                db.run('UPDATE users SET subscriptionStatus = ? WHERE id = ?', ['pro', userIdFromSession], (err) => {
                    if (err) console.error('Failed to update user subscription on checkout.session.completed:', err);
                    else console.log(`User ${userIdFromSession} upgraded to Pro.`);
                });
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

// --- IMPORTANT: Order of Routes ---
// 1. All specific API routes (like /api/health, /api/auth, /api/message, etc.)
// 2. Static file serving (if in production)
// 3. Catch-all route for frontend (LAST)

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
        throw new Error("Failed to get embedding from AI service.");
    }
}

// Function to search Azure AI Search
async function searchAzureAISearch(queryEmbedding, language, reviewFocus) {
    if (!AZURE_AI_SEARCH_ENDPOINT || !AZURE_AI_SEARCH_KEY || !AZURE_AI_SEARCH_INDEX_NAME) {
        console.warn("Azure AI Search configuration missing. RAG will be skipped.");
        return []; // Return empty if not configured or for development
    }

    const searchUrl = `${AZURE_AI_SEARCH_ENDPOINT}/indexes/${AZURE_AI_SEARCH_INDEX_NAME}/docs/search?api-version=2023-10-01-Preview`;

    // Construct filter based on language and reviewFocus (metadata)
    let filter = `language eq '${language}'`; // Assuming 'language' is a filterable field in your AI Search index
    if (reviewFocus && reviewFocus.length > 0) {
        // Assuming 'focus_area' is a filterable collection field in your AI Search index
        const focusFilters = reviewFocus.map(focus => `focus_area/any(f: f eq '${focus}')`).join(' or ');
        filter += ` and (${focusFilters})`;
    }

    try {
        const response = await axios.post(searchUrl, {
            vectors: [{
                value: queryEmbedding,
                fields: "contentVector", // Assuming your vector field in AI Search is named 'contentVector'
                k: 5 // Retrieve top 5 relevant chunks
            }],
            select: "content", // Select the actual text content of the chunk
            filter: filter,
            queryType: "vector" // Specify vector search
        }, {
            headers: {
                'api-key': AZURE_AI_SEARCH_KEY,
                'Content-Type': 'application/json'
            }
        });
        return response.data.value.map(doc => doc.content); // Return array of content strings
    } catch (error) {
        console.error("Error searching Azure AI Search:", error.response ? error.response.data : error.message);
        // Log the full error response from AI Search for debugging
        if (error.response) {
            console.error("AI Search Response Data:", error.response.data);
        }
        return []; // Return empty on error, so AI still tries to respond without RAG context
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
        // Log the full error response from OpenAI for debugging
        if (error.response) {
            console.error("OpenAI Response Data:", error.response.data);
        }
        throw error; // Re-throw to be caught by the message endpoint
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

    // Determine short language name for code blocks in JSON output
    let languageShortName = language.split(' ')[0].toLowerCase();
    if (languageShortName === 'javascript' || languageShortName === 'typescript') languageShortName = 'js';
    if (languageShortName === 'html/css') languageShortName = 'html'; // Or 'css' depending on primary focus


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

// Start server

module.exports = app;