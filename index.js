const express = require('express');
const { faker } = require('@faker-js/faker');
const { JsonStreamStringify } = require('json-stream-stringify');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: { error: 'Too many requests, retry after 60 seconds' },
    headers: true
}));

// Helper functions
const getCount = (queryCount) => {
    const count = parseInt(queryCount) || 5;
    return Math.min(Math.max(count, 1), 10000); // 1 to 10,000
};

const setSeed = (req) => {
    if (req.query.seed) faker.seed(parseInt(req.query.seed));
};

const generateUserPool = (count) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        users.push({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number()
        });
    }
    return users;
};

const generateProductPool = (count) => {
    const products = [];
    for (let i = 0; i < count; i++) {
        products.push({
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            price: parseFloat(faker.commerce.price({ min: 1, max: 500 })),
            category: faker.commerce.department()
        });
    }
    return products;
};

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Synthetic Data API! Visit /docs for documentation.', docs: 'https://synthetic-data-api.onrender.com/docs' });
});

// /docs endpoint
app.get('/docs', (req, res) => {
    const docs = {
        endpoints: {
            '/users': {
                description: 'Generate synthetic user data',
                parameters: {
                    count: 'Number of users (1-10000, default 5)',
                    fields: 'Comma-separated: name, email, age, address, phone, job',
                    ageRange: 'Min-max age (e.g., 20-30)',
                    format: 'json or csv',
                    locale: 'e.g., en, fr, es, de (default en)',
                    seed: 'Number to fix randomness'
                },
                example: 'https://synthetic-data-api.onrender.com/users?count=2&locale=fr&seed=123'
            },
            '/transactions': {
                description: 'Generate synthetic transactions with user/product links',
                parameters: { count: '1-10000', seed: 'Fix randomness' },
                example: 'https://synthetic-data-api.onrender.com/transactions?count=3'
            },
            '/products': {
                description: 'Generate synthetic products with variants',
                parameters: { count: '1-10000', seed: 'Fix randomness' },
                example: 'https://synthetic-data-api.onrender.com/products?count=2'
            },
            '/companies': {
                description: 'Generate synthetic companies with departments',
                parameters: { count: '1-10000', seed: 'Fix randomness' },
                example: 'https://synthetic-data-api.onrender.com/companies?count=1'
            },
            '/dataset': {
                description: 'Generate related users, products, transactions',
                parameters: { count: '1-10000', seed: 'Fix randomness' },
                example: 'https://synthetic-data-api.onrender.com/dataset?count=5'
            },
            '/timeseries': {
                description: 'Generate time-series data',
                parameters: {
                    count: '1-10000',
                    start: 'ISO date (e.g., 2024-01-01)',
                    interval: 'day, hour, minute (default day)',
                    seed: 'Fix randomness'
                },
                example: 'https://synthetic-data-api.onrender.com/timeseries?count=5&interval=hour'
            },
            '/custom': {
                description: 'Generate custom data via POST',
                parameters: { count: '1-10000', seed: 'Fix randomness', schema: 'JSON body' },
                example: 'POST https://synthetic-data-api.onrender.com/custom with {"schema": {"name": "name", "score": "number"}}'
            }
        },
        version: '1.0.0',
        baseUrl: 'https://synthetic-data-api.onrender.com'
    };
    res.json(docs);
});

// /users endpoint (simplified streaming logic for reliability)
app.get('/users', (req, res) => {
    try {
        setSeed(req);
        const count = getCount(req.query.count);
        if (isNaN(count)) throw new Error('Invalid count');
        const fields = req.query.fields ? req.query.fields.split(',').filter(f => ['name', 'email', 'age', 'address', 'phone', 'job'].includes(f)) : ['name', 'email', 'age', 'address'];
        const format = req.query.format || 'json';
        const ageRange = req.query.ageRange ? req.query.ageRange.split('-').map(Number) : [18, 80];
        if (ageRange.length !== 2 || isNaN(ageRange[0]) || isNaN(ageRange[1])) throw new Error('Invalid ageRange');
        const locale = req.query.locale || 'en';
        faker.locale = locale;

        const users = [];
        for (let i = 0; i < count; i++) {
            const user = {};
            if (fields.includes('name')) user.name = faker.person.fullName();
            if (fields.includes('email')) user.email = faker.internet.email();
            if (fields.includes('age')) user.age = faker.number.int({ min: ageRange[0], max: ageRange[1] });
            if (fields.includes('address')) {
                user.address = {
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    country: faker.location.country(),
                    zipCode: faker.location.zipCode()
                };
            }
            if (fields.includes('phone')) user.phone = faker.phone.number();
            if (fields.includes('job')) {
                const age = user.age || faker.number.int({ min: ageRange[0], max: ageRange[1] });
                user.job = age < 30 ? faker.person.jobType() : faker.person.jobTitle();
            }
            users.push(user);
        }

        if (format === 'csv') {
            let csv = fields.join(',') + '\n';
            users.forEach(u => {
                const row = fields.map(f => {
                    if (f === 'address') return `${u.address?.street || ''},${u.address?.city || ''},${u.address?.country || ''}`;
                    return u[f] || '';
                }).join(',');
                csv += row + '\n';
            });
            res.header('Content-Type', 'text/csv');
            res.send(csv);
        } else if (count > 1000) {
            const usersStream = () => {
                let i = 0;
                return {
                    next: () => {
                        if (i >= count) return null;
                        const user = users[i];
                        i++;
                        return user;
                    }
                };
            };
            res.setHeader('Content-Type', 'application/json');
            new JsonStreamStringify(usersStream()).pipe(res);
        } else {
            res.json(users);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// /transactions endpoint
app.get('/transactions', (req, res) => {
    try {
        setSeed(req);
        const count = getCount(req.query.count);
        if (isNaN(count)) throw new Error('Invalid count');
        const userPool = generateUserPool(Math.min(count, 100));
        const productPool = generateProductPool(Math.min(count, 50));
        const transactions = [];

        for (let i = 0; i < count; i++) {
            const user = userPool[Math.floor(Math.random() * userPool.length)];
            const product = productPool[Math.floor(Math.random() * productPool.length)];
            const transaction = {
                id: faker.string.uuid(),
                user: { id: user.id, name: user.name },
                product: { id: product.id, name: product.name, price: product.price },
                amount: faker.finance.amount(1, 1000, 2),
                currency: faker.finance.currencyCode(),
                date: faker.date.recent({ days: 30 }).toISOString(),
                status: faker.helpers.arrayElement(['completed', 'pending', 'failed'])
            };
            transactions.push(transaction);
        }
        res.json(transactions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// /products endpoint
app.get('/products', (req, res) => {
    try {
        setSeed(req);
        const count = getCount(req.query.count);
        if (isNaN(count)) throw new Error('Invalid count');
        const products = [];

        for (let i = 0; i < count; i++) {
            const product = {
                id: faker.string.uuid(),
                name: faker.commerce.productName(),
                price: parseFloat(faker.commerce.price({ min: 1, max: 500 })),
                category: faker.commerce.department(),
                inStock: faker.datatype.boolean(),
                variants: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
                    size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
                    color: faker.color.human(),
                    stock: faker.number.int({ min: 0, max: 100 })
                }))
            };
            products.push(product);
        }
        res.json(products);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// /companies endpoint
app.get('/companies', (req, res) => {
    try {
        setSeed(req);
        const count = getCount(req.query.count);
        if (isNaN(count)) throw new Error('Invalid count');
        const companies = [];

        for (let i = 0; i < count; i++) {
            const company = {
                name: faker.company.name(),
                industry: faker.company.buzzPhrase(),
                employees: faker.number.int({ min: 10, max: 10000 }),
                location: faker.location.city(),
                departments: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
                    name: faker.commerce.department(),
                    head: faker.person.fullName(),
                    budget: faker.finance.amount(10000, 1000000, 0)
                }))
            };
            companies.push(company);
        }
        res.json(companies);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// /dataset endpoint
app.get('/dataset', (req, res) => {
    try {
        setSeed(req);
        const count = getCount(req.query.count);
        if (isNaN(count)) throw new Error('Invalid count');
        const users = generateUserPool(count);
        const products = generateProductPool(count);
        const transactions = [];

        for (let i = 0; i < count; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const product = products[Math.floor(Math.random() * products.length)];
            transactions.push({
                id: faker.string.uuid(),
                user: { id: user.id, name: user.name },
                product: { id: product.id, name: product.name, price: product.price },
                amount: faker.finance.amount(1, 1000, 2),
                date: faker.date.recent({ days: 30 }).toISOString()
            });
        }
        res.json({ users, products, transactions });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// /timeseries endpoint
app.get('/timeseries', (req, res) => {
    try {
        setSeed(req);
        const count = getCount(req.query.count);
        if (isNaN(count)) throw new Error('Invalid count');
        const startDate = req.query.start ? new Date(req.query.start) : faker.date.past({ years: 1 });
        if (isNaN(startDate)) throw new Error('Invalid start date');
        const interval = req.query.interval || 'day';
        if (!['day', 'hour', 'minute'].includes(interval)) throw new Error('Invalid interval');
        const timeseries = [];

        for (let i = 0; i < count; i++) {
            const date = new Date(startDate);
            if (interval === 'day') date.setDate(date.getDate() + i);
            if (interval === 'hour') date.setHours(date.getHours() + i);
            if (interval === 'minute') date.setMinutes(date.getMinutes() + i);
            timeseries.push({
                timestamp: date.toISOString(),
                value: faker.finance.amount(1, 1000, 2),
                category: faker.commerce.department()
            });
        }
        res.json(timeseries);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// /custom endpoint
app.post('/custom', (req, res) => {
    try {
        setSeed(req);
        const count = getCount(req.query.count);
        if (isNaN(count)) throw new Error('Invalid count');
        const schema = req.body.schema || {};
        if (Object.keys(schema).length === 0) throw new Error('Schema required');
        const data = [];

        for (let i = 0; i < count; i++) {
            const item = {};
            for (let [key, type] of Object.entries(schema)) {
                if (type === 'name') item[key] = faker.person.fullName();
                if (type === 'email') item[key] = faker.internet.email();
                if (type === 'number') item[key] = faker.number.int({ min: 1, max: 100 });
                if (type === 'address') item[key] = faker.location.streetAddress();
            }
            data.push(item);
        }
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});