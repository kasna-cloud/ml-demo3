#!/bin/bash

# Params
PROJECT_ID=$(gcloud config get-value project)
echo "Project ID: ${PROJECT_ID}"

# Services
echo "Enable Services ..."
gcloud services enable \
    compute.googleapis.com \
    container.googleapis.com \
    cloudbuild.googleapis.com \
    file.googleapis.com \
    sql-component.googleapis.com \
    sqladmin.googleapis.com \
    storage.googleapis.com \
    speech.googleapis.com \
    language.googleapis.com

# Filestore
echo "Creating NFS ..."
gcloud filestore instances create radio-monitor \
    --location australia-southeast1-a \
    --tier STANDARD \
    --file-share="name=radiomonitor,capacity=1TiB" \
    --network="name=projects/${PROJECT_ID}/global/networks/default"

# SQL DB
echo "Create DB ..."
gcloud sql instances create radio-monitor \
    --database-version=POSTGRES_12 \
    --tier db-f1-micro \
    --region australia-southeast1

echo "Set DB pass ..."
gcloud sql users set-password postgres \
    --instance radio-monitor \
    --password radio-monitor

# GKE
echo "Create GKE cluster ..."
gcloud container clusters create-auto radio-monitor \
    --region australia-southeast1 \
    --project ${PROJECT_ID}

# This gives cloud build the authority to call GKE
# TODO: get this service account automatically??
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member serviceAccount:403414403869@cloudbuild.gserviceaccount.com \
    --role roles/container.developer

# Create SA for calling ML apis
gcloud iam service-accounts create radio-monitor-gcp-api \
    --description="GKE Workload Identity for GCP ML API calls" \
    --display-name="radio-monitor-gcp-api"
# Give it auth to call speech apis
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:radio-monitor-gcp-api@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/speech.client"
# Bind it to k8s SA
gcloud iam service-accounts add-iam-policy-binding \
    --role="roles/iam.workloadIdentityUser" \
    --member="serviceAccount:${PROJECT_ID}.svc.id.goog[default/radio-monitor-gcp]" \
    radio-monitor-gcp-api@${PROJECT_ID}.iam.gserviceaccount.com

# Create SA for calling into cloud sql
gcloud iam service-accounts create radio-monitor-postgres \
    --description="GKE Workload Identity for Cloud SQL" \
    --display-name="radio-monitor-postgres"
# Give it auth to connect to cloud sql
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:radio-monitor-postgres@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
# Bind it to k8s SA
gcloud iam service-accounts add-iam-policy-binding \
    --role="roles/iam.workloadIdentityUser" \
    --member="serviceAccount:${PROJECT_ID}.svc.id.goog[default/radio-monitor-grafana]" \
    radio-monitor-postgres@${PROJECT_ID}.iam.gserviceaccount.com