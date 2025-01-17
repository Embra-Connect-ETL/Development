# Base image with Java 11
# [Reason]:: Metabase requres java 11 and above in order to compile.
FROM openjdk:11-jre-slim

ENV METABASE_VERSION=0.51.5
ENV METABASE_JAR_URL=https://downloads.metabase.com/v0.51.5/metabase.jar
ENV METABASE_JAR=/app/metabase.jar
ENV PLUGINS_DIR=/app/plugins

# Default Metabase port 
EXPOSE 3000

WORKDIR /app

# Pre-install required tools, download Metabase, and drivers, then cleanup
RUN apt-get update && apt-get install -y curl && \
    mkdir -p $PLUGINS_DIR && \
    # Download Metabase JAR
    curl -L $METABASE_JAR_URL -o $METABASE_JAR && \
    chmod +x $METABASE_JAR && \
    # Download Oracle JDBC driver - [Reason] :: missing in base image
    curl -L -o $PLUGINS_DIR/ojdbc8.jar https://download.oracle.com/otn-pub/otn_software/jdbc/211/ojdbc8.jar && \
    # Download Vertica JDBC driver - [Reason] :: missing in base image
    curl -L -o $PLUGINS_DIR/vertica-jdbc.jar https://www.vertica.com/client_drivers/11.1.x/11.1.1-0/vertica-jdbc-11.1.1-0.jar && \
    # Cleanup
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Ensure migration locks are released before running Metabase
CMD ["sh", "-c", "java -jar /app/metabase.jar migrate release-locks && java -jar /app/metabase.jar"]

# [Quick build]:: sudo docker run -d --env-file .env -p 3000:3000 analytics_service
