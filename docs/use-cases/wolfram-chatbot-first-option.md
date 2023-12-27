# Option 1: Private Network Exposure - Implementation Guide

🟣 [Back to Wolfram ChatBot Use Case](./wolfram-chatbot.md)

---

## Table of Contents

1. [Introduction](#introduction)
2. [Creating a Read-Only User](#creating-a-read-only-user)
    - [Create User Command](#create-user-command)
    - [Grant Connect Permission](#grant-connect-permission)
    - [Set Default Privileges](#set-default-privileges)
    - [Grant Schema Usage](#grant-schema-usage)
    - [Grant Select on All Tables](#grant-select-on-all-tables)
    - [Setting the Default Schema Search Path](#setting-the-default-schema-search-path)
3. [Verification Steps](#verification-steps)
    - [Verify User Existence](#verify-user-existence)
    - [Check CONNECT Privilege](#check-connect-privilege)
    - [Validate SELECT Privileges](#validate-select-privileges)
4. [Setting Query Execution Time Limits](#setting-query-execution-time-limits)
    - [Alter Role for Query Timeout](#alter-role-for-query-timeout)
    - [Show Current Timeout Setting](#show-current-timeout-setting)
5. [Firewall Setup](#firewall-setup)
    - [Using UFW to Restrict Access](#using-ufw-to-restrict-access)
    - [Implementing a Dedicated Firewall](#implementing-a-dedicated-firewall)

---

## Introduction

This guide provides a comprehensive methodology for implementing Option 1: Private Network Exposure as part of the Wolfram ChatGPT Plugin integration. It focuses on creating a secure, read-only user in a TimescaleDB database and enhancing security through firewall configurations.

---

## Creating a Read-Only User

### Create User Command

-   **Command**:
    ```sql
    CREATE USER myreadonlyuser WITH PASSWORD 'password';
    ```
-   **Purpose**: This command establishes a new user, `myreadonlyuser`, in the TimescaleDB database. The inclusion of a password is a fundamental security measure, creating a barrier against unauthorized access. This user is intended for read-only actions, limiting their ability to alter, delete, or update data within the database, thus preserving data integrity and preventing potential malicious activities.

### Grant Connect Permission

-   **Command**:
    ```sql
    GRANT CONNECT ON DATABASE mydatabase TO myreadonlyuser;
    ```
-   **Purpose**: This command authorizes the `myreadonlyuser` to establish a connection with the `mydatabase` database. Granting connect permission is a crucial step in database security, ensuring that the user can access the database while also maintaining tight control over who can connect.

### Set Default Privileges

-   **Command**:
    ```sql
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO myreadonlyuser;
    ```
-   **Purpose**: This command adjusts the default privileges for any new tables created within the public schema of the database. It grants the `myreadonlyuser` SELECT permissions on these tables. The significance of this step lies in ensuring that as new tables are added to the database, they inherit secure, read-only access by default. This approach minimizes the risk of unauthorized data modifications and maintains consistent security policies across the database.

### Grant Schema Usage

-   **Command**:
    ```sql
    GRANT USAGE ON SCHEMA public TO myreadonlyuser;
    ```
-   **Purpose**: By executing this command, the `myreadonlyuser` is granted USAGE rights on the public schema. This permission is essential for the user to access and execute SELECT commands on the tables within the public schema. However, it does not allow the user to modify the schema itself or any of its objects, aligning with the principle of least privilege and ensuring database integrity.

### Grant Select on All Tables

-   **Command**:
    ```sql
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO myreadonlyuser;
    ```
-   **Purpose**: This command specifically grants the `myreadonlyuser` the ability to execute SELECT queries on all existing tables within the public schema. This comprehensive permission is crucial for enabling read-only access to the database's data, allowing for data retrieval without compromising the security or integrity of the data itself.

### Setting the Default Schema Search Path

-   **Command**:
    ```sql
    ALTER USER myreadonlyuser SET search_path TO public;
    ```
-   **Purpose**: This command is used to define the default schema that the `myreadonlyuser` will interact with when executing queries. By setting the `search_path` to `public`, it ensures that this user, when querying the database, will by default look into the `public` schema unless specified otherwise.

-   **Detailed Explanation**:
    -   **Schema in PostgreSQL**: In PostgreSQL, a schema is like a namespace that contains named database objects such as tables, views, indexes, data types, functions, and operators. By default, PostgreSQL provides a schema named `public`.
    -   **Default Search Path**: When a database user executes a query that does not explicitly specify a schema, PostgreSQL uses the `search_path` setting to determine which schema to search for the named database objects.
    -   **Security Consideration**: For `myreadonlyuser`, setting the search path to `public` is a security measure. It restricts the user's default interaction to the `public` schema, reducing the risk of accidentally accessing or modifying objects in other schemas, which might contain sensitive or critical information.
    -   **Simplifying Access**: This setting simplifies database operations for `myreadonlyuser`, as they do not have to specify the schema name each time they access objects in the default `public` schema. It streamlines the process of querying the database, making it more efficient for users who primarily interact with objects in the `public` schema.

---

## Verification Steps

After configuring the read-only user and setting up the firewall, it's crucial to verify that these changes have been implemented correctly and are functioning as intended. This ensures that the database environment is secure and accessible only as per the defined permissions.

### Verify User Existence

-   **Command**:
    ```sql
    SELECT 'User exists' AS Status
    FROM pg_roles
    WHERE rolname = 'myreadonlyuser';
    ```
-   **Purpose**: This SQL query checks for the existence of `myreadonlyuser` in the database's role list. The command aims to confirm the successful creation of the user.

### Check CONNECT Privilege

-   **Command**:
    ```sql
    SELECT
        CASE
            WHEN has_database_privilege('myreadonlyuser', 'mydatabase', 'CONNECT')
            THEN 'User myreadonlyuser has CONNECT privilege on mydatabase'
            ELSE 'User myreadonlyuser does NOT have CONNECT privilege on mydatabase'
        END AS status_message;
    ```
-   **Purpose**: This command evaluates whether the `myreadonlyuser` has been correctly granted CONNECT privileges to `mydatabase`. It's a critical verification step to confirm that the user can access the database as intended, aligning with the security configuration that restricts the user to read-only access.

### Validate SELECT Privileges

-   **Command**:

    ```sql
      DO $$
      DECLARE
          user_name text := 'myreadonlyuser';
          non_select_privileges_count int;
      BEGIN
          -- Count any privileges that are not SELECT for the specified user
          SELECT COUNT(*)
          INTO non_select_privileges_count
          FROM information_schema.table_privileges
          WHERE grantee = user_name
          AND privilege_type <> 'SELECT';

          -- Check if count is zero (which means only SELECT privileges are present)
          IF non_select_privileges_count = 0 THEN
              RAISE NOTICE 'Everything is OK: User % has only SELECT privileges on all tables.', user_name;
          ELSE
              RAISE NOTICE 'Attention needed: User % has other privileges besides SELECT on some tables.', user_name;
          END IF;
      END $$;
    ```

-   **Purpose**: This PL/pgSQL script is designed to verify that `myreadonlyuser` has exclusively SELECT privileges on the tables within the database. It counts any privileges other than SELECT that might have been inadvertently granted to the user. This verification is crucial to ensure that the user does not possess any additional privileges that could allow data modification, deletion, or other actions that could compromise data integrity and security.

Following these verification steps ensures that the database is configured as intended, with strict access controls and user privileges that align with the security objectives of the implementation.

---

## Setting Query Execution Time Limits

Setting query execution time limits is an important aspect of database management, particularly for a read-only user. It helps in preventing long-running queries from overloading the database, ensuring efficient utilization of resources.

### Alter Role for Query Timeout

-   **Command**:
    ```sql
    ALTER ROLE myreadonlyuser SET statement_timeout = 30000;
    ```
-   **Purpose**: This command sets a timeout limit for queries executed by `myreadonlyuser`. The `statement_timeout` parameter is set to 30000 milliseconds (or 30 seconds), meaning if a query executed by this user takes longer than this duration, it will be automatically terminated. This limit is crucial for preventing resource hogging by long-running queries, potentially caused by overly complex requests or unintentional database misuse. It ensures that the database's performance remains stable and efficient by avoiding prolonged occupation of database resources.

### Show Current Timeout Setting

-   **Command**:
    ```sql
    SHOW statement_timeout;
    ```
-   **Purpose**: This command is used to display the current setting of `statement_timeout` for the session. Executing this after setting the timeout confirms whether the change has been successfully applied. It's a straightforward way to verify that the database will enforce the intended time constraints on query execution, providing reassurance that the database's operational parameters are aligned with the desired performance and security standards.

---

## Firewall Setup

Configuring the firewall is a critical step in securing the database environment. It involves restricting access to the database server, specifically to the TimescaleDB port (5432), to prevent unauthorized access. This section covers two approaches: using Uncomplicated Firewall (UFW) and implementing a dedicated firewall solution such as one offered by a cloud service provider like Digital Ocean.

### Using UFW to Restrict Access

#### Overview

UFW, or Uncomplicated Firewall, is a user-friendly interface for managing iptables in Linux. It simplifies the process of configuring a firewall and is an effective way to control access to your server.

#### Steps

1. **Enable UFW**:

    - Command: `sudo ufw enable`
    - Purpose: This command activates UFW on the server. It's essential to ensure that the firewall is running to apply any rules and policies for network traffic.

1. **Set Specific Deny Rule for Port 5432**:

    - Command: `sudo ufw deny from any to any port 5432`
    - Purpose: This command adds a specific rule to UFW that denies all incoming traffic to port 5432, which is the default port used by TimescaleDB. By doing this, we ensure that no unauthorized external access to the database port is allowed. This step is crucial in securing the database against potential external threats and unauthorized access attempts.

1. **Allow Specific IPs on Port 5432**:

    - Command: `sudo ufw allow from [IP_ADDRESS] to any port 5432`
    - Purpose: After denying all incoming traffic to port 5432, this rule allows access to the same port only from specified, trusted IP addresses. This configuration is essential for maintaining strict access control, limiting database connectivity exclusively to known sources, thereby enhancing the security posture of the database server.

1. **Verify Firewall Rules**:
    - Command: `sudo ufw status`
    - Purpose: This command displays the current rules set in UFW. It's used to confirm that the firewall configuration has been correctly applied and is in effect.

### Implementing a Dedicated Firewall

#### Overview

Using a dedicated firewall service, such as those provided by cloud platforms like Digital Ocean, offers an advanced level of security management. These services often come with more sophisticated features and easier management interfaces compared to traditional firewall solutions.

#### Steps

1. **Selecting a Firewall Service**:

    - Purpose: Choose a dedicated firewall service that suits your security needs, budget, and compatibility with your existing infrastructure. Cloud-based firewalls often provide enhanced security features and easier management interfaces.

2. **Configure Firewall Rules**:

    - Purpose: Set up rules to allow or deny traffic to and from your server. Specifically, restrict access to the TimescaleDB port (5432) to only known IP addresses or networks. This step is crucial to protect your server from unauthorized access attempts.

3. **Apply and Monitor Firewall Settings**:
    - Purpose: After configuring the rules, apply them to your server. Continuously monitor the firewall logs to identify any unauthorized access attempts or other security threats.

---

🟣 [Back to Wolfram ChatBot Use Case](./wolfram-chatbot.md)
