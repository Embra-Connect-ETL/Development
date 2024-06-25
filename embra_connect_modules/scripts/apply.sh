#!/bin/bash

kubectl apply -f server-deployment.yaml
kubectl apply -f server-service.yaml
kubectl apply -f dbt-deployment.yaml
kubectl apply -f dbt-service.yaml
kubectl apply -f editor-deployment.yaml
kubectl apply -f editor-service.yaml

# kubectl apply -f server-deployment.yaml --validate=false
# kubectl apply -f server-service.yaml --validate=false
# kubectl apply -f dbt-deployment.yaml --validate=false
# kubectl apply -f dbt-service.yaml --validate=false
# kubectl apply -f editor-deployment.yaml --validate=false
# kubectl apply -f editor-service.yaml --validate=false
