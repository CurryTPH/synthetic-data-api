const express = require('express');
const { faker } = require('@faker-js/faker');
const app = express();
const port = process.env.PORT || 3000;

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

app.get('/users', (req, res) => {
    const count = getCount(req.query.count);
    const fields = req.query.fields ? req.query.fields.split(',') : ['name', 'email', 'age', 'address'];
    const format = req.query.format || 'json';
    const ageRange = req.query.ageRange ? req.query.ageRange.split('-').map(Number) : [18, 80];
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
        if (fields.includes('job')) user.job = faker.person.jobTitle();
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
    } else {
        res.json(users);
    }
});

app.get('/transactions', (req, res) => {
    const count = getCount(req.query.count);
    const userPool = generateUserPool(Math.min(count, 100));
    const productPool = generateProductPool(Math.min(count, 50));
    const transactions = [];

    for (let i = 0; i < count; i++) {
        const user = userPool[Math.floor(Math.random() * userPool.length)];
        const product = productPool[Math.floor(Math.random() * productPool.length)];
        const transaction = {
            id: faker.string.uuid(),
            user: {
                id: user.id,
                name: user.name
            },
            product: {
                id: product.id,
                name: product.name,
                price: product.price
            },
            amount: faker.finance.amount(1, 1000, 2),
            currency: faker.finance.currencyCode(),
            date: faker.date.recent({ days: 30 }).toISOString(),
            status: faker.helpers.arrayElement(['completed', 'pending', 'failed'])
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
});

app.get('/companies', (req, res) => {
    const count = getCount(req.query.count);
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
});

app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});