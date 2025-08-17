# UI Connection Scanner Tool

This tool scans React components to identify potential UI elements that may not be properly connected to handler functions.

## Overview

The UI Connection Scanner analyzes your codebase to find components with UI elements (buttons, forms, inputs, links) and checks for the presence of handler functions that might manage their interactions. It helps identify components where UI elements might lack corresponding event handlers, which could indicate disconnected functionality.

## Usage

You can run the tool using one of the following methods:

**Using npm script:**
```bash
npm run scan:ui-connections
```

**Using the shell script:**
```bash
./scan-ui-connections.sh
```

## What It Checks

The scanner searches for:

1. **UI Elements**:
   - Buttons: `<Button>`, `<button>`, etc.
   - Forms: `<Form>`, `<form>`, `useForm`, etc.
   - Inputs: `<Input>`, `<TextField>`, `<Select>`, etc.
   - Links: `<Link>`, `<a>`, etc.

2. **Handler Functions**:
   - Functions starting with "handle" or "on"
   - Arrow functions that might be event handlers
   - useCallback hooks that could contain handlers

## Report Output

The tool generates:

1. **Console Summary**:
   - Count of UI elements by type
   - Count of handler functions
   - Handler to UI element ratio
   - List of files with potential issues

2. **JSON Report File**:
   - Detailed scan results saved to `ui-connection-report.json`
   - Contains full list of components with potential issues
   - Includes statistics and timestamps

## Interpreting Results

The tool calculates a "Handler to UI Element Ratio" that indicates the overall coverage of UI elements by handlers:

- **≥ 0.8**: Good handler coverage
- **≥ 0.5**: Moderate handler coverage
- **< 0.5**: Poor handler coverage

Components flagged as potential issues have UI elements (buttons, forms) but no detectable handler functions, which might indicate functionality that isn't properly connected.

## Benefits

Using this tool helps:
- Identify potentially non-functional UI elements
- Improve code quality by ensuring UI elements have handlers
- Detect components that might need additional event handlers
- Prevent user experience issues from unresponsive UI elements
