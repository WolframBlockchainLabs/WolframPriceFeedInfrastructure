# How to Contribute to CCXT collectors

Thank you for your interest in contributing to CCXT collectors. This document will guide you through adding a new exchange configuration or updating an existing one.

## Adding a New Exchange Configuration

If you want to add a new exchange to the CCXT library, follow these steps:

1. **Fork the Repository**  
   Start by forking the CCXT repository to your own GitHub account.

2. **Create a New Config File**  
   In the `configs/ccxt/realtime` directory of your fork, create a new `.json` file for the exchange.

3. **Structure Your Config File**  
   Follow the structure displayed in the screenshot provided for existing configs. Here's an example template:

    ```json
    {
      "id": "new_exchange",
      "name": "New Exchange",
      "rateLimit": 600,
      "symbols": [
        "BTC/USD",
        "ETH/USD"
        // Add additional symbols here
      ]
    }
    ```

    Replace `new_exchange` and `New Exchange` with the correct ID and name of the new exchange. Adjust the `rateLimit` based on the exchange's API limits.

4. **Commit Your Changes**  
   Commit the new config file to your fork with a descriptive commit message.

5. **Create a Pull Request**  
   Submit a pull request to the original CCXT repository with your new exchange configuration.

## Updating an Existing Exchange Configuration

To add more symbols to an existing exchange configuration:

1. **Open the Existing Config File**  
   Navigate to the `configs/ccxt/realtime` directory and open the existing `.json` config file for the exchange.

2. **Add More Symbols**  
   Add your symbols to the `symbols` array in the config file.

3. **Commit and Push Your Changes**  
   Commit your changes with a descriptive message and push them to your fork.

4. **Pull Request**  
   Create a pull request so that your updates can be merged into the main repository.

## Contribution Guidelines

Please ensure your contributions adhere to the following guidelines:

- Commit messages should clearly describe the changes.
- Follow the JSON structure as shown in the provided screenshots.
- Test your changes to ensure they work as expected.

For any queries or help with your contribution, please open an issue on the GitHub repository.

---

 🟣 [Back to main doc file](../../README.md)
