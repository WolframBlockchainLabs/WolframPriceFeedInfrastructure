# How to Add Markets to XRPL Configurations

This document provides instructions for community members who wish to contribute by adding new market pairs to the XRPL configurations.

## Adding New Market Pairs

To add a new market pair to the `xrpl-collectors.config.json`, follow the steps below:

1. **Fork the Repository**  
   Fork the repository to create a personal copy where you can make changes.

2. **Open the Configuration File**  
   Within your fork, navigate to the `configs/xrpl` directory and open the `xrpl-collectors.config.json` file.

3. **Add a New Market Pair**  
   To add a new market pair, include an entry in the `markets` array using the following structure:

    ```json
    {
        "pair": {
            "in": {
                "symbol": "BASE_CURRENCY",
                "meta": {
                    "currency": "BASE_CURRENCY"
                }
            },
            "out": {
                "symbol": "COUNTER_CURRENCY",
                "meta": {
                    "currency": "COUNTER_CURRENCY",
                    "issuer": "ISSUER_ADDRESS"
                }
            }
        },
        "symbol": "BASE_CURRENCY/ISSUER_ADDRESS:COUNTER_CURRENCY"
    }
    ```

    Replace `BASE_CURRENCY`, `COUNTER_CURRENCY`, and `ISSUER_ADDRESS` with the appropriate values for your market pair. The `issuer` is required for every token except for the native XRP.

4. **Example Market Pair**  
   Here is an example of how to add a market pair for a token (e.g., XRP) against USD:

    ```json
    {
        "pair": {
            "in": {
                "symbol": "XRP",
                "meta": {
                    "currency": "XRP"
                }
            },
            "out": {
                "symbol": "USD",
                "meta": {
                    "currency": "USD",
                    "issuer": "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq"
                }
            }
        },
        "symbol": "XRP/GateHub:USD"
    }
    ```

    Ensure to add your new entry alongside the existing market pairs within the `markets` array.

5. **Commit and Push Changes**  
   After adding your new market pair, commit your changes with a meaningful message such as "feat: add XRP/USD market pair to XRPL config".

6. **Submit a Pull Request**  
   Push your changes to your fork and create a pull request to the original repository. Your pull request will be reviewed by the maintainers.

## Guidelines for Contributions

-   Follow the JSON structure provided in the examples.
-   Ensure that the `issuer` field is included for all tokens, with the exception of the native XRP token.
-   Verify the accuracy of the `issuer` address and the currency codes.
-   Provide a clear and descriptive commit message for your changes.

Contributions are greatly appreciated and help improve the diversity and accuracy of the market data provided by the XRPL configurations. Thank you for your support!

---

🟣 [Back to main doc file](../../README.md)
