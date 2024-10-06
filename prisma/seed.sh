#!/usr/bin/env bash

BASE_URL=$1

if [ -z "$BASE_URL" ]; then
  echo "Usage: $0 <base-url>"
  exit 1
fi

echo "Creating users"
curl -X POST --location "${BASE_URL}/api/users" --header 'Content-Type: application/json' --data '{ "userId": "u.ja" }'
curl -X POST --location "${BASE_URL}/api/users" --header 'Content-Type: application/json' --data '{ "userId": "yang.e" }'
curl -X POST --location "${BASE_URL}/api/users" --header 'Content-Type: application/json' --data '{ "userId": "milton.m" }'

echo "Creating projects"
curl -X POST --location "${BASE_URL}/api/projects" --header 'Content-Type: application/json' --data '{ "projectId": "P001" }'
curl -X POST --location "${BASE_URL}/api/projects" --header 'Content-Type: application/json' --data '{ "projectId": "P002" }'

echo "Creating datasets"
curl -X POST --location "${BASE_URL}/api/datasets" --header 'Content-Type: application/json' --data '{ "datasetId": "D001", "projectId": "P001" }'
curl -X POST --location "${BASE_URL}/api/datasets" --header 'Content-Type: application/json' --data '{ "datasetId": "D002", "projectId": "P001" }'
curl -X POST --location "${BASE_URL}/api/datasets" --header 'Content-Type: application/json' --data '{ "datasetId": "D003", "projectId": "P002" }'

echo "Associating users to projects"
curl -X PUT --location "${BASE_URL}/api/projects/P001/users" --header 'Content-Type: application/json' --data '{ "userIds": ["u.ja", "yang.e"] }'
curl -X PUT --location "${BASE_URL}/api/projects/P002/users" --header 'Content-Type: application/json' --data '{ "userIds": ["u.ja", "milton.m"] }'

echo "Sharing a dataset with a project"
curl -X POST --location "${BASE_URL}/api/datasets/D001/share" --header 'Content-Type: application/json' --data '{ "projectId": "P002" }'

echo "Creating instruments"
curl -X POST --location "${BASE_URL}/api/instruments" --header 'Content-Type: application/json' --data '{ "instrumentId": "I001", "displayName": "Microscope 001" }'
curl -X POST --location "${BASE_URL}/api/instruments" --header 'Content-Type: application/json' --data '{ "instrumentId": "I002", "displayName": "Microscope 002" }'
curl -X POST --location "${BASE_URL}/api/instruments" --header 'Content-Type: application/json' --data '{ "instrumentId": "I003", "displayName": "Sequencer 001" }'
curl -X POST --location "${BASE_URL}/api/instruments" --header 'Content-Type: application/json' --data '{ "instrumentId": "I004", "displayName": "Sequencer 002" }'
