## xrpl-collectors.config

### General Settings

-   **rateLimit**: The global rate limit in milliseconds for the collectors.

    -   Default: `80`

-   **rateLimitMargin**: The margin in milliseconds to consider while setting up rate limits.

    -   Example: `"{{XRPL_RATE_LIMIT_MARGIN}}"`

-   **serverUrl**: The URL of the XRPL server that the instance interacts with.
    -   Example: `"{{XRPL_SERVER_URL}}"`

### Exchange Settings

The exchange object specifies details about the exchange being used in the configuration:

-   **exchange.id**: A unique identifier for the exchange.
    -   Example: `"xrpl"`
-   **exchange.name**: The display name of the exchange.
    -   Example: `"XRPL"`

### Market Settings

The configuration includes an array of market objects that contain the following details:

#### Market Object Properties

-   **pair**: An object describing the currency pair being traded, including base and counter currency details and the issuers involved.
-   **symbol**: A string that represents the market symbol for the given pair in a more human-readable format.

### Example Market Setup

Here's a brief look at how a market setup might look:

-   **pair**

    -   **base**
        -   **currency**: The base currency in the pair (e.g., "XRP").
        -   **issuer**: The issuer of the counter currency. ("XRP" does not have one)
    -   **counter**
        -   **currency**: The counter currency in the pair (e.g., "USD").
        -   **issuer**: The issuer of the counter currency. ("XRP" does not have one)

-   **symbol**: A representative string of the market pair (e.g., "XRP/Bitstamp-USD").

---

Note: The placeholders (e.g., `{{XRPL_RATE_LIMIT_MARGIN}}`) should be replaced with actual values during runtime or configuration setup.

---

🟣 [Back to main doc file](../../README.md)
