FROM jupyter/pyspark-notebook:latest

# Set the Jupyter token for security
ENV JUPYTER_TOKEN=user

# Set the working directory
WORKDIR /home/jovyan

# Generate Jupyter config
RUN jupyter notebook --generate-config

# Copy over database drivers
COPY ./bin/postgresql-42.7.1.jar /home/jovyan/.bin/postgresql-42.7.1.jar
COPY ./bin/postgresql-42.7.2.jar /home/jovyan/.bin/postgresql-42.7.2.jar
COPY ./bin/sqljdbc_12.6 /home/jovyan/.bin/sqljdbc_12.6

# Copy over custom configuration
COPY ./config/jupyterhub_config.py /etc/jupyter/jupyterhub_config.py
COPY ./config/jupyter_notebook_config.py /home/jovyan/.jupyter/jupyter_notebook_config.py

# Install Jupyter extensions
RUN pip install jupyter_contrib_nbextensions

# Create the custom directory and copy custom CSS
RUN mkdir -p /home/jovyan/.jupyter/custom /home/jovyan/.local/share/jupyter/custom
COPY ./config/custom.css /home/jovyan/.jupyter/custom/custom.css
COPY ./config/custom.css /home/jovyan/.local/share/jupyter/custom/custom.css

# Copy the CSS to Jupyter's global custom directory
COPY ./config/custom.css /usr/local/share/jupyter/custom/custom.css

# Start Jupyter notebook with custom CSS
CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--no-browser", "--allow-root"]

# Expose port for Jupyter notebook
EXPOSE 8888
