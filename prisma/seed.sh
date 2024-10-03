#!/usr/bin/env bash

BASE_URL=$1

if [ -z "$BASE_URL" ]; then
  echo "Usage: $0 <base-url>"
  exit 1
fi

echo "Creating users"
curl --location "${BASE_URL}/users" --header 'Content-Type: application/json' --data '{ "userId": "u.ja" }'
curl --location "${BASE_URL}/users" --header 'Content-Type: application/json' --data '{ "userId": "yang.e" }'
curl --location "${BASE_URL}/users" --header 'Content-Type: application/json' --data '{ "userId": "milton.m" }'

echo "Creating projects"
curl --location "${BASE_URL}/projects" --header 'Content-Type: application/json' --data '{ "projectId": "P001" }'
curl --location "${BASE_URL}/projects" --header 'Content-Type: application/json' --data '{ "projectId": "P002" }'

echo "Creating datasets"
curl --location "${BASE_URL}/datasets" --header 'Content-Type: application/json' --data '{ "datasetId": "D001", "projectId": "P001" }'
curl --location "${BASE_URL}/datasets" --header 'Content-Type: application/json' --data '{ "datasetId": "D002", "projectId": "P001" }'
curl --location "${BASE_URL}/datasets" --header 'Content-Type: application/json' --data '{ "datasetId": "D003", "projectId": "P002" }'

echo "Associating users to projects"
curl --location --request PUT "${BASE_URL}/projects/1/users" --header 'Content-Type: application/json' --data '{ "userIds": ["u.ja", "yang.e"] }'
curl --location --request PUT "${BASE_URL}/projects/2/users" --header 'Content-Type: application/json' --data '{ "userIds": ["u.ja", "milton.m"] }'

echo "Sharing a dataset with a project"
curl --location --request POST "${BASE_URL}/datasets/1/share" --header 'Content-Type: application/json' --data '{ "projectId": "P002" }'

echo "Creating instruments"
curl --location "${BASE_URL}/instruments" --header 'Content-Type: application/json' --data '{ "instrumentId": "I001", "displayName": "Microscope 001" }'
curl --location "${BASE_URL}/instruments" --header 'Content-Type: application/json' --data '{ "instrumentId": "I002", "displayName": "Microscope 002" }'
curl --location "${BASE_URL}/instruments" --header 'Content-Type: application/json' --data '{ "instrumentId": "I003", "displayName": "Sequencer 001" }'
curl --location "${BASE_URL}/instruments" --header 'Content-Type: application/json' --data '{ "instrumentId": "I004", "displayName": "Sequencer 002" }'
