#!/bin/bash

kubectl delete deployment server-deployment
kubectl delete deployment dbt-deployment
kubectl delete deployment editor-deployment

kubectl delete service server-service
kubectl delete service dbt-service
kubectl delete service editor-service


# kubectl get deployments
# kubectl get services

# minikube stop
# minikube delete

# minikube start