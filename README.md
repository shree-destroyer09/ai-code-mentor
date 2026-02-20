
<p align="center">
  <img src="extension/icon.png" alt="AI Code Mentor Logo" width="96" />
</p>

# AI Code Mentor

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=aicodementor.ai-code-mentor">
    <img src="https://img.shields.io/visual-studio-marketplace/v/aicodementor.ai-code-mentor?label=VS%20Code%20Marketplace" alt="VS Code Marketplace" />
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=aicodementor.ai-code-mentor">
    <img src="https://img.shields.io/visual-studio-marketplace/d/aicodementor.ai-code-mentor?color=blue" alt="Installs" />
  </a>
  <a href="https://github.com/shree-destroyer09/ai-code-mento/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/shree-destroyer09/ai-code-mento" alt="License" />
  </a>
</p>

> 🚀 **Production-ready VS Code extension for AI-powered code analysis**

AI Code Mentor is a comprehensive VS Code extension that analyzes your code using artificial intelligence to provide:

- 🐛 **Bug Detection** - Identify logical errors and potential crashes
- 🔒 **Security Analysis** - Find vulnerabilities and security risks
- 💡 **Code Improvements** - Get suggestions for better code quality
- 🎓 **Teaching Tips** - Learn best practices and patterns
- ✨ **Refactored Code** - See improved versions of your code
- 📊 **Quality Rating** - Get an objective 1-10 code quality score

---

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#1-backend-setup)
  - [Extension Setup](#2-extension-setup)
- [Usage](#usage)
- [Testing](#testing)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [License](#license)

---

## ✨ Features

### Comprehensive Code Analysis

- **Bug Detection**: Identifies logical errors, edge cases, and potential runtime issues
- **Security Scanning**: Detects SQL injection, XSS, authentication issues, and more
- **Performance Insights**: Suggests optimizations for better performance
- **Readability Improvements**: Recommendations for cleaner, more maintainable code
- **Educational Feedback**: Beginner-friendly explanations and teaching moments
- **Code Refactoring**: Shows improved versions with detailed comments

### Developer Experience

- **One-Click Analysis**: Right-click in any file and select "Review Code with AI"
- **Beautiful UI**: Clean, modern webview panel with organized sections
- **Fast & Reliable**: Efficient backend processing with timeout protection
- **Language Support**: Works with JavaScript, Python, TypeScript, Java, and more

---

## 📁 Project Structure

```
ai-code-reviewer/
├── backend/                 # Node.js Express backend
│   ├── server.js           # Main server file
│   ├── routes/
│   │   └── review.js       # API routes
│   ├── services/
│   │   └── aiService.js    # OpenAI integration
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── extension/               # VS Code extension
│   ├── src/
│   │   ├── extension.ts    # Extension entry point
│   │   ├── types.ts        # TypeScript interfaces
│   │   ├── api/
│   │   │   └── client.ts   # Backend API client
│   │   ├── commands/
│   │   │   └── reviewCommand.ts  # Command handler
│   │   └── webview/
│   │       └── panel.ts    # Webview UI
│   ├── package.json
│   ├── tsconfig.json
│   └── .eslintrc.js
│
├── sample-test.js          # Sample file for testing
└── README.md               # This file
```

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **VS Code** (v1.85.0 or higher) - [Download](https://code.visualstudio.com/)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

---

## 📦 Installation

### Clone or Download the Project

If you haven't already, ensure you have the project files:

```bash
cd C:\Users\Aditya\OneDrive\Desktop\ai-code-reviewer
```

---

## 🚀 Setup Instructions

### 1. Backend Setup

#### Step 1.1: Navigate to Backend Directory

```bash
cd backend
```

#### Step 1.2: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `openai` - OpenAI API client
- `body-parser` - Request body parsing
- `helmet` - Security middleware

#### Step 1.3: Configure Environment Variables

Create a `.env` file by copying the example:

```bash
copy .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_actual_openai_api_key_here
PORT=3000
NODE_ENV=development
OPENAI_MODEL=gpt-4-turbo-preview
MAX_TOKENS=2000
TEMPERATURE=0.7
```

⚠️ **Important**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

#### Step 1.4: Start the Backend Server

```bash
npm start
```

You should see:

```
===========================================
🚀 AI Code Mentor Backend Server Started
📍 Server running on http://localhost:3000
🏥 Health check: http://localhost:3000/health
📝 Review endpoint: https://ai-code-mentor-p61w.onrender.com/api/review
===========================================
✅ OpenAI API key configured
```

✅ **Backend is ready!** Keep this terminal running.

---

### 2. Extension Setup

Open a **new terminal** window/tab:

#### Step 2.1: Navigate to Extension Directory

```bash
cd extension
```

#### Step 2.2: Install Dependencies

```bash
npm install
```

This will install:
- TypeScript compiler
- VS Code extension types
- Axios for HTTP requests
- ESLint for code quality

#### Step 2.3: Compile TypeScript

```bash
npm run compile
```

This compiles the TypeScript files to JavaScript in the `out/` directory.

#### Step 2.4: Launch Extension in VS Code

1. Open the **extension** folder in VS Code:
   ```bash
   code .
   ```

2. Press `F5` or click **Run > Start Debugging**

3. A new VS Code window will open with the extension loaded (Extension Development Host)

✅ **Extension is ready!**

---

## 🎯 Usage

### Method 1: Context Menu (Right-Click)

1. Open any code file in the Extension Development Host window
2. Right-click in the editor
3. Select **"Review Code with AI"**

### Method 2: Command Palette

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Review Code with AI"
3. Press Enter

### What Happens Next

1. ⏳ The extension reads your file content
2. 🔄 Sends code to the backend for AI analysis
3. 🤖 AI processes the code (takes 5-20 seconds)
4. 📊 Results appear in a sidebar webview panel

### Understanding the Results

The webview displays:

- **📝 Summary** - Overview of your code
- **⭐ Rating** - Quality score from 1-10
- **🐛 Bugs** - Issues found with line numbers and fixes
- **🔒 Security** - Vulnerabilities with severity levels
- **💡 Improvements** - Suggestions categorized by type
- **🎓 Teaching Tips** - Educational insights
- **✨ Refactored Code** - Improved version with comments

---

## 🧪 Testing

### Test with Sample File

A sample test file is included at the root of the project:

1. In the Extension Development Host window, open `sample-test.js`:
   ```
   File > Open File > C:\Users\Aditya\OneDrive\Desktop\ai-code-reviewer\sample-test.js
   ```

2. Right-click in the editor and select **"Review Code with AI"**

3. Wait for analysis (5-20 seconds)

4. View the results in the webview panel

### Expected Results

The sample file contains intentional issues:
- ❌ Null reference errors
- ❌ Off-by-one loop error
- ⚠️ SQL injection vulnerability
- ⚠️ Complex nested conditions
- ⚠️ Inefficient O(n²) algorithm
- ⚠️ Missing error handling
- ⚠️ Magic numbers

---

## ⚙️ Configuration

### Extension Settings

Configure the extension in VS Code settings:

1. Open Settings: `File > Preferences > Settings`
2. Search for "AI Code Mentor"

Available settings:

```json
{
  "aiCodeMentor.backendUrl": "http://localhost:3000",
  "aiCodeMentor.timeout": 30000
}
```

- **backendUrl**: Backend server URL (default: `http://localhost:3000`)
- **timeout**: Request timeout in milliseconds (default: `30000`)

### Backend Configuration

Edit `backend/.env`:

```env
# API Key (Required)
OPENAI_API_KEY=your_key_here

# Server Settings
PORT=3000
NODE_ENV=development

# AI Model Settings
OPENAI_MODEL=gpt-4-turbo-preview
MAX_TOKENS=2000
TEMPERATURE=0.7
```

**Available Models**:
- `gpt-4-turbo-preview` - Best quality (recommended)
- `gpt-4` - High quality
- `gpt-3.5-turbo` - Faster, cheaper

---

## 🔧 Troubleshooting

### Backend Won't Start

**Problem**: Backend fails to start or shows errors

**Solutions**:
1. Verify Node.js version: `node --version` (should be v18+)
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check if port 3000 is available: `netstat -ano | findstr :3000`
4. Verify `.env` file exists and has `OPENAI_API_KEY`

### "Cannot connect to backend" Error

**Problem**: Extension can't reach the backend

**Solutions**:
1. Ensure backend is running (`npm start` in backend folder)
2. Check backend URL in VS Code settings
3. Test backend manually: Open `http://localhost:3000/health` in browser
4. Check firewall settings

### "Invalid API Key" Error

**Problem**: OpenAI API key is invalid

**Solutions**:
1. Verify API key in `backend/.env`
2. Ensure no extra spaces or quotes
3. Generate new key at [OpenAI Platform](https://platform.openai.com/api-keys)
4. Check API key has credits/billing enabled

### Extension Not Loading

**Problem**: Extension doesn't appear in Development Host

**Solutions**:
1. Recompile: `npm run compile`
2. Check for TypeScript errors: `npm run lint`
3. Restart VS Code and press F5 again
4. Check VS Code console for errors (Help > Toggle Developer Tools)

### Request Timeout

**Problem**: Analysis takes too long

**Solutions**:
1. Increase timeout in settings (e.g., 60000 for 60 seconds)
2. Try smaller files first
3. Switch to faster model (`gpt-3.5-turbo`)
4. Check internet connection

---

## 🛠️ Development

### Watch Mode

For active development, use watch mode to auto-compile on changes:

```bash
cd extension
npm run watch
```

### Debugging

1. **Backend**: Add breakpoints in VS Code, launch with F5
2. **Extension**: Breakpoints work in Extension Development Host

### Making Changes

After modifying code:

1. **Backend**: Restart server (Ctrl+C, then `npm start`)
2. **Extension**: Reload window (Ctrl+R in Extension Development Host)

### Building for Production

To create a `.vsix` package:

```bash
cd extension
npm install -g @vscode/vsce
vsce package
```

---

## 📝 API Documentation

### Backend Endpoints

#### POST /api/review

Analyzes code and returns structured feedback.

**Request**:
```json
{
  "code": "function example() { ... }",
  "language": "javascript"
}
```

**Response**:
```json
{
  "summary": "This code...",
  "rating": 7,
  "bugs": [
    {
      "line": 10,
      "issue": "Potential null reference",
      "fix": "Add null check"
    }
  ],
  "security": [
    {
      "severity": "high",
      "issue": "SQL injection vulnerability",
      "recommendation": "Use parameterized queries"
    }
  ],
  "improvements": [
    {
      "category": "Performance",
      "suggestion": "Use Set instead of Array",
      "impact": "Reduces complexity from O(n²) to O(n)"
    }
  ],
  "teachingTips": [
    "Always validate user input..."
  ],
  "refactoredCode": "// Improved version\nfunction example() { ... }"
}
```

#### GET /health

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "message": "AI Code Mentor Backend is running",
  "timestamp": "2026-02-20T10:30:00.000Z"
}
```

---

## 🎓 Learning Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## 📄 License

MIT License - feel free to use and modify as needed.

---

## 🤝 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review backend logs in the terminal
3. Check VS Code Developer Console (Help > Toggle Developer Tools)
4. Ensure all prerequisites are installed

---

## 🎉 Success!

You now have a fully functional AI Code Mentor extension!

**Quick Start Checklist**:
- ✅ Backend running on http://localhost:3000
- ✅ Extension loaded in VS Code Development Host
- ✅ OpenAI API key configured
- ✅ Test with `sample-test.js`

**Happy Coding! 🚀**
