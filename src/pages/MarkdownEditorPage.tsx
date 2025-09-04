import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownEditorPage: React.FC = () => {
  // State for markdown content with default text
  const [markdownText, setMarkdownText] = useState<string>(`# Welcome to the Markdown Editor

Type markdown here...

## Features

- **Bold text** using \`**text**\`
- *Italic text* using \`*text*\`
- [Links](https://example.com)
- \`inline code\`

### Code blocks
\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

### Lists
- Item 1
- Item 2
- Item 3

### Tables
| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

> This is a blockquote

---

Start editing to see live preview!`);

  // Handle textarea changes
  const handleMarkdownChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownText(event.target.value);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Markdown Editor
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Write markdown on the left, see the preview on the right
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)]">
          {/* Markdown Input */}
          <div className="flex flex-col">
            <div className="mb-4">
              <label
                htmlFor="markdown-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Markdown Input
              </label>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Supports headers, **bold**, *italic*, [links](url), `code`, lists, tables, and more
              </div>
            </div>
            <textarea
              id="markdown-input"
              value={markdownText}
              onChange={handleMarkdownChange}
              className="flex-1 w-full px-4 py-3 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
              placeholder="Type your markdown here..."
              spellCheck={false}
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Characters: {markdownText.length} | Lines: {markdownText.split('\n').length}
            </div>
          </div>

          {/* Markdown Preview */}
          <div className="flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Live Preview
              </h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Real-time rendering of your markdown
              </div>
            </div>
            <div className="flex-1 overflow-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
              <div className="p-6 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom styling for different elements
                    h1: ({children}) => (
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        {children}
                      </h1>
                    ),
                    h2: ({children}) => (
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                        {children}
                      </h2>
                    ),
                    h3: ({children}) => (
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">
                        {children}
                      </h3>
                    ),
                    p: ({children}) => (
                      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    strong: ({children}) => (
                      <strong className="font-semibold text-gray-900 dark:text-white">
                        {children}
                      </strong>
                    ),
                    em: ({children}) => (
                      <em className="italic text-gray-700 dark:text-gray-300">
                        {children}
                      </em>
                    ),
                    code: ({children}) => (
                      <code className="px-1.5 py-0.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded font-mono">
                        {children}
                      </code>
                    ),
                    pre: ({children}) => (
                      <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto mb-4 border border-gray-200 dark:border-gray-700">
                        {children}
                      </pre>
                    ),
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300">
                        {children}
                      </blockquote>
                    ),
                    ul: ({children}) => (
                      <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
                        {children}
                      </ul>
                    ),
                    ol: ({children}) => (
                      <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
                        {children}
                      </ol>
                    ),
                    a: ({href, children}) => (
                      <a
                        href={href}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    table: ({children}) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full border border-gray-300 dark:border-gray-600">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({children}) => (
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        {children}
                      </thead>
                    ),
                    th: ({children}) => (
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">
                        {children}
                      </th>
                    ),
                    td: ({children}) => (
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {markdownText}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => setMarkdownText('')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear
          </button>
          <button
            onClick={() => {
              const exampleText = `# Sample Document

## Introduction
This is a **sample document** with various *markdown elements*.

### Code Example
\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}
\`\`\`

### Features
- [x] Completed item
- [ ] Todo item
- [ ] Another todo

### Table
| Feature | Status |
|---------|--------|
| Headers | ✅ |
| Lists | ✅ |
| Code | ✅ |

> This is a blockquote with important information.

---

Happy writing! 🚀`;
              setMarkdownText(exampleText);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Load Example
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(markdownText);
              // You could add a toast notification here
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Copy Markdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditorPage;
