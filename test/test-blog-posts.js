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
