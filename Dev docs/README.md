# Synthetic Data API

A flexible, lightweight API for generating synthetic data—perfect for testing, prototyping, or learning. Built with Node.js, this project uses Faker.js to create realistic fake data like users, transactions, and custom datasets, all served via a simple REST API.

## Features
- Generate realistic data (e.g., names, emails, transactions) on demand.
- Customizable output with query parameters (e.g., `count`, `fields`, `seed`).
- Supports JSON and CSV formats, with streaming for large datasets.
- Rate-limited to 100 requests per minute for stability.
- POST your own schema to create fully custom data.

## For Developers: How It Works
Here’s a deep dive into the code in `index.js`—explained simply for beginners, with technical details for pros.

### File Structure
synthetic-data-api/
├── index.js          // The main API code
├── package.json      // Lists dependencies
├── package-lock.json // Locks dependency versions
└── node_modules/     // Installed packages (don’t edit)

### Tech Stack
- **Node.js**: The platform that runs the server.
- **Express**: Manages web requests (e.g., `GET /users`).
- **Faker.js**: Creates realistic fake data (names, emails, etc.).
- **json-stream-stringify**: Streams large JSON responses for big requests.
- **body-parser**: Reads JSON data sent to `/custom`.
- **express-rate-limit**: Caps usage at 100 requests per minute.

### Code Breakdown

#### Setup
```javascript
const express = require('express');
const { faker } = require('@faker-js/faker');
const app = express();
const port = process.env.PORT || 3000;

Loads the tools and sets the server to run on a port (3000 locally, or Render’s choice when deployed).

Middleware

app.use(bodyParser.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100, message: {...}, headers: true }));

bodyParser: Lets /custom understand JSON requests.
rateLimit: Prevents overload by limiting to 100 requests per minute.
Helper Functions

const getCount = (queryCount) => Math.min(Math.max(parseInt(queryCount) || 5, 1), 10000);
const setSeed = (req) => { if (req.query.seed) faker.seed(parseInt(req.query.seed)); };

getCount: Turns count into a number between 1 and 10,000 (defaults to 5 if missing).
setSeed: Locks randomness with a seed (e.g., seed=123 gives the same data every time).
Key Endpoints
Root (/):

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Synthetic Data API!', docs: '/docs' });
});

A simple welcome that points to /docs.

Users (/users):

app.get('/users', (req, res) => {
  try {
    setSeed(req);
    const count = getCount(req.query.count);
    const fields = req.query.fields ? req.query.fields.split(',') : [...];
    // Logic to generate users, handle csv/json, stream big data
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

Generates users with custom fields, supports streaming for large counts (>1000), and catches errors (e.g., bad count).

Transactions (/transactions):

app.get('/transactions', (req, res) => {
  try {
    setSeed(req);
    const count = getCount(req.query.count);
    const userPool = generateUserPool(Math.min(count, 100));
    // Links users and products in transactions
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

Creates transactions tied to a pool of users and products.

Custom (/custom):

app.post('/custom', (req, res) => {
  try {
    setSeed(req);
    const schema = req.body.schema || {};
    // Builds data based on user-defined schema
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

Lets developers define their own data structure via POST.

Other endpoints follow similar patterns—generate data, add realistic details (e.g., variants for products), and return it as JSON.

Running Locally
Want to run it yourself? Here’s how:

Clone the Repo

git clone [your-repo-url]

nstall Dependencies

cd synthetic-data-api
npm install

Start the Server

node index.js

Test It Open your browser to http://localhost:3000/docs

Contributing
Got ideas or found a bug? Open an issue on GitHub! Contributions are welcome—team up with the community to make this API even better.

License
[Add your preferred license here, e.g., MIT License]
