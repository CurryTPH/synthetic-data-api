const express = require('express');
const { faker } = require('@faker-js/faker');
const app = express();
const port = 3000;

// API endpoint to generate synthetic user data
app.get('/users', (req, res) => {
    const numberOfUsers = req.query.count || 5; // Default to 5 users if no count is provided
    const users = [];

    for (let i = 0; i < numberOfUsers; i++) {
        const user = {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            age: faker.number.int({ min: 18, max: 80 }),
            address: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                country: faker.location.country()
            }
        };
        users.push(user);
    }

    res.json(users); // Send the data as JSON
});

// Start the server
app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});