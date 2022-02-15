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
    storage.googleapis.com

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

# TODO: get this service account automatically??
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member serviceAccount:403414403869@cloudbuild.gserviceaccount.com \
    --role roles/container.developer