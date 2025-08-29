# VS Code Configuration for Matanuska Project

This document outlines the VS Code configuration and recommended extensions for the Matanuska project, tailored specifically to our React + TypeScript + Tailwind CSS + Firebase + Capacitor stack.

## 🚀 Quick Setup

1. **Install VS Code**: Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. **Open the project**: `File > Open Folder` and select the project root
3. **Install recommended extensions**: VS Code will prompt you to install the recommended extensions
4. **Reload VS Code**: Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac), type "Reload Window"

## 📁 Configuration Files

The `.vscode/` directory contains several configuration files:

### `settings.json`
Comprehensive workspace settings optimized for our tech stack:
- **Code formatting**: Prettier integration with format-on-save
- **TypeScript**: Enhanced IntelliSense and auto-imports
- **Tailwind CSS**: Custom CSS validation and autocomplete
- **ESLint**: Automatic linting and fixing
- **File management**: Smart file nesting and search exclusions

### `extensions.json`
Curated list of recommended extensions for this project:
- Essential language support (TypeScript, Tailwind CSS)
- Development productivity tools
- Code quality and formatting
- Git integration
- Firebase and Capacitor support

### `tasks.json`
Pre-configured tasks for common development workflows:
- `Ctrl+Shift+P` → "Tasks: Run Task" to access
- Build, dev server, testing, linting, and mobile development tasks

### `launch.json`
Debugging configurations for:
- Chrome/Edge browser debugging
- Jest/Vitest test debugging
- Node.js debugging
- Firebase Functions debugging

### `snippets/typescript.json`
Custom code snippets for React, TypeScript, and project-specific patterns

## 🔧 Essential Extensions

### Core Development
- **TypeScript**: `ms-vscode.vscode-typescript-next`
- **Prettier**: `esbenp.prettier-vscode`
- **ESLint**: `dbaeumer.vscode-eslint`
- **Tailwind CSS**: `bradlc.vscode-tailwindcss`

### React Development
- **Auto Rename Tag**: `formulahendry.auto-rename-tag`
- **Auto Close Tag**: `formulahendry.auto-close-tag`
- **ES7+ React/Redux/React-Native snippets**: Built-in React support

### Code Quality
- **Error Lens**: `usernamehw.errorlens` - Inline error display
- **Code Spell Checker**: `streetsidesoftware.code-spell-checker`
- **Better Comments**: `aaron-bond.better-comments`

### Git Integration
- **GitLens**: `eamodio.gitlens` - Enhanced Git capabilities
- **Git History**: `donjayamanne.githistory`
- **Git Graph**: `mhutchie.git-graph`

### Firebase & Mobile
- **Firebase**: `firebase.firebase-vscode`
- **Ionic**: `ionic.ionic`
- **Capacitor**: `capacitor.capacitor-vscode`

### API Development
- **Thunder Client**: `rangav.vscode-thunder-client` - REST API testing
- **REST Client**: `humao.rest-client`

### Productivity
- **Path Intellisense**: `christian-kohler.path-intellisense`
- **Project Manager**: `alefragnani.project-manager`
- **Todo Tree**: `gruntfuggly.todo-tree`

## ⚙️ Key Features

### 1. Smart Code Formatting
- **Format on Save**: Automatically formats code using Prettier
- **Organize Imports**: Removes unused imports and sorts them
- **ESLint Integration**: Fixes linting issues on save

### 2. Enhanced TypeScript Support
- **Auto Imports**: Automatically imports symbols as you type
- **Inlay Hints**: Shows parameter names and types inline
- **Path Mapping**: Supports `@/` and `~` path aliases

### 3. Tailwind CSS Integration
- **Autocomplete**: Full Tailwind class name completion
- **Custom Directives**: Supports `@tailwind`, `@apply`, `@layer`, etc.
- **Class Validation**: Validates Tailwind class names
- **Hover Information**: Shows CSS properties for Tailwind classes

### 4. File Management
- **File Nesting**: Groups related files together (e.g., `.ts` with `.js`)
- **Smart Search**: Excludes build folders and dependencies
- **Quick Navigation**: Jump to files with `Ctrl+P`

### 5. Debugging Setup
- **Browser Debugging**: Debug React app in Chrome/Edge
- **Test Debugging**: Debug Jest and Vitest tests
- **Node.js Debugging**: Debug server-side code

## 🎯 Custom Snippets

Type these prefixes and press `Tab` to expand:

- `rfc` → React Functional Component with TypeScript
- `hook` → Custom React Hook
- `useFirestore` → Firestore collection hook
- `context` → React Context with TypeScript
- `btn` → Tailwind styled button
- `container` → Responsive container
- `grid` → Responsive grid

## 🛠️ Development Workflow

### Starting Development
1. **Open Terminal**: `Ctrl+`` (backtick)
2. **Start Dev Server**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Dev Server"
3. **Open Browser**: Navigate to `http://localhost:5173`

### Code Quality Checks
- **Lint**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Lint"
- **Type Check**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Type Check"
- **Format**: `Ctrl+Shift+P` → "Format Document" (or format on save)

### Testing
- **Run Tests**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Run Tests"
- **Debug Tests**: F5 → "Debug Jest Tests" or "Debug Vitest Tests"

### Mobile Development
- **Sync Capacitor**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Capacitor Sync"
- **Build Android**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Capacitor Build Android"

## 🔍 Troubleshooting

### TypeScript Errors
1. **Restart TS Server**: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. **Check tsconfig**: Ensure proper path mapping in `tsconfig.json`
3. **Clear Cache**: Delete `node_modules` and reinstall

### Tailwind CSS Not Working
1. **Reload Window**: `Ctrl+Shift+P` → "Developer: Reload Window"
2. **Check Config**: Verify `tailwind.config.js` content paths
3. **Extension**: Ensure Tailwind CSS extension is installed

### Prettier Not Formatting
1. **Check Default Formatter**: Settings → "Default Formatter" → "Prettier"
2. **Format on Save**: Settings → "Format On Save" → Enable
3. **File Type**: Ensure file type is supported by Prettier

### ESLint Issues
1. **Check Config**: Verify `.eslintrc.js` or `eslint.config.js`
2. **Restart ESLint**: `Ctrl+Shift+P` → "ESLint: Restart ESLint Server"
3. **Node Modules**: Ensure ESLint is installed in `node_modules`

## 📚 Additional Resources

- [VS Code TypeScript Guide](https://code.visualstudio.com/docs/languages/typescript)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [React in VS Code](https://code.visualstudio.com/docs/nodejs/reactjs-tutorial)
- [Debugging in VS Code](https://code.visualstudio.com/docs/editor/debugging)

## 🤝 Contributing

When contributing to this project:
1. Follow the established code formatting (Prettier + ESLint)
2. Use the provided snippets for consistency
3. Add proper TypeScript types
4. Follow Tailwind CSS conventions
5. Write tests for new features

---

This configuration is specifically tailored for the Matanuska project's technology stack and development workflow. It provides a comprehensive development environment with enhanced productivity features, code quality tools, and debugging capabilities.