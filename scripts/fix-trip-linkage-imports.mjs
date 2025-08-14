#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix the import paths in TripLinkageModal
const fixTripLinkageModal = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.resolve(process.cwd(), 'src/components/Models/Trips/TripLinkageModal.tsx');

  try {
    console.log(`Reading file ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix the import paths
    content = content.replace(
      "import Modal from '../ui/Modal';",
      "import Modal from '../../../components/ui/Modal';"
    );

    content = content.replace(
      "import { Button } from "@/components/ui/Button";",
      "import { Button } from "@/components/ui/Button";"
    );

    content = content.replace(
      "import { Select } from '../ui/FormElements';",
      "import { Select } from '../../../components/ui/FormElements';"
    );

    content = content.replace(
      "import { formatCurrency, formatDate } from '../../utils/helpers';",
      "import { formatCurrency, formatDate } from '../../../utils/helpers';"
    );

    // Write the modified content back to the file
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated import paths in TripLinkageModal.tsx');

    return true;
  } catch (error) {
    console.error(`Error fixing import paths in ${filePath}:`, error.message);
    return false;
  }
};

// Run the function
const success = fixTripLinkageModal();
if (success) {
  console.log('All import paths fixed successfully!');
} else {
  console.error('Failed to fix some import paths.');
  process.exit(1);
}
