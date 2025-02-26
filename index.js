const express = require('express');
const { faker } = require('@faker-js/faker');
const app = express();
const port = process.env.PORT || 3000; // Use Render's port or 3000 locally
let requestCount = 0;

// API endpoint to generate synthetic user data
app.get('/users', (req, res) => {
  requestCount++; // Increment counter
  console.log(`Total requests: ${requestCount}`);
  const numberOfUsers = req.query.count || 5;
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

  res.json(users);
});

// Start the server
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
<<<<<<< HEAD
});
=======
});
>>>>>>> e285fbbb6a586fcf257b6d5c188fc7a1f1c40fad
