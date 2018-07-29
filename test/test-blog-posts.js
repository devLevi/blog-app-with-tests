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

function seedBlogPostData() {
    console.info('seeding restaurant data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateBlogPostData());
    }
    return Restaurant.insertMany(seedData);
}
