#!/bin/bash

eval $(minikube -p minikube docker-env)

cd ./server
pwd
# docker build -t lexaraprime/embra_connect_server:1.0 .

cd ../services/dbt
pwd
# docker build -t lexaraprime/embra_connect_dbt_service:1.0 .

# The <editor> module/component is built seperately.
# Steps: 
# 1. cd ../emra_connect_editor
# 2.  docker build -t lexaraprime/embra_connect
# 2.  
# 2.  

# docker build -t lexaraprime/embra_connect_editor:1.0 .
