FROM jupyter/pyspark-notebook:latest

USER root

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Update the PATH environment variable to include Cargo
ENV PATH="/home/jovyan/.cargo/bin:${PATH}"

USER jovyan

RUN pip install polars

# Clean up any unnecessary files (no need to use apt-get clean since we didn't install apt packages)
RUN rm -rf /var/lib/apt/lists/*

EXPOSE 8888

CMD ["start-notebook.sh", "--NotebookApp.tornado_settings={\"headers\": {\"Content-Security-Policy\": \"frame-ancestors 'self' *\"}}"]
