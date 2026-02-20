# Project Folder Structure

Complete folder structure for AI Code Mentor project:

```
ai-code-reviewer/
│
├── README.md                      # Complete documentation
├── QUICKSTART.md                  # Quick start guide
├── sample-test.js                 # Sample code for testing
│
├── backend/                       # Node.js Express Backend
│   ├── server.js                 # Main Express server
│   ├── package.json              # Backend dependencies
│   ├── .env.example              # Environment variables template
│   ├── .gitignore               # Git ignore rules
│   │
│   ├── routes/
│   │   └── review.js            # API route handlers
│   │
│   └── services/
│       └── aiService.js         # OpenAI integration service
│
├── extension/                    # VS Code Extension
│   ├── package.json             # Extension manifest & dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   ├── .eslintrc.js             # ESLint configuration
│   ├── .gitignore              # Git ignore rules
│   ├── .vscodeignore           # Extension packaging rules
│   │
│   ├── src/                     # Source code
│   │   ├── extension.ts        # Extension entry point
│   │   ├── types.ts            # TypeScript type definitions
│   │   │
│   │   ├── api/
│   │   │   └── client.ts       # Backend API client
│   │   │
│   │   ├── commands/
│   │   │   └── reviewCommand.ts # Review command handler
│   │   │
│   │   └── webview/
│   │       └── panel.ts        # Webview panel UI
│   │
│   └── out/                     # Compiled JavaScript (generated)
│       ├── extension.js
│       ├── types.js
│       ├── api/
│       ├── commands/
│       └── webview/
│
└── frontend/                     # (Optional - not used in this implementation)
    └── (React UI - future enhancement)
```

## File Descriptions

### Root Level
- **README.md**: Complete project documentation
- **QUICKSTART.md**: Simplified setup guide
- **sample-test.js**: Test file with intentional code issues

### Backend Files
- **server.js**: Express server setup, middleware, routes
- **routes/review.js**: API endpoints for code review
- **services/aiService.js**: OpenAI API integration logic
- **package.json**: Dependencies (express, cors, openai, etc.)
- **.env.example**: Template for environment variables

### Extension Files
- **src/extension.ts**: Extension activation/deactivation
- **src/types.ts**: TypeScript interfaces
- **src/api/client.ts**: HTTP client for backend communication
- **src/commands/reviewCommand.ts**: Command execution logic
- **src/webview/panel.ts**: Webview UI generation
- **package.json**: Extension manifest, commands, settings
- **tsconfig.json**: TypeScript compiler options

## Key Components

### Backend Components
1. **Server** (server.js)
   - HTTP server on port 3000
   - CORS enabled
   - Request logging
   - Error handling

2. **Routes** (routes/review.js)
   - POST /api/review - Code analysis endpoint
   - GET /api/review/status - Service status

3. **AI Service** (services/aiService.js)
   - OpenAI API integration
   - Prompt engineering
   - Response parsing

### Extension Components
1. **Extension** (extension.ts)
   - Activation/deactivation
   - Command registration

2. **Command** (commands/reviewCommand.ts)
   - File reading
   - Backend communication
   - Progress notifications
   - Error handling

3. **Webview** (webview/panel.ts)
   - HTML generation
   - Styling
   - Interactive UI
   - Copy functionality

4. **API Client** (api/client.ts)
   - HTTP requests
   - Error handling
   - Health checks

## Data Flow

```
User Action (Right-click) 
    ↓
ReviewCommand.execute()
    ↓
Read active file content
    ↓
ApiClient.reviewCode()
    ↓
POST https://ai-code-mentor-p61w.onrender.com/api/review
    ↓
Backend routes/review.js
    ↓
services/aiService.js
    ↓
OpenAI API
    ↓
Parse JSON response
    ↓
Return to extension
    ↓
ReviewPanel.createOrShow()
    ↓
Display results in webview
```

## Technology Stack

**Backend**:
- Node.js + Express
- OpenAI API (GPT-4)
- CORS, Helmet (security)
- dotenv (config)

**Extension**:
- TypeScript
- VS Code Extension API
- Axios (HTTP)
- Webview API (UI)

**Development**:
- ESLint (linting)
- TypeScript Compiler
- npm (package management)
