# Synthetic Data Generation API

Welcome to the **Synthetic Data Generation API**! This is a free, powerful tool designed to generate realistic fake data for testing, prototyping, or training AI models. Whether you're a beginner working on your first app or an experienced developer needing complex datasets, this API is built for you. It’s live at [https://synthetic-data-api.onrender.com/](https://synthetic-data-api.onrender.com/)—try it out right now!

## What Does It Do?

This API creates synthetic (fake but realistic) data on demand. You can generate:

- **Users**: Names, emails, ages, addresses, phone numbers, and jobs.
- **Transactions**: Purchases linked to users and products.
- **Products**: Items with prices, categories, and variants (like sizes or colors).
- **Companies**: Businesses with departments and employee details.
- **Datasets**: Full sets of related users, products, and transactions.
- **Time-Series**: Data over time (e.g., sales by hour or day).
- **Custom Data**: Any structure you define!

It’s simple to use—just type a URL in your browser—and packed with features to rival paid tools.

## Why Use It?

- **Free**: No cost, no sign-up needed.
- **Flexible**: Customize data with easy parameters (e.g., `?count=10` or `?locale=fr`).
- **Realistic**: Data mimics real-world patterns (e.g., younger users get entry-level jobs).
- **Scalable**: Handles small requests (2 users) or massive ones (10,000 records).
- **Global**: Supports languages like French, Spanish, German, and more.

## How to Use It

You don’t need coding skills to start—just open your browser and type a URL! Below are instructions and examples for everyone, plus details for developers.

### Base URL

All requests start with:  
`https://synthetic-data-api.onrender.com/`

### Endpoints

Here’s every endpoint, what it does, and an example URL:

| Endpoint            | What It Does                                       | Example URL                                                                 |
|---------------------|----------------------------------------------------|-----------------------------------------------------------------------------|
| `/`                 | Shows a welcome message                            | [https://synthetic-data-api.onrender.com/](https://synthetic-data-api.onrender.com/) |
| `/docs`             | Full API documentation                             | [https://synthetic-data-api.onrender.com/docs](https://synthetic-data-api.onrender.com/docs) |
| `/users`            | Generate fake users                                | [https://synthetic-data-api.onrender.com/users?count=2&locale=fr](https://synthetic-data-api.onrender.com/users?count=2&locale=fr) |
| `/transactions`     | Generate fake transactions                         | [https://synthetic-data-api.onrender.com/transactions?count=3](https://synthetic-data-api.onrender.com/transactions?count=3) |
| `/products`         | Generate fake products                             | [https://synthetic-data-api.onrender.com/products?count=2](https://synthetic-data-api.onrender.com/products?count=2) |
| `/companies`        | Generate fake companies                            | [https://synthetic-data-api.onrender.com/companies?count=1](https://synthetic-data-api.onrender.com/companies?count=1) |
| `/dataset`          | Generate related users/products/transactions       | [https://synthetic-data-api.onrender.com/dataset?count=5](https://synthetic-data-api.onrender.com/dataset?count=5) |
| `/timeseries`       | Generate time-based data                           | [https://synthetic-data-api.onrender.com/timeseries?count=5&interval=hour](https://synthetic-data-api.onrender.com/timeseries?count=5&interval=hour) |
| `/custom` (POST)    | Generate custom data (see below)                   | —                                                                           |

### Parameters (for All Endpoints Except `/custom`)

Add these to the URL with `?` and `&` (e.g., `?count=10&locale=es`):

- `count`: Number of items to generate (1 to 10,000, default is 5).
- `seed`: A number to get the same data every time (e.g., `123` for repeatable results).

**Specific to `/users`:**

- `fields`: Choose what data you want (e.g., `name,email,age`). Options: `name`, `email`, `age`, `address`, `phone`, `job`.
- `ageRange`: Set a min-max age (e.g., `20-30`).
- `format`: Get data as `json` (default) or `csv`.
- `locale`: Language for names/addresses (e.g., `en` for English, `fr` for French, `es` for Spanish, `de` for German).

**Specific to `/timeseries`:**

- `start`: Starting date in ISO format (e.g., `2024-01-01`).
- `interval`: Time gap between entries (`day`, `hour`, or `minute`, default is `day`).

### Examples

1. **Get 2 French Users**:
   - **URL**:  
     `https://synthetic-data-api.onrender.com/users?count=2&locale=fr&seed=123`
   - **Output (JSON)**:
     ```json
     [
       {
         "name": "Jean Dupont",
         "email": "jean.dupont@example.com",
         "age": 42,
         "address": {
           "street": "12 Rue de Paris",
           "city": "Lyon",
           "country": "France",
           "zipCode": "69001"
         },
         "phone": "+33 6 12 34 56 78",
         "job": "Manager"
       },
       {
         "name": "Marie Lefèvre",
         "email": "marie.lefevre@example.com",
         "age": 35,
         "address": {
           "street": "45 Avenue Victor Hugo",
           "city": "Paris",
           "country": "France",
           "zipCode": "75016"
         },
         "phone": "+33 6 98 76 54 32",
         "job": "Technician"
       }
     ]
     ```

2. **Get 3 Transactions**:
   - **URL**:  
     `https://synthetic-data-api.onrender.com/transactions?count=3`
   - **Output (JSON)**:
     ```json
     [
       {
         "id": "550e8400-e29b-41d4-a716-446655440000",
         "user": { "id": "...", "name": "Alice Smith" },
         "product": { "id": "...", "name": "Blue T-Shirt", "price": 19.99 },
         "amount": "25.50",
         "currency": "USD",
         "date": "2025-02-20T10:15:30Z",
         "status": "completed"
       },
       {
         "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
         "user": { "id": "...", "name": "Bob Jones" },
         "product": { "id": "...", "name": "Wireless Mouse", "price": 29.95 },
         "amount": "29.95",
         "currency": "USD",
         "date": "2025-02-21T14:22:17Z",
         "status": "pending"
       },
       {
         "id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
         "user": { "id": "...", "name": "Charlie Brown" },
         "product": { "id": "...", "name": "Laptop Charger", "price": 45.00 },
         "amount": "50.25",
         "currency": "USD",
         "date": "2025-02-22T09:05:43Z",
         "status": "failed"
       }
     ]
     ```

3. **Get 5 Hours of Sales Data**:
   - **URL**:  
     `https://synthetic-data-api.onrender.com/timeseries?count=5&interval=hour`
   - **Output (JSON)**:
     ```json
     [
       {"timestamp": "2025-01-25T10:00:00Z", "value": "150.75", "category": "Electronics"},
       {"timestamp": "2025-01-25T11:00:00Z", "value": "89.20", "category": "Clothing"},
       {"timestamp": "2025-01-25T12:00:00Z", "value": "320.50", "category": "Books"},
       {"timestamp": "2025-01-25T13:00:00Z", "value": "45.90", "category": "Toys"},
       {"timestamp": "2025-01-25T14:00:00Z", "value": "210.30", "category": "Furniture"}
     ]
     ```

4. **Get 2 Products**:
   - **URL**:  
     `https://synthetic-data-api.onrender.com/products?count=2`
   - **Output (JSON)**:
     ```json
     [
       {
         "id": "123e4567-e89b-12d3-a456-426614174000",
         "name": "Leather Jacket",
         "price": 199.99,
         "category": "Clothing",
         "inStock": true,
         "variants": [
           {"size": "M", "color": "Black", "stock": 15},
           {"size": "L", "color": "Brown", "stock": 8}
         ]
       },
       {
         "id": "987fcdeb-12d3-45e6-7890-426614174000",
         "name": "Bluetooth Speaker",
         "price": 49.95,
         "category": "Electronics",
         "inStock": false,
         "variants": [
           {"size": "S", "color": "Blue", "stock": 0}
         ]
       }
     ]
     ```

5. **Custom Endpoint (`/custom`)**

   This uses a POST request, so it’s not a simple browser URL. Developers can send a JSON "schema" to create their own data structure.

   - **URL**:  
     `https://synthetic-data-api.onrender.com/custom?count=3`
   - **Method**: POST
   - **Body (JSON)**:
     ```json
     {
       "schema": {
         "name": "name",
         "score": "number",
         "location": "address"
       }
     }
     ```
   - **Output (JSON)**:
     ```json
     [
       {"name": "Alice Smith", "score": 42, "location": "123 Main St"},
       {"name": "Bob Jones", "score": 87, "location": "456 Oak Ave"},
       {"name": "Charlie Brown", "score": 15, "location": "789 Pine Rd"}
     ]
     ```

6. **How to Test: Use Postman**

   - Download and install Postman.
   - Create a new request, set it to POST, and enter the URL.
   - Go to “Body,” select “raw,” choose “JSON,” paste the schema, and click “Send.”

### Rate Limits

You can make up to 100 requests per minute. If you hit the limit, you’ll get:

```json
{"error": "Too many requests, retry after 60 seconds"}
