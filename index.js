const express = require('express');
const { faker } = require('@faker-js/faker');
const db = require('./database');
const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    const endpoint = req.path;
    const timestamp = new Date().toISOString();
    db.run(`INSERT INTO requests (endpoint, timestamp) VALUES (?, ?)`, [endpoint, timestamp]);
    next();
});

const getCount = (queryCount) => {
    const count = parseInt(queryCount) || 5;
    return Math.min(Math.max(count, 1), 10000);
};

const generateUserPool = (count) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        users.push({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email()
        });
    }
    return users;
};

app.get('/users', (req, res) => {
    const count = getCount(req.query.count);
    const fields = req.query.fields ? req.query.fields.split(',') : ['name', 'email', 'age', 'address'];
    const format = req.query.format || 'json';
    const users = [];

    for (let i = 0; i < count; i++) {
        const user = {};
        if (fields.includes('name')) user.name = faker.person.fullName();
        if (fields.includes('email')) user.email = faker.internet.email();
        if (fields.includes('age')) user.age = faker.number.int({ min: 18, max: 80 });
        if (fields.includes('address')) {
            user.address = {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                country: faker.location.country()
            };
        }
        if (fields.includes('phone')) user.phone = faker.phone.number();
        users.push(user);
    }

    if (format === 'csv') {
        let csv = 'name,email,age,street,city,country,phone\n';
        users.forEach(u => {
            csv += `${u.name || ''},${u.email || ''},${u.age || ''},${u.address?.street || ''},${u.address?.city || ''},${u.address?.country || ''},${u.phone || ''}\n`;
        });
        res.header('Content-Type', 'text/csv');
        res.send(csv);
    } else {
        res.json(users);
    }
});

app.get('/transactions', (req, res) => {
    const count = getCount(req.query.count);
    const userPool = generateUserPool(Math.min(count, 100));
    const transactions = [];

    for (let i = 0; i < count; i++) {
        const user = userPool[Math.floor(Math.random() * userPool.length)];
        const transaction = {
            id: faker.string.uuid(),
            userId: user.id,
            userName: user.name,
            amount: faker.finance.amount(1, 1000, 2),
            currency: faker.finance.currencyCode(),
            date: faker.date.recent({ days: 30 }).toISOString(),
            description: faker.commerce.productName()
        };
        transactions.push(transaction);
    }
    res.json(transactions);
});

app.get('/products', (req, res) => {
    const count = getCount(req.query.count);
    const products = [];

    for (let i = 0; i < count; i++) {
        const product = {
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            price: faker.commerce.price({ min: 1, max: 500 }),
            category: faker.commerce.department(),
            inStock: faker.datatype.boolean()
        };
        products.push(product);
    }
    res.json(products);
});

app.get('/companies', (req, res) => {
    const count = getCount(req.query.count);
    const companies = [];

    for (let i = 0; i < count; i++) {
        const company = {
            name: faker.company.name(),
            industry: faker.company.buzzPhrase(),
            employees: faker.number.int({ min: 10, max: 10000 }),
            location: faker.location.city()
        };
        companies.push(company);
    }
    res.json(companies);
});

app.get('/stats', (req, res) => {
    db.all(`SELECT endpoint, COUNT(*) as count FROM requests GROUP BY endpoint`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else {
            const total = rows.reduce((sum, row) => sum + row.count, 0);
            res.json({ totalRequests: total, endpoints: rows });
        }
    });
});

app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});