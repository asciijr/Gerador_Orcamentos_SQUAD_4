FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /workspace

COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
COPY src ./src

RUN chmod +x gradlew && ./gradlew --no-daemon clean bootJar

FROM mcr.microsoft.com/playwright/java:v1.51.0-noble

WORKDIR /app

ENV SERVER_PORT=8080 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY --from=build --chown=pwuser:pwuser /workspace/build/libs/app.jar ./app.jar

USER pwuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
