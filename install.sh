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
    sql-component.googleapis.com \
    sqladmin.googleapis.com \
    storage.googleapis.com

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
