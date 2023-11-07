## system.config

### General Settings

- **appPort**: The port on which the application will run. 
  - Example: `"{{PORT}}"`
- **appTestPort**: The port used for testing. 
  - Default: `3002`
- **appMode**: The mode in which the application will run (e.g., development, production). 
  - Example: `"{{NODE_ENV}}"`
- **mainUrl**: The main URL of the application. 
  - Example: `"{{MAIN_URL}}"`
- **projectName**: The name of the project. 
  - Example: `"{{PROJECT_NAME}}"`

### Database Settings

#### Main Database

- **db.username**: The username to connect to the main database. 
  - Example: `"{{DB_USERNAME}}"`
- **db.password**: The password to connect to the main database. 
  - Example: `"{{DB_PASSWORD}}"`
- **db.database**: The name of the main database. 
  - Example: `"{{DB_DATABASE}}"`
- **db.dialect**: The dialect of the main database (e.g., mysql, postgres). 
  - Example: `"{{DB_DIALECT}}"`
- **db.host**: The host of the main database. 
  - Example: `"{{DB_HOST}}"`
- **db.port**: The port of the main database. 
  - Example: `"{{DB_PORT}}"`

#### Test Database

- **test-db.username**: The username to connect to the test database. 
  - Example: `"{{TEST_DB_USERNAME}}"`
- **test-db.password**: The password to connect to the test database. 
  - Example: `"{{TEST_DB_PASSWORD}}"`
- **test-db.database**: The name of the test database. 
  - Example: `"{{TEST_DB_DATABASE}}"`
- **test-db.dialect**: The dialect of the test database (e.g., mysql, postgres). 
  - Example: `"{{TEST_DB_DIALECT}}"`
- **test-db.host**: The host of the test database. 
  - Example: `"{{TEST_DB_HOST}}"`
- **test-db.port**: The port of the test database. 
  - Example: `"{{TEST_DB_PORT}}"`

### RabbitMQ Settings

- **rabbitmq.urls**: An array of URLs to connect to RabbitMQ. 
  - Example: 
    ```
    [
        "amqp://{{RABBITMQ_USER}}:{{RABBITMQ_PASS}}@{{RABBITMQ_HOST}}:5672/"
    ]
    ```

### Logger Settings

- **logger.isPlainText**: Flag to determine if the logs should be in plain text format. 
  - Example: `"{{LOGGER_PLAIN_TEXT}}"`
- **logger.level**: The level of logging (e.g., info, warn, error). 
  - Example: `"{{LOGGER_LEVEL}}"`
- **logger.transports**: An array of transport objects that define how logs should be transported. 
  - Example: 
    ```
    [
        {
            "type": "console",
            "pretty": true
        }
    ]
    ```

### Interval Settings

- **intervals.marketsRefresher**: The interval at which the markets refresher function should run. 
  - Example: `"{{MARKETS_REFRESHER_INTERVAL}}"`

---

Please, note that the placeholders (like `{{PORT}}`) should be replaced with actual values during runtime or configuration setup.
