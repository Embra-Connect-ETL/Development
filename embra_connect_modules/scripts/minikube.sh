#!/bin/bash

eval $(minikube -p minikube docker-env)

cd ./server
pwd
docker build -t lexaraprime/embra_connect_server:latest .

cd ../services/dbt
pwd
docker build -t lexaraprime/embra_connect_dbt_service:latest .

cd ../editor
pwd
docker build -t lexaraprime/embra_connect_editor:1.0 .
