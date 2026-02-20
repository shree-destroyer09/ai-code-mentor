
<p align="center">
  <img 
    src="https://github.com/user-attachments/assets/40b47ce3-3188-411b-adfe-d4e5e29c0d81" 
    alt="AI Code Mentor Logo" 
    width="96" 
    height="96"
  />
</p>

    ## 🚀 Getting Started

    ### Plug-and-Play Installation

    1. **Download or Clone the Repository:**
      - `git clone https://github.com/shree-destroyer09/ai-code-reviewer.git`
      - Or download the ZIP from GitHub and extract.

    2. **Install the Extension:**
      - Open the `ai-code-reviewer` folder in Visual Studio Code.
      - Go to the `extension` folder and run:
        ```bash
        npm install
        npm run compile
        ```
      - Press `F5` to launch the Extension Development Host.

    3. **Use Instantly:**
      - Open any code file.
      - Run `AI Code Mentor: Review Code` from the command palette (`Ctrl+Shift+P`).
      - Results appear in the output channel.

    > No backend setup, API key, or terminal commands are required. The extension connects to a public backend automatically.

    ---

    ### Advanced (Optional)

    If you want to use your own OpenRouter API key or customize backend settings:

    - Edit `backend/.env` and update `OPENROUTER_API_KEY`.
    - Adjust model/server settings as needed.

    ---
```

### 2. Install Dependencies

```bash
cd backend
npm install
cd ../extension
npm install
```


### 3. Backend Configuration

The backend is pre-configured with a working OpenRouter API key. You do NOT need to add your own key unless you want to use a personal key or increase quota.

- (Optional) To use your own OpenRouter API key, edit `backend/.env`:

  ```env
  OPENROUTER_API_KEY=your_openrouter_api_key_here
  ```
- (Optional) Adjust model and server settings in `.env`:
  - `OPENAI_MODEL=gpt-4-turbo-preview` (or your preferred model)
  - `PORT=3000`

### 4. Start the Backend Server

```bash
cd backend
npm start
```

### 5. Launch the Extension in VS Code

- Open the workspace in Visual Studio Code
- Press `F5` to start the Extension Development Host

### 6. Configure Extension Settings

- In VS Code, go to `File > Preferences > Settings`
- Search for "AI Code Mentor"
- Set your backend URL and API key if needed:

  ```json
  {
    "aiCodeMentor.backendUrl": "http://localhost:3000",
    "aiCodeMentor.apiKey": "your_openai_api_key_here"
  }
  ```

### 7. Run a Code Review

- Open any code file
- Run the command: `AI Code Mentor: Review Code`
- View suggestions and security ratings in the output channel

---

## 📝 Features

- Automated AI code review
- Security and bug detection
- Suggestions for improvements
- Refactored code output
- Teaching tips for learning
- Customizable backend URL and API key

---

## 📦 Project Structure

```
ai-code-reviewer/
├── backend/         # Node.js backend server
│   ├── server.js    # Express server
│   ├── routes/      # API routes
│   ├── services/    # AI service logic
│   ├── prompts/     # Prompt templates
│   └── package.json # Backend dependencies
├── extension/       # VS Code extension
│   ├── src/         # Extension source code
│   ├── package.json # Extension manifest
│   └── tsconfig.json# TypeScript config
├── frontend/        # (optional, for web UI)
│   ├── App.jsx      # React app entry
│   └── components/  # UI components
├── README.md        # Project documentation
└── sample-test.js   # Example file for testing
```

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
  "aiCodeMentor.apiKey": "your_openai_api_key_here",
  "aiCodeMentor.timeout": 30000
}
```

- **backendUrl**: Backend server URL (default: `http://localhost:3000`)
- **apiKey**: OpenAI API key (optional, overrides backend .env)
- **timeout**: Request timeout in milliseconds (default: `30000`)

### Backend Configuration

Edit `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
OPENAI_MODEL=gpt-4-turbo-preview
MAX_TOKENS=2000
TEMPERATURE=0.7
```

---

## 🔧 Troubleshooting

### Backend Won't Start

- Check Node.js version: `node --version` (should be v18+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if port 3000 is available: `netstat -ano | findstr :3000`
- Verify `.env` file exists and has `OPENAI_API_KEY`

### "Cannot connect to backend" Error

- Ensure backend is running (`npm start` in backend folder)
- Check backend URL in VS Code settings
- Test backend manually: Open `http://localhost:3000/health` in browser
- Check firewall settings

### "Invalid API Key" Error

- Verify API key in `backend/.env` or extension settings
- Ensure no extra spaces or quotes
- Generate new key at [OpenAI Platform](https://platform.openai.com/api-keys)
- Check API key has credits/billing enabled

### Extension Not Loading

- Recompile: `npm run compile`
- Check for TypeScript errors: `npm run lint`
- Restart VS Code and press F5 again
- Check VS Code console for errors (Help > Toggle Developer Tools)

### Request Timeout

- Increase timeout in settings (e.g., 60000 for 60 seconds)
- Try smaller files first
- Switch to faster model (`gpt-3.5-turbo`)
- Check internet connection

---

## 🛠️ Development

### Watch Mode

For active development, use watch mode to auto-compile on changes:

```bash
cd extension
npm run watch
```

### Debugging

- Backend: Add breakpoints in VS Code, launch with F5
- Extension: Breakpoints work in Extension Development Host

### Making Changes

- Backend: Restart server (Ctrl+C, then `npm start`)
- Extension: Reload window (Ctrl+R in Extension Development Host)

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

**Request:**
```json
{
  "code": "function example() { ... }",
  "language": "javascript"
}
```

**Response:**
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

**Response:**
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

## 🖥 Screenshots

<img width="1457" height="978" alt="AI Code Mentor UI" src="https://github.com/user-attachments/assets/11f4e38b-c7e8-43ff-ade2-b428981f1355" />

<img width="1919" height="1074" alt="AI Code Mentor Output" src="https://github.com/user-attachments/assets/50b39e0e-4c72-4240-844c-36528840b8e2" />

---

## 👥 Contributors

- Shree – Creator & Lead Developer ([GitHub](https://github.com/shree-destroyer09))
- Raj Pardesi – Contributor (Feature Testing) ([GitHub](https://github.com/rajpardeshi921-oss))
- Ankit Kumar Tiwari – Contributor (Backend Development) ([GitHub](https://github.com/ankitkumartiwari-web))

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

**Quick Start Checklist:**
- Backend running on http://localhost:3000
- Extension loaded in VS Code Development Host
- OpenAI API key configured
- Test with `sample-test.js`

**Happy Coding! 🚀**
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

## 🖥 Screenshots

<img width="1457" height="978" alt="image" src="https://github.com/user-attachments/assets/11f4e38b-c7e8-43ff-ade2-b428981f1355" />


<img width="1919" height="1074" alt="image" src="https://github.com/user-attachments/assets/50b39e0e-4c72-4240-844c-36528840b8e2" />


---

## 👥 Contributors

- Shree – Creator & Lead Developer  (https://github.com/shree-destroyer09)
- Raj Pardesi – Contributor (Feature Testing) (https://github.com/rajpardeshi921-oss)
- Ankit Kumar Tiwari - Contributor (Backend Development) (https://github.com/ankitkumartiwari-web)

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
