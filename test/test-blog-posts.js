'use strict';

const chai = require('chai');
const chaiHttp = require('chai-htp');
const faker = require('faker');
const mongoose = require('mongoose');

//this makes the expect syntax available throught this bodule
const expect = chai.expect;

const { BlogPost } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function tearDownDb() {
    return new Promise((resolve, reject) => {
        console.warn('Deleting database');
        mongoose.connection
            .dropDatabase()
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}

function seedBlogPostData() {
    console.info('seeding blog post data');
    const seedData = [];
    for (let i = 1; i <= 10; i++) {
        seedData.push({
            author: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName()
            },
            title: faker.lorem.sentence(),
            content: faker.lorem.text()
        });
    }
    // this will return a promise
    return BlogPost.insertMany(seedData);
}
