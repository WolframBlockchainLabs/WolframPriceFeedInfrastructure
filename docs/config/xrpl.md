## xrpl-collectors.config

### General Settings

-   **rateLimit**: The global rate limit applied to the instance, to prevent excessive requests.

    -   Default: `80`

-   **rateLimitMargin**: The margin applied to the rate limit to allow for flexibility and prevent limit breaches.

    -   Example: `"{{XRPL_RATE_LIMIT_MARGIN}}"`

-   **replicaSize**: The number of replicas in the replica set for distributed operations.

    -   Example: `"{{XRPL_REPLICA_SIZE}}"`

-   **instancePosition**: The specific position of this instance within the replica set.

    -   Example: `"{{XRPL_INSTANCE_POSITION}}"`

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
    -   **counter**
        -   **currency**: The counter currency in the pair (e.g., "USD").
        -   **issuer**: The issuer of the counter currency.

-   **symbol**: A representative string of the market pair (e.g., "XRP/Bitstamp-USD").

---

Note: The placeholders (e.g., `{{XRPL_RATE_LIMIT_MARGIN}}`) should be replaced with actual values during runtime or configuration setup.

---

🟣 [Back to main doc file](../../README.md)
