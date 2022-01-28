![CircleCI](https://img.shields.io/circleci/build/github/markormesher/macro-tracker)

# Macro Tracker

A web-based tracker for food and exercise, supporting complex nutrition targets and integration with Nutritionix and supermarket APIs for food data.

Feel free to clone it and have a play, but note that this is an opinionated tool that I've built for personal use, not something I intend to formally "release" and support for anyone else.

## Example Docker Compose File

```yaml
version: "3.3"

services:
  app:
    build: git@github.com:markormesher/macro-tracker.git#main
    depends_on:
      - postgres
    secrets:
      - nutritionix-api.id
      - nutritionix-api.key
      - postgres.password
      - tesco-api.key
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_DATABASE=macro_tracker
      - POSTGRES_USER=macro_tracker
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres.password
      - TESCO_API_SECRET_FILE=/run/secrets/tesco-api.key
      - NUTRITIONIX_API_ID_FILE=/run/secrets/nutritionix-api.id
      - NUTRITIONIX_API_KEY_FILE=/run/secrets/nutritionix-api.key
    volumes:
      - ./logs:/logs

  postgres:
    image: postgres:10.1-alpine
    networks:
      - internal
    secrets:
      - postgres.password
    environment:
      - POSTGRES_DATABASE=macro_tracker
      - POSTGRES_USER=macro_tracker
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres.password
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:

secrets:
  nutritionix-api.id:
    file: ./src/config/secrets/nutritionix-api.id
  nutritionix-api.key:
    file: ./src/config/secrets/nutritionix-api.key
  postgres.password:
    file: ./src/config/secrets/postgres.password
  tesco-api.key:
    file: ./src/config/secrets/tesco-api.key
```
