#!/bin/bash

# Script to run TypeScript type checking using our special typecheck configuration
echo "Running TypeScript type check..."
tsc -p tsconfig.typecheck.json

# Check the exit status of the TypeScript compiler
if [ $? -eq 0 ]; then
    echo "✅ TypeScript type check completed successfully!"
    exit 0
else
    echo "⚠️ TypeScript type check found issues. Please fix the errors above."
    exit 1
fi
