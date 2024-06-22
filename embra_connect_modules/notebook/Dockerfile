FROM lexaraprime/embra_connect_notebook:latest

ARG NB_USER=jovyan
ARG NB_UID=1000
ENV USER ${NB_USER}
ENV NB_UID ${NB_UID}
ENV HOME /home/${NB_USER}

# FIX::E: List directory /var/lib/apt/lists/partial is missing. - Acquire (13: Permission denied)
USER root

RUN mkdir -p /var/lib/apt/lists/partial

# Check if the user already exists
RUN id -u ${NB_USER} &>/dev/null || \
    adduser --disabled-password --gecos "Default user" --uid ${NB_UID} ${NB_USER}

# Install Rust and its dependencies
RUN apt-get update

RUN chown -R ${NB_UID} ${HOME}

# Set user to <non-root> user
USER ${NB_USER}

# Install pyspark for the user jovyan
RUN pip install pyspark

# Expose default JLN port
EXPOSE 8888



####################
#
#   DOCUMENTATION
#
###################

# NOTE:: In case the following <docker run> command fails, use the second option
# docker run -it --rm -p 8888:8888 <image-name> jupyter notebook --NotebookApp.default_url=/lab/ --ip=0.0.0.0 --port=8888

# docker run -it --rm -p 8888:8888 <image-name> jupyter lab --ip=0.0.0.0 --port=8888 --NotebookApp.default_url=/lab/

# NOTEBOOK_CONFIG::Setting the default_url to /doc/ will launch the notebook using the simple UI

###############################################
### BUILD WITH --no-cache OPTION ###
# docker build --no-cache -t your-image-name .

#### CLEAN UP #####
# docker system prune -f