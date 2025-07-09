# AI Code Reviewer

A full-stack web application that provides instant, AI-powered code reviews to help developers write better code faster.

## Features

### Frontend
- **Modern React Interface**: Built with React, TypeScript, and Tailwind CSS
- **Animated Chat Interface**: Smooth, responsive UI with real-time interactions
- **Dark Theme**: Professional dark theme optimized for developer productivity
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Command Palette**: Quick access to review functions with keyboard shortcuts

### Backend
- **RESTful API**: Express.js server with JWT authentication
- **SQLite Database**: Local development with easy migration to PostgreSQL/Supabase
- **User Management**: Registration, authentication, and subscription handling
- **Usage Tracking**: Free tier limitations and Pro plan features

### AI Integration (Ready for Implementation)
- **Azure OpenAI**: GPT-4o Mini integration for code analysis
- **Azure AI Search**: RAG implementation for enhanced code review insights
- **Multi-language Support**: JavaScript, Python, Java, C#, Go, and more

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

3. **Start development servers**
```bash
# Start frontend (in one terminal)
npm run dev

# Start backend (in another terminal)
cd server
npm run dev
```

4. **Open your browser**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Environment Configuration

### Required for Production
```env
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-azure-openai-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini

# Azure AI Search (for RAG)
AZURE_AI_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_AI_SEARCH_KEY=your-search-admin-key

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PRO_PRICE_ID=price_your-pro-plan-price-id
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### Optional for Enhanced Features
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Production Database
DATABASE_URL=postgresql://user:password@host:port/database
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login/registration
- `GET /api/user` - Get user profile

### Code Review
- `POST /api/message` - Submit code for analysis
- `GET /api/history` - Get review history
- `GET /api/usage` - Get current usage limits

### Feedback
- `POST /api/feedback` - Submit user feedback
### Payments
- `POST /api/stripe/checkout` - Create Stripe checkout session ($15/month)
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Pricing Plans

### Free Plan
- 10 messages per day
- Max 250 lines per message
- Basic review focus
- GPT-4o Mini model
- Community support

### Pro Plan ($15/month)
- 50 messages per day
- Up to 1000 lines per message
- Advanced review focus
- GPT-o3 Mini model
- Security & Performance analysis
- Message history saved
- Priority support

## Azure Integration Guide

### 1. Azure OpenAI Setup
1. Create an Azure OpenAI resource
2. Deploy GPT-4o Mini model
3. Get endpoint and API key
4. Update environment variables

### 2. Azure AI Search Setup (RAG)
1. Create Azure AI Search service
2. Create knowledge base index
3. Upload code review best practices documents
4. Configure search integration

### 3. Stripe Integration
1. Create Stripe account
2. Set up Pro plan product and pricing
3. Configure webhook endpoints
4. Test payment flow

## Deployment

### Frontend (Azure Static Web Apps)
```bash
# Build for production
npm run build

# Deploy to Azure Static Web Apps
# Follow Azure portal instructions
```

### Backend (Azure App Service)
```bash
cd server
npm run start

# Configure environment variables in Azure App Service
# Set up Azure SQL Database connection
# Configure Azure Storage for RAG data
# Configure CORS for your domain
```

### Database Setup (Azure SQL Database)
```sql
-- Run these commands in Azure SQL Database
-- Tables will be created automatically by the application
-- Ensure connection string is configured in environment variables
```

### Storage Setup (Azure Storage)
```bash
# Create storage account and container for RAG data
# Configure connection string in environment variables
# Upload knowledge base documents to container
```

## Development

### Project Structure
```
├── src/
│   ├── components/ui/          # Reusable UI components
│   ├── pages/                  # Page components
│   ├── lib/                   # Utility functions
│   └── hooks/                 # Custom React hooks
├── server/
│   ├── index.js              # Express server
│   ├── package.json          # Backend dependencies
│   └── database.sqlite       # Local database
└── README.md
```

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, SQLite/PostgreSQL
- **Authentication**: JWT, Google OAuth (optional)
- **Payments**: Stripe
- **AI**: Azure OpenAI, Azure AI Search
- **Deployment**: Azure Static Web Apps, Azure App Service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- GitHub Issues
- Email: support@codereview-ai.com
- Documentation: [docs.codereview-ai.com]

---

Built with ❤️ for developers who want to write better code faster.