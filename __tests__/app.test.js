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
