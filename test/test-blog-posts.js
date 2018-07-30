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

function seedpostsData() {
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
            return chai
                .request(app)
                .get('/posts')
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res.body.post).to.have.lenthOf.at.least(1);
                    return BlogPost.count();
                })
                .then(function(count) {
                    expect(res.body.post).to.have.lengthOf(count);
                });
        });

        it('should return blog posts with correct fields', function() {
            let resPost;
            return chai
                .request(app)
                .get('/posts')
                .then(function(res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.post).to.be.a('array');
                    expect(res.body.post).to.have.lengthOf.at.least(1);

                    res.body.forEach(function(post) {
                        expect(post).to.be.a('object');
                        expect(post).to.include.keys(
                            'id',
                            'title',
                            'author',
                            'content',
                            'created'
                        );
                    });
                    resPost = res.body[0];
                    return BlogPost.findById(resPost.id);
                })
                .then(function(post) {
                    expect(resPost.title).to.equal(post.title);
                    expect(resPost.author).to.equal(post.authorName);
                    expect(resPost.content).to.equal(post.content);
                });
        });
    });
    describe('POST endpoint', function() {
        it('should add a new blog post', function() {
            const newPost = {
                title: faker.lorem.sentence(),
                author: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName()
                },
                content: faker.lorem.text()
            };
        });
        return chai
            .request(app)
            .post('/posts')
            .send(newPost)
            .then(function(res) {
                res.should.have.status(201);
                res.should.be.json;
                res.should.be.a('object');
                res.body.should.include.keys(
                    'id',
                    'title',
                    'content',
                    'author',
                    'created'
                );
                res.body.title.should.equal(newPost.title);
                res.body.id.should.not.be.null;
                res.body.author.should.equal(
                    `${newPost.author.firstName} ${newPost.author.lastName}`
                );
                res.body.content.should.equal(newPost.content);
                return BlogPost.findById(res.body.id);
            })
            .then(function(post) {
                post.title.should.equal(newPost.title);
                post.content.should.equal(newPost.content);
                post.author.firstName.should.equal(newPost.author.firstName);
                post.author.lastName.should.equal(newPost.author.lastName);
            });
    });
});
