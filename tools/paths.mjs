import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the ESLint plugin package (assuming this is the current project)
export const PACKAGES_ESLINT_PLUGIN = path.resolve(__dirname, '..');

// Path to prettier config
export const PRETTIER_CONFIG_PATH = path.resolve(__dirname, '..', '.prettierrc');
