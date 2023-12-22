# UDEX Contribution Guide

Welcome to the UDEX contribution guide. This document provides detailed instructions on how to contribute to the UDEX project by adding markets to existing exchanges, integrating new exchanges, and adding new blockchain integrations.

## Table of Contents

-   [Adding Markets to Existing Exchanges](#adding-markets-to-existing-exchanges)
-   [Adding a New Exchange](#adding-a-new-exchange)
-   [Adding a New Blockchain Integration](#adding-a-new-blockchain-integration)
-   [Contribution Guidelines](#contribution-guidelines)

## Adding Markets to Existing Exchanges

Enhance the UDEX ecosystem by including new market pairs to the configuration files of existing exchanges.

### Detailed Steps:

1. **Fork and Clone the Repository**  
   Create a fork of the main repository and clone it to your local machine for development.

2. **Locate Exchange Configuration**  
   Navigate to `configs/udex/<blockchain>/exchanges` and select the JSON configuration file for the exchange you wish to update.

3. **Format of Market Pair**  
   New market pairs should be structured in JSON format, following the example of existing configurations, ensuring to include all necessary fields such as `id`, `name`, and `markets`.

4. **Add Market Pair**  
   In the `markets` array, append your new market pair. For tokens other than the native currency, include the `meta` field with the `address` and `decimals` specified.

5. **Commit Your Changes Locally**  
   Use descriptive commit messages to save your changes, such as "feat: add new ADA/MIN market pair to MinSwap."

6. **Push to Your Fork**  
   Push the changes to your forked repository.

7. **Submit a Pull Request**  
   From your fork, submit a pull request to the main repository for review.

## Adding a New Exchange

To integrate a new exchange into the UDEX platform, follow the steps below.

### Detailed Steps:

1. **Create Config File for New Exchange**  
   Add a new `.json` config file within `configs/udex/<blockchain>/exchanges`. Use the existing config files as a template for the required fields.

2. **Implement New Exchange Driver**  
   Under `lib/domain-collectors/integrations/udex/<blockchain>`, create a new driver class that extends the appropriate base driver and implements `getExchangeRate`.

3. **Exchange Rate Method**  
   Ensure that your `getExchangeRate` method returns an object with the structure `{ exchangeRate: string, poolASize: string, poolBSize: string }`. The string should represent a precise number. The reason for string usage is due to precision issues with native JS Number type.

4. **Register Driver in Index.js**  
   In the `index.js` file within the blockchain directory, import and add the new driver to the exports object.

5. **Unit Tests**  
   For the new driver, write unit tests in the corresponding `tests` directory following the project's testing conventions.

6. **Update Documentation**  
   In the project's documentation, detail the addition of the new exchange and its capabilities.

7. **Create Pull Request**  
   After testing and verifying your changes, create a pull request to merge your new exchange into the main repository.

## Adding a New Blockchain Integration

Introducing a new blockchain to the UDEX system is an extensive process that broadens the project's scope.

### Detailed Steps:

1. **Create New Directory for Blockchain**  
   Within `configs/udex`, create a new directory named after the new blockchain.

2. **Configuration Files**  
   Inside this directory, add a general blockchain config file and individual config files for each exchange within the new blockchain.

    Configuration files are the backbone of our integration with various blockchains and decentralized exchanges (DEXs). They define the parameters for our system to interact with these platforms. Here's how to properly set them up:

    #### General Blockchain Configuration

    Create a general configuration file for the blockchain network that your DEX interfaces with. This JSON file will contain essential configuration settings applicable to the entire blockchain.

    **Example: `cardano_config.json`**

    ```json
    {
        "groupName": "Cardano",
        "rateLimit": 6000,
        "rateLimitMargin": "{{CARDANO_RATE_LIMIT_MARGIN}}",
        "replicaSize": "{{CARDANO_REPLICA_SIZE}}",
        "instancePosition": "{{CARDANO_INSTANCE_POSITION}}",
        "apiSecret": "{{CARDANO_BLOCKFROST_PROJECT_ID}}"
    }
    ```

    #### Individual Exchange Configuration

    Each DEX on the blockchain requires its own configuration file, which should specify the settings particular to that exchange.

    **Example: `minswap_config.json`**

    ```json
    {
        "id": "minswap",
        "name": "Minswap",
        "markets": [
            {
                "pair": {
                    "meta": {
                        "pool": "6aa2153e1ae896a95539c9d62f76cedcdabdcdf144e564b8955f609d660cf6a2"
                        // Additional fields can be added as needed
                    },
                    "in": {
                        "symbol": "ADA",
                        "name": "Cardano",
                        "meta": {
                            "address": "lovelace",
                            "decimals": 6
                            // Additional fields can be added as needed
                        }
                    },
                    "out": {
                        "symbol": "MIN",
                        "name": "Minswap",
                        "meta": {
                            "address": "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e",
                            "decimals": 6
                            // Additional fields can be added as needed
                        }
                    }
                },
                "symbol": "ADA/MIN"
            }
        ]
    }
    ```

    #### The `meta` Field

    The `meta` field is a section within each configuration file. It serves as a flexible container for any additional parameters that are specific to the blockchain, DEX, or market. This is where you can extend the configuration with custom fields as needed by the particular platform you're configuring for.

    **Example of Extending with `meta`:**

    ```json
    	"meta": {
    		// Mandatory fields for blockchain/Dex configuration
    		"poolId": "6aa2153e1ae896a95539c9d62f76cedcdabcdcf144e56b48955f609d660cf6a2",
    		// Custom fields
    	}
    ```

3. **Implement Exchange Drivers**  
   Create new drivers within `lib/domain-collectors/integrations/udex` for each exchange, ensuring they contain the necessary methods for integration: ensure that your `getExchangeRate` method returns an object with the structure `{ exchangeRate: string, poolASize: string, poolBSize: string }`. The string should represent a precise number. The reason for string usage is due to precision issues with native JS Number type.

4. **Register Driver in Index.js**  
   In the `index.js` file within the blockchain directory, import and add the new driver to the exports object.

5. **Write Comprehensive Unit Tests**  
   Provide unit tests for all new drivers and functionalities within the `tests/unit/integrations/udex/<new_blockchain>` directory.

6. **NPM Script for Collectors**  
   In `package.json`, add a new script under `scripts` to initialize the collectors for the new blockchain. Here's an example:

    ```json
    {
        "scripts": {
            "cli:eth-collectors": "npx pm2-runtime start ./lib/cli/udex_collectors/ecosystem.config.cjs Ethereum",
            "cli:tezos-collectors": "npx pm2-runtime start ./lib/cli/udex_collectors/ecosystem.config.cjs Tezos",
            "cli:cardano-collectors": "npx pm2-runtime start ./lib/cli/udex_collectors/ecosystem.config.cjs Cardano"
        }
    }
    ```

7. **Document Your Work**  
   Update the README.md and other relevant documentation such as config docs to reflect the addition of the new blockchain.

8. **Pull Request for Integration**  
   Submit a pull request with your new blockchain integration for the maintainers to review and incorporate into the main project.

## Contribution Guidelines

Please adhere to the following contribution guidelines to maintain a high standard of quality:

-   Follow the established coding style and directory structure.
-   Ensure all new code is covered by unit tests that pass.
-   Document your changes thoroughly in the project's README.md.
-   Write clear, descriptive commit messages and pull request descriptions.
-   Test your contributions thoroughly before submitting.

Thank you for contributing to UDEX. Your contributions help in making decentralized finance more accessible and interoperable.

---

🟣 [Back to main doc file](../../README.md)
