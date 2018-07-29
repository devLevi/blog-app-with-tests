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

describe('Blog Posts API resource', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedBlogPostData();
    });

    afterEach(function() {
        return tearDownDb();
    });
    after(function() {
        return closeServer();
    });
    describe('GET endpoint', function() {
        it('should return all existing blog posts', function() {
            let res; 
            return chai.request(app)
                .get('/blogposts')
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expet(res.body.blogposts).to.have.lenthOf.at.least(1);
                    return BlogPost.count();
                })
                .then(function(count) {
                    expect(res.body.blogposts).to.have.lengthOf(count);
                });
        });
        
        it('should return blog posts with correct fields', function() {
            let resBlogPost;
            return chai.request(app)
                .get('/blogposts')
                .then(function(res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.blogposts).to.be.a('array');
                    expect(res.body.blogposts).to.have.lengthOf.at.least(1);

                    res.body.blogposts.forEach(function(blogpost) {
                        expect(blogpost).to.be.a('object');
                        expect(blogpost).to.include.keys(
                            'id', 'title', 'author', 'content');
                    });
                    resBlogPost = res.body.blogposts[0];
                    return BlogPost.findById(resBlogPost.id);
                })
                .then(function(blogpost) {
                    expect(resBlogPost.id).to.equal(blogpost.id);
                    expect(resBlogPost.title).to.equal(blogpost.title);
                    expect(resBlogPost.author)to.equal(blogpost.author);
                    expect(resBlogPost.content).to.equal(blogpost.content);
                })
        })
    })
}