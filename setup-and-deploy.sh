#!/bin/bash

SERVICE_ACCOUNT="my-cli-service@mat1-9e6b3.iam.gserviceaccount.com"
PROJECT="mat1-9e6b3"
REGION="europe-west1"
APP_NAME="my-app"

echo "🔑 Setting active account to admin..."
gcloud config set account www.hjnel@gmail.com

echo "🔒 Adding IAM roles to service account..."

gcloud projects add-iam-policy-binding $PROJECT \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/storage.objectCreator" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/cloudbuild.builds.editor" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/run.admin" \
  --condition=None

echo "✅ IAM roles assigned."

echo "🔄 Switching auth to service account..."
gcloud auth activate-service-account --key-file=./my-cli-service-key.json

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $APP_NAME \
  --source . \
  --region=$REGION \
  --platform=managed \
  --service-account=$SERVICE_ACCOUNT \
  --allow-unauthenticated
