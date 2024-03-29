const request = require('supertest');
const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const data = require('../db/data/test-data/index.js');
const { expect } = require('@jest/globals');

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
    test('200: should return correct count of comments for requested article', () => {
        const articleId = 1;
        return request(app)
            .get(`/api/articles/${articleId}`)
            .expect(200)
            .then(({body}) => {
                const expectedLength = data.commentData.filter((comment) => comment.article_id === articleId).length;
                expect(Number(body.article.comment_count)).toBe(expectedLength);
            });
    });
    test('200: should return correct count of zero comments for requested article', () => {
        const articleId = 2;
        return request(app)
            .get(`/api/articles/${articleId}`)
            .expect(200)
            .then(({body}) => {
                expect(Number(body.article.comment_count)).toBe(0);
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
    describe('GET /api/articles?topic=', () => {
        test('200: should return only articles with requested topic', () => {
            const topicName = "cats";
            const expectedOutput = data.articleData.filter(({...article}) => article.topic === topicName);
            return request(app)
                .get(`/api/articles?topic=${topicName}`)
                .expect(200)
                .then(({body}) => {
                    expect(Array.isArray(body.articles)).toBe(true);
                    expect(body.articles.length).toBe(expectedOutput.length);
                });
        });
        test('200: should return empty array if no articles found for valid topic', () => {
            const topicName = "paper";
            return request(app)
                .get(`/api/articles?topic=${topicName}`)
                .expect(200)
                .then(({body}) => {
                    expect(Array.isArray(body.articles)).toBe(true);
                    expect(body.articles.length).toBe(0);
                });
        });
        test('404: should return Not Found if specified topic is not valid', () => {
            const topicName = "notvalid";
            return request(app)
                .get(`/api/articles?topic=${topicName}`)
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe('Not Found');
                });
        });
    });
    describe('GET /api/articles?sort_by=', () => {
        test('200: should return articles sorted descending by created date by default', () => {
            return request(app)
                .get('/api/articles')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('created_at', {descending: true});
                });
        });
        test('200: should return articles sorted ascending by created date by default', () => {
            return request(app)
                .get('/api/articles?order=asc')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('created_at', {descending: false});
                });
        });
        test('200: should return articles sorted descending by votes', () => {
            return request(app)
                .get('/api/articles?sort_by=votes')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('votes', {descending: true});
                });
        });
        test('200: should return articles sorted ascending by votes', () => {
            return request(app)
                .get('/api/articles?sort_by=votes&order=asc')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('votes', {descending: false});
                });
        });
        test('200: should return articles sorted descending by title', () => {
            return request(app)
                .get('/api/articles?sort_by=title&order=desc')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('title', {descending: true});
                });
        });
        test('200: should return articles sorted ascending by title', () => {
            return request(app)
                .get('/api/articles?sort_by=title&order=asc')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('title', {descending: false});
                });
        });
        test('400: should return Bad Request on invalid requested sort field', () => {
            return request(app)
                .get('/api/articles?sort_by=invalid')
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe('Bad Request');
                });
        });
        test('400: should return Bad Request if invalid sort order requested', () => {
            return request(app)
                .get('/api/articles?sort_by=comment_count&order=invalid')
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe('Bad Request');
                });
        });
        test('200: should return articles sorted descending by number of comments', () => {
            return request(app)
                .get('/api/articles?sort_by=comment_count&order=desc')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('comment_count', {descending: true});
                });
        });
        test('200: should return articles sorted ascending by number of comments', () => {
            return request(app)
                .get('/api/articles?sort_by=comment_count&order=asc')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('comment_count', {descending: false});
                });
        });
        test('200: should return articles sorted ascending by number of comments for a specified topic only', () => {
            return request(app)
                .get('/api/articles?sort_by=comment_count&order=asc&topic=mitch')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('comment_count', {descending: false});
                    body.articles.forEach((article) => {
                        expect(article.topic).toBe("mitch");
                    })
                });
        });
        test('200: should return articles sorted descending by number of comments for a specified topic only', () => {
            return request(app)
                .get('/api/articles?sort_by=comment_count&order=desc&topic=mitch')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('comment_count', {descending: true});
                    body.articles.forEach((article) => {
                        expect(article.topic).toBe("mitch");
                    })
                });
        });
    });
})
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
describe('PATCH /api/articles/:article_id', () => {
    test('200: should return an updated patched article with an increase in votes', () => {
        const articleId = 1;
        const patch = {inc_votes: 100};
        const expectedOutput = {...data.articleData[articleId - 1]};
        expectedOutput.votes += patch.inc_votes;
        // adjust for hour's difference between dataset and database
        const createDate = new Date(expectedOutput.created_at);
        expectedOutput.created_at = new Date(createDate.setHours(createDate.getHours() - 1)).toISOString();
        return request(app)
            .patch(`/api/articles/${articleId}`)
            .send(patch)
            .expect(200)
            .then(({body}) => {
                expect(typeof body.article).toBe('object');
                expect(Array.isArray(body.article)).not.toBe(true);
                expect(body.article).toMatchObject(expectedOutput);
                expect(body.article.votes).toBe(expectedOutput.votes);
            });
    });
    test('200: should return an updated patched article with a decrease in votes', () => {
        const articleId = 1;
        const patch = {inc_votes: -50};
        const expectedOutput = {...data.articleData[articleId - 1]};
        expectedOutput.votes += patch.inc_votes;
        // adjust for hour's difference between dataset and database
        const createDate = new Date(expectedOutput.created_at);
        expectedOutput.created_at = new Date(createDate.setHours(createDate.getHours() - 1)).toISOString();
        return request(app)
            .patch(`/api/articles/${articleId}`)
            .send(patch)
            .expect(200)
            .then(({body}) => {
                expect(typeof body.article).toBe('object');
                expect(Array.isArray(body.article)).not.toBe(true);
                expect(body.article).toMatchObject(expectedOutput);
                expect(body.article.votes).toBe(expectedOutput.votes);
            });
    });
    test('200: should return an unchanged article when votes not changed', () => {
        const articleId = 1;
        const patch = {inc_votes: 0};
        const expectedOutput = {...data.articleData[articleId - 1]};
        expectedOutput.votes += patch.inc_votes;
        // adjust for hour's difference between dataset and database
        const createDate = new Date(expectedOutput.created_at);
        expectedOutput.created_at = new Date(createDate.setHours(createDate.getHours() - 1)).toISOString();
        return request(app)
            .patch(`/api/articles/${articleId}`)
            .send(patch)
            .expect(200)
            .then(({body}) => {
                expect(typeof body.article).toBe('object');
                expect(Array.isArray(body.article)).not.toBe(true);
                expect(body.article).toMatchObject(expectedOutput);
                expect(body.article.votes).toBe(expectedOutput.votes);
            });
    });
    test('200: should return an unchanged article when votes key not specified in request object', () => {
        const articleId = 1;
        const patch = {};
        const expectedOutput = {...data.articleData[articleId - 1]};
        // adjust for hour's difference between dataset and database
        const createDate = new Date(expectedOutput.created_at);
        expectedOutput.created_at = new Date(createDate.setHours(createDate.getHours() - 1)).toISOString();
        return request(app)
            .patch(`/api/articles/${articleId}`)
            .send(patch)
            .expect(200)
            .then(({body}) => {
                expect(typeof body.article).toBe('object');
                expect(Array.isArray(body.article)).not.toBe(true);
                expect(body.article).toMatchObject(expectedOutput);
                expect(body.article.votes).toBe(expectedOutput.votes);
            });
    });
    test('200: should return an updated patched article with an increase in votes if supplied as a string', () => {
        const articleId = 1;
        const patch = {inc_votes: "100"};
        const expectedOutput = {...data.articleData[articleId - 1]};
        expectedOutput.votes += Number(patch.inc_votes);
        // adjust for hour's difference between dataset and database
        const createDate = new Date(expectedOutput.created_at);
        expectedOutput.created_at = new Date(createDate.setHours(createDate.getHours() - 1)).toISOString();
        return request(app)
            .patch(`/api/articles/${articleId}`)
            .send(patch)
            .expect(200)
            .then(({body}) => {
                expect(typeof body.article).toBe('object');
                expect(Array.isArray(body.article)).not.toBe(true);
                expect(body.article).toMatchObject(expectedOutput);
                expect(body.article.votes).toBe(expectedOutput.votes);
            });
    });
    test('400: should return bad request error if non-numeric votes provided', () => {
        const articleId = 1;
        const patch = {inc_votes: "invalid input"};
        return request(app)
            .patch(`/api/articles/${articleId}`)
            .send(patch)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad Request');
            });
    });
    test('400: should return bad request error if non-numeric article id provided', () => {
        const articleId = "invalid article";
        const patch = {inc_votes: 100};
        return request(app)
            .patch(`/api/articles/${articleId}`)
            .send(patch)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad Request');
            });
    });
    test('404: should return not found error if specified article does not exist', () => {
        const articleId = 999;
        const patch = {inc_votes: 100};
        return request(app)
            .patch(`/api/articles/${articleId}`)
            .send(patch)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Not Found');
            });
    });
});
describe('DELETE /api/comments/:comment_id', () => {
    test('204: should return no content when comment successfully deleted', () => {
        const commentId = 1;
        return request(app)
            .delete(`/api/comments/${commentId}`)
            .expect(204);
    });
    test('204: should delete requested comment from database', () => {
        const articleId = 1;
        let commentId = 0;
        return request(app)
            .get(`/api/articles/${articleId}/comments`)
            .expect(200)
            .then(({body}) => {
                const originalLength = body.comments.length;
                const expectedLength = originalLength - 1;
                const commentId = body.comments[0].comment_id;
                return request(app)
                .delete(`/api/comments/${commentId}`)
                .expect(204)
                .then(() => {
                    return request(app)
                    .get(`/api/articles/${articleId}/comments`)
                    .expect(200)
                    .then(({body}) => {
                        const actualLength = body.comments.length;
                        expect(actualLength).toBe(expectedLength);
                    });
                });
            });
    });
    test('404: should return not found when delete a non-existent comment', () => {
        const commentId = 999;
        return request(app)
            .delete(`/api/comments/${commentId}`)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Not Found');
            });
    });
    test('400: should return bad request error if non-numeric comment ID given', () => {
        const badCommentId = "999A";
        return request(app)
            .delete(`/api/comments/${badCommentId}`)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad Request');
            });
    });
});







describe('PATCH /api/comments/:comment', () => {
    test('200: should return an updated patched comment with an increase in votes', () => {
        const commentId = 1;
        const patch = {inc_votes: 100};
        const expectedOutput = {...data.commentData[commentId - 1]};
        expectedOutput.votes += patch.inc_votes;
        // adjust for hour's difference between dataset and database
        const createDate = new Date(expectedOutput.created_at);
        expectedOutput.created_at = new Date(createDate.setHours(createDate.getHours() - 1)).toISOString();
        return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patch)
            .expect(200)
            .then(({body}) => {
                expect(typeof body.comment).toBe('object');
                expect(Array.isArray(body.comment)).not.toBe(true);
                expect(body.comment).toMatchObject(expectedOutput);
                expect(body.comment.votes).toBe(expectedOutput.votes);
            });
    });
    test('200: should return an updated patched comment with a decrease in votes', () => {
        const commentId = 1;
        const patch = {inc_votes: -50};
        const expectedOutput = {...data.commentData[commentId - 1]};
        expectedOutput.votes += patch.inc_votes;
        // adjust for hour's difference between dataset and database
        const createDate = new Date(expectedOutput.created_at);
        expectedOutput.created_at = new Date(createDate.setHours(createDate.getHours() - 1)).toISOString();
        return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patch)
            .expect(200)
            .then(({body}) => {
                expect(typeof body.comment).toBe('object');
                expect(Array.isArray(body.comment)).not.toBe(true);
                expect(body.comment).toMatchObject(expectedOutput);
                expect(body.comment.votes).toBe(expectedOutput.votes);
            });
    });
    test('200: should return an unchanged comment when votes not changed', () => {
        const commentId = 1;
        const patch = {inc_votes: 0};
        const expectedOutput = {...data.commentData[commentId - 1]};
        expectedOutput.votes += patch.inc_votes;
        // adjust for hour's difference between dataset and database
        const createDate = new Date(expectedOutput.created_at);
        expectedOutput.created_at = new Date(createDate.setHours(createDate.getHours() - 1)).toISOString();
        return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patch)
            .expect(200)
            .then(({body}) => {
                expect(typeof body.comment).toBe('object');
                expect(Array.isArray(body.comment)).not.toBe(true);
                expect(body.comment).toMatchObject(expectedOutput);
                expect(body.comment.votes).toBe(expectedOutput.votes);
            });
    });
    test('200: should return an unchanged comment when votes key not specified in request object', () => {
        const commentId = 1;
        const patch = {};
        const expectedOutput = {...data.commentData[commentId - 1]};
        // adjust for hour's difference between dataset and database
        const createDate = new Date(expectedOutput.created_at);
        expectedOutput.created_at = new Date(createDate.setHours(createDate.getHours() - 1)).toISOString();
        return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patch)
            .expect(200)
            .then(({body}) => {
                expect(typeof body.comment).toBe('object');
                expect(Array.isArray(body.comment)).not.toBe(true);
                expect(body.comment).toMatchObject(expectedOutput);
                expect(body.comment.votes).toBe(expectedOutput.votes);
            });
    });
    test('200: should return an updated patched comment with an increase in votes if supplied as a string', () => {
        const commentId = 1;
        const patch = {inc_votes: "100"};
        const expectedOutput = {...data.commentData[commentId - 1]};
        expectedOutput.votes += Number(patch.inc_votes);
        // adjust for hour's difference between dataset and database
        const createDate = new Date(expectedOutput.created_at);
        expectedOutput.created_at = new Date(createDate.setHours(createDate.getHours() - 1)).toISOString();
        return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patch)
            .expect(200)
            .then(({body}) => {
                expect(typeof body.comment).toBe('object');
                expect(Array.isArray(body.comment)).not.toBe(true);
                expect(body.comment).toMatchObject(expectedOutput);
                expect(body.comment.votes).toBe(expectedOutput.votes);
            });
    });
    test('400: should return bad request error if non-numeric votes provided', () => {
        const commentId = 1;
        const patch = {inc_votes: "invalid input"};
        return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patch)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad Request');
            });
    });
    test('400: should return bad request error if non-numeric comment id provided', () => {
        const commentId = "invalid comment";
        const patch = {inc_votes: 100};
        return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patch)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad Request');
            });
    });
    test('404: should return not found error if specified comment does not exist', () => {
        const commentId = 999;
        const patch = {inc_votes: 100};
        return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patch)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Not Found');
            });
    });
});
















describe('GET /api/users', () => {
    test('200: should return an array with the expected number of users', () => {
        return request(app)
            .get('/api/users')
            .expect(200)
            .then(({body}) => {
                expect(Array.isArray(body.users)).toBe(true);
                expect(body.users.length).toBe(data.userData.length);
            });
    });
    test('200: should return the expected fields from users', () => {
        return request(app)
            .get('/api/users')
            .expect(200)
            .then(({body}) => {
                expect(Object.keys(body.users[0])).toContain('username', 'name', 'avatar_url');
            });
    });
    test('200: should return the expected user data from the test dataset', () => {
        return request(app)
            .get('/api/users')
            .expect(200)
            .then(({body}) => {
                expect(body.users).toMatchObject(data.userData);
                expect(body.users).toEqual(data.userData);
            });
    });
});
describe('GET /api/users/:username', () => {
    test('200: should return an user object containing the expected fields', () => {
        return request(app)
            .get('/api/users/rogersop')
            .expect(200)
            .then(({body}) => {
                expect(typeof body.user).toBe('object');
                expect(Array.isArray(body.user)).toBe(false);
                expect(Object.keys(body.user)).toContain('username', 'name', 'avatar_url');
            });
    });    
    test('200: should return a user object containing data from the test dataset', () => {
        const expectedOutput = {...data.userData[2]}; //rogersop
        return request(app)
            .get('/api/users/rogersop')
            .expect(200)
            .then(({body}) => {
                expect(typeof body.user).toBe('object');
                expect(body.user).toMatchObject(expectedOutput);
            });
    });
    test('404: should return not found when non-exsitent username specified', () => {
        return request(app)
            .get('/api/users/nonexistentusername')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Not Found');
            });
    });    
});
