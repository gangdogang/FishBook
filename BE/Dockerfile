FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew
RUN ./gradlew dependencies --no-daemon

COPY src ./src
RUN ./gradlew clean build --no-daemon

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

# 컨테이너를 root로 실행하지 않는다
RUN useradd --system --uid 1001 --no-create-home spring
USER spring

EXPOSE 8080

# 컨테이너 메모리 한도를 인지하도록 MaxRAMPercentage 사용 (Render 무료 512MB 대응)
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-XX:+ExitOnOutOfMemoryError", "-jar", "/app/app.jar"]
