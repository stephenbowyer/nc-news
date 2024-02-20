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
        const expectedOutput = {...data.articleData[1]};
        // adjust for hour's difference between dataset and database
        const createDate = new Date(expectedOutput.created_at);
        expectedOutput.created_at = new Date(createDate.setHours(createDate.getHours() - 1)).toISOString();
        return request(app)
            .get('/api/articles/2')
            .expect(200)
            .then(({body}) => {
                expect(typeof body.article).toBe('object');
                expect(body.article).toMatchObject(expectedOutput);
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
                expect(Array.isArray(body.articles[0])).toBe(false);
                expect(Object.keys(body.articles[0])).toContain('author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count');
                expect(Object.keys(body.articles[0])).not.toContain('body');
            });
    });
    test('200: should return same number of articles as in dataset', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body}) => {
                expect(body.articles.length).toBe(data.articleData.length);
            });
    });
    test('200: should return articles sorted by created date', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body}) => {
                expect(body.articles).toBeSortedBy('created_at', {descending: true});
            });
    });
    test('200: should return correct count of comments for each article', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body}) => {
                body.articles.forEach((article) => {
                    const expectedLength = data.commentData.filter((comment) => comment.article_id === article.article_id).length;
                    expect(Number(article.comment_count)).toBe(expectedLength);
                });
            });
    });
});
describe('GET /api/articles/:article_id/comments', () => {
    test('200: should return an array of comment objects matching the dataset', () => {
        const articleId = 3;
        return request(app)
            .get(`/api/articles/${articleId}/comments`)
            .expect(200)
            .then(({body}) => {
                const expectedOutput = data.commentData.filter(({...comment}) => comment.article_id === articleId);
                expect(body.comments.length).toBe(expectedOutput.length);
                body.comments.forEach((comment) => {
                    expect(typeof comment).toBe('object');
                    expect(Array.isArray(comment)).toBe(false);
                    expect(Object.keys(comment)).toContain('comment_id', 'votes', 'created_at', 'author', 'body', 'article_id');
                    expect(comment.article_id).toBe(articleId);
                });
            });
    });
    test('200: should return comments sorted by created date', () => {
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({body}) => {
                expect(body.comments).toBeSortedBy('created_at', {descending: true});
            });
    });
    test('200: should return an empty array if article ID exists but has no comments', () => {
        return request(app)
            .get('/api/articles/2/comments')
            .expect(200)
            .then(({body}) => {
                expect(Array.isArray(body.comments)).toBe(true);
                expect(body.comments.length).toBe(0);
            });
    });    
    test('404: should not found when non-exsitent article ID', () => {
        return request(app)
            .get('/api/articles/999/comments')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Not Found');
            });
    });    
    test('400: should return bad request error if non-numeric article ID given', () => {
        return request(app)
            .get('/api/articles/999A/comments')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad Request');
            });
    });
});
describe('POST /api/articles/:article_id/comments', () => {
    test('201: should return a new posted comment', () => {
        const articleId = 1;
        const newComment = {username: "butter_bridge",
            body: "This is an example comment"};
        return request(app)
            .post(`/api/articles/${articleId}/comments`)
            .send(newComment)
            .expect(201)
            .then(({body}) => {
                newComment['author'] = newComment['username']; delete newComment['username'];
                expect(body.comment).toMatchObject(newComment);
                expect(body.comment.article_id).toBe(articleId);
                expect(body.comment.votes).toBe(0);
                expect(Object.keys(body.comment)).toContain('comment_id', 'body', 'articleId', 'author', 'votes', 'created_at');
            });
    });
    test('201: should ignore additional parameters and return a new posted comment', () => {
        const articleId = 1;
        const newComment = {username: "butter_bridge",
            body: "This is an example comment",
            something: "Ignore me",
            hidden: "This should not be added"};
        return request(app)
            .post(`/api/articles/${articleId}/comments`)
            .send(newComment)
            .expect(201)
            .then(({body}) => {
                newComment['author'] = newComment['username']; delete newComment['username'];
                delete newComment['something']; delete newComment['hidden'];
                expect(body.comment).toMatchObject(newComment);
                expect(body.comment.article_id).toBe(articleId);
                expect(body.comment.votes).toBe(0);
                expect(Object.keys(body.comment)).toContain('comment_id', 'body', 'articleId', 'author', 'votes', 'created_at');
            });
    });
    test('404: should return not found when adding a comment to a non-existent article ID', () => {
        const articleId = 999;
        const newComment = {username: "butter_bridge",
            body: "This is an example comment"};
        return request(app)
            .post(`/api/articles/${articleId}/comments`)
            .send(newComment)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Not Found');
            });
    });
    test('404: should return not found when adding a comment to a non-existent username', () => {
        const articleId = 1;
        const newComment = {username: "I have a name that does not exist",
            body: "This is an example comment"};
        return request(app)
            .post(`/api/articles/${articleId}/comments`)
            .send(newComment)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Not Found');
            });
    });    
    test('400: should return bad request error if non-numeric article ID given', () => {
        const badArticleId = "999A";
        const newComment = {username: "butter_bridge",
            body: "This is an example comment"};
        return request(app)
            .post(`/api/articles/${badArticleId}/comments`)
            .send(newComment)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad Request');
            });
    });
    test('400: should return bad request error if comment is empty', () => {
        const articleId = 3;
        const invalidComment = {username: "butter_bridge",
            body: ""};
        return request(app)
            .post(`/api/articles/${articleId}/comments`)
            .send(invalidComment)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad Request');
            });
    });
    test('400: should return bad request error if no comment body key provided', () => {
        const articleId = 3;
        const invalidComment = {username: "butter_bridge"};
        return request(app)
            .post(`/api/articles/${articleId}/comments`)
            .send(invalidComment)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad Request');
            });
    });
    test('400: should return bad request error if no username key provided', () => {
        const articleId = 3;
        const invalidComment = {body: "This is my comment to be added"};
        return request(app)
            .post(`/api/articles/${articleId}/comments`)
            .send(invalidComment)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad Request');
            });
    });
});
