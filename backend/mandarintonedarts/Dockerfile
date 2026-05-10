FROM maven:3.9.3-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests






FROM eclipse-temurin:17-jre-alpine AS deploy
WORKDIR /app

RUN apk add --no-cache curl


COPY --from=build /app/target/*.jar ./mandarintonedarts.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "mandarintonedarts.jar"]