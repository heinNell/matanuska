#!/bin/bash

PROJECT_ID="mat1-9e6b3"
REGION="us-central1"  # change if needed

# List all 1st gen functions
gcloud functions list --project="$PROJECT_ID" --format="value(name)" | while read FUNCTION_NAME
do
    echo "📄 Exporting details for $FUNCTION_NAME"
    gcloud functions describe "$FUNCTION_NAME" \
      --project="$PROJECT_ID" \
      --region="$REGION" \
      --format=json > "${FUNCTION_NAME}_details.json"
done
