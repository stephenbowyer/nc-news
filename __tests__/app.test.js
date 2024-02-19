const request = require('supertest');
const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const data = require('../db/data/test-data/index.js');

beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    return db.end();
})

describe('GET /api/topics', () => {
    test('200: should return an array', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({body}) => {
                expect(Array.isArray(body.topics)).toBe(true);
            });
    });
    test('200: should return expected number of topics', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({body}) => {
                expect(body.topics.length).toBe(data.topicData.length);
            });
    });
    test('200: should return expected fields', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({body}) => {
                expect(Object.keys(body.topics[0])).toContain('slug', 'description');
            });
    });
    test('200: should return expected field types', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({body}) => {
                expect(typeof body.topics[0].slug).toBe('string');
                expect(typeof body.topics[0].description).toBe('string');
            });
    });
});
describe('GET /api', () => {
    test('200: should return an object containing the description for this endpoint', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then(({body}) => {
                expect(typeof body.endpoints).toBe('object');
                expect(Object.keys(body.endpoints['GET /api'])).toContain('description');
                expect(typeof body.endpoints['GET /api'].description).toBe('string');
            });
    });
    test('200: should return an object containing the description, valid queries and example response for /api/topics endpoint', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then(({body}) => {
                expect(typeof body.endpoints).toBe('object');
                expect(Object.keys(body.endpoints['GET /api/topics'])).toContain('description', 'queries', 'exampleResponse');
                expect(typeof body.endpoints['GET /api/topics'].description).toBe('string');
                expect(Array.isArray(body.endpoints['GET /api/topics'].queries)).toBe(true);
                expect(body.endpoints['GET /api/topics'].queries.length).toBe(0);
            });
    });
});
describe('GET /api/articles/:article_id', () => {
    test('200: should return an article object containing the expected fields', () => {
        return request(app)
            .get('/api/articles/1')
            .expect(200)
            .then(({body}) => {
                expect(typeof body.article).toBe('object');
                expect(Object.keys(body.article)).toContain('author', 'title', 'article_id', 'body', 'topic', 'created_at', 'votes', 'article_img_url');
            });
    });    
    test('200: should return an article object containing data from the test dataset', () => {
        return request(app)
            .get('/api/articles/2')
            .expect(200)
            .then(({body}) => {
                expect(typeof body.article).toBe('object');
                expect(Object.keys(body.article)).toContain('author', 'title', 'article_id', 'body', 'topic', 'created_at', 'votes', 'article_img_url');
                Array('author', 'title', 'body', 'topic', 'article_img_url').forEach((keyName) => {
                    expect(body.article[keyName]).toBe(data.articleData[1][keyName]);
                })
            });
    });    
    test('404: should not found when non-exsitent article ID', () => {
        return request(app)
            .get('/api/articles/999')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Not Found');
            });
    });    
    test('400: should return bad request error if non-numeric article ID given', () => {
        return request(app)
            .get('/api/articles/999A')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad Request');
            });
    });    
});


describe('GET /api/articles', () => {
    test('200: should return an array of article objects containing the expected fields', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body}) => {
                expect(body.articles.length).toBe(data.articleData.length);
                expect(typeof body.articles[0]).toBe('object');
                expect(Object.keys(body.articles[0])).toContain('author', 'title', 'article_id', 'body', 'topic', 'created_at', 'votes', 'article_img_url');
            });
    });
});
