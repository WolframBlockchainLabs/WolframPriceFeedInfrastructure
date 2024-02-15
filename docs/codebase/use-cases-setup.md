# Use Cases Documentation

## Introduction
This document explains the `use-cases` directory which contains the core business logic of the application, following the Clean Architecture principles. The use cases orchestrate the application's operations and business rules, ensuring a decoupled and maintainable codebase.

## Core Principles
- **Isolation**: Business logic is kept separate from interfaces, databases, and other external elements.
- **Reusability**: Use cases can be reused across different parts of the application.
- **Testability**: Business logic can be tested independently of the external elements.
- **Chista Package**: Utilizes the `chista` npm package to define the basic structure of a use case.

## Base Use Case
`BaseUseCase` is the abstract class that all use cases extend from. It provides common behaviors such as caching, validation, and transaction management.

- **Caching**: Results are cached using `RedisLRUCache` for improved performance. The decision on wether to cache the request should be implemented in `shouldCache` method which should return a boolean. By default it returns false.
- **Validation**: Input data is validated using the `Validator` from `LIVR`.
- **Transaction Management**: Operations are wrapped in a Sequelize transaction to ensure atomicity.

## Example Use Case: TokenCreate
`TokenCreate` is a concrete use case that handles the creation of new token entities in the system.

### Validation
It defines its own set of validation rules in `validationRules` property that ensure the required fields are present and correctly formatted.

### Execution
The `execute` method creates a new `Token` entity and returns the result, which is a dumped version of the token for the response.

```javascript
class TokenCreate extends BaseUseCase {
    validationRules = {
        symbol: ['required', 'not_null', 'not_empty', 'string'],
        // other validation rules...
    };

    async execute({ symbol, name, itin, description, imageUrl }) {
        const token = await Token.create({ symbol, name, itin, description, imageUrl });
        return { data: dumpToken(token) };
    }
}
```

## Directory Structure
The `use-cases` directory is organized by domain-specific subdirectories such as `exchanges`, `market-records`, `tokens`, etc., each containing relevant use cases.

## Adding New Use Cases
To add a new use case:
1. Extend `BaseUseCase`.
2. Define validation rules if input validation is required.
3. Implement the `execute` method with the business logic.

## Usage
To utilize a use case in the application:
1. Set the APpProvider instance in BaseUseCase.
2. Instantiate the use case class.
3. Call the `run` method with the necessary parameters.
4. Handle the returned result or catch any errors thrown.

---

🔵 [Back to main doc file](../../README.md)
