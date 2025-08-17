#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Running Code Quality Analysis ===${NC}"
echo "Analyzing project code structure and quality..."

# Run the code quality analysis tool
node tools/code-quality-analysis.mjs "$@"

# Save exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}Analysis complete!${NC}"
else
  echo -e "${RED}Analysis encountered errors.${NC}"
fi

exit $EXIT_CODE
