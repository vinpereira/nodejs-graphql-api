import * as jwt from 'jsonwebtoken';

import { db, app, chai, expect, handleError } from "../../test-utils";
import { UserInstance } from "../../../src/models/UserModel";
import { JWT_SECRET } from "../../../src/utils/utils";
import { PostInstance } from '../../../src/models/PostModel';

describe('Post', () => {
    let token: string;
    let userId: number;
    let postId: number;

    beforeEach(() => {
        return db.Comment.destroy({ where: {} })
            .then((rows: number) => db.Post.destroy({ where: {} }))
            .then((rows: number) => db.User.destroy({ where: {} }))
            .then((rows: number) => db.User.create(
                {
                    name: "Rocket",
                    email: "rocket@guardians.com",
                    password: "123"
                }
            ))
            .then((user: UserInstance) => {
                userId = user.get('id');
                const payload = { sub: userId };
                token = jwt.sign(payload, JWT_SECRET);

                return db.Post.bulkCreate([
                    {
                        title: 'First post',
                        content: 'First post content',
                        author: userId,
                        photo: 'some_photo'
                    },
                    {
                        title: 'Second post',
                        content: 'Second post content',
                        author: userId,
                        photo: 'some_photo'
                    },
                    {
                        title: 'Third post',
                        content: 'Third post content',
                        author: userId,
                        photo: 'some_photo'
                    }
                ]);
            })
            .then((posts: PostInstance[]) => {
                postId = posts[0].get('id');
            });
    });

    describe('Queries', () => {
        describe('application/json', () => {
            describe('posts', () => {
                it('should return a list of Posts', () => {
                    let body = {
                        query: `
                            query {
                                posts {
                                    title
                                    content
                                    photo
                                }
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const postsList = res.body.data.posts;
                            expect(res.body.data).to.be.an('object');
                            expect(postsList).to.be.an('array');
                            expect(postsList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt', 'author', 'comments']);
                            expect(postsList[0]).to.have.keys(['title', 'content', 'photo']);
                            expect(postsList[0].title).to.be.equal('First post');
                        })
                        .catch(handleError);
                });
            });

            describe('post', () => {
                it('should return a single Post with its author', () => {
                    let body = {
                        query: `
                            query getPost($id: ID!) {
                                post(id: $id) {
                                    title
                                    author {
                                        name
                                        email
                                    }
                                    comments {
                                        comment
                                    }
                                }
                            }
                        `,
                        variables: {
                            id: postId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singlePost = res.body.data.post;
                            expect(res.body.data).to.have.key('post');
                            expect(singlePost).to.be.an('object');
                            expect(singlePost).to.have.keys(['title', 'author', 'comments']);
                            expect(singlePost.title).to.be.equal('First post');
                            expect(singlePost.author).to.be.an('object').with.keys(['name', 'email']);
                            expect(singlePost.author).to.be.an('object').with.not.keys(['id', 'createdAt', 'updatedAt', 'posts']);
                        })
                        .catch(handleError);
                });
            });
        });

        describe('application/graphql', () => {
            describe('posts', () => {
                it('should return a list of Posts', () => {
                    let query = `
                        query {
                            posts {
                                title
                                content
                                photo
                            }
                        }
                    `;

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/graphql')
                        .send(query)
                        .then(res => {
                            const postsList = res.body.data.posts;
                            expect(res.body.data).to.be.an('object');
                            expect(postsList).to.be.an('array');
                            expect(postsList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt', 'author', 'comments']);
                            expect(postsList[0]).to.have.keys(['title', 'content', 'photo']);
                            expect(postsList[0].title).to.be.equal('First post');
                        })
                        .catch(handleError);
                });

                it('should paginate a list of Posts', () => {
                    let query = `
                        query getPostsList($first: Int, $offset: Int) {
                            posts(first: $first, offset: $offset) {
                                title
                                content
                                photo
                            }
                        }
                    `;

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/graphql')
                        .send(query)
                        .query({
                            variables: JSON.stringify({
                                first: 2,
                                offset: 1
                            })
                        })
                        .then(res => {
                            const postsList = res.body.data.posts;
                            expect(res.body.data).to.be.an('object');
                            expect(postsList).to.be.an('array').with.length(2);
                            expect(postsList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt', 'author', 'comments']);
                            expect(postsList[0]).to.have.keys(['title', 'content', 'photo']);
                            expect(postsList[0].title).to.be.equal('Second post');
                        })
                        .catch(handleError);
                });
            });
        });
    });

    describe('Mutations', () => {
        describe('application/json', () => {
            describe('createPost', () => {
                it('should create a new Post', () => {
                    let body = {
                        query: `
                            mutation createNewPost($input: PostInput!) {
                                createPost(input: $input) {
                                    id
                                    title
                                    content
                                    author {
                                        id
                                        name
                                        email
                                    }
                                }
                            }
                        `,
                        variables: {
                            input: {
                                title: "Forth Post",
                                content: "Forth content",
                                photo: "photo"
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            const createdPost = res.body.data.createPost;
                            expect(createdPost).to.be.an('object');
                            expect(createdPost).to.have.keys(['id', 'title', 'content', 'author']);
                            expect(createdPost.title).to.be.equal('Forth Post');
                            expect(createdPost.content).to.be.equal('Forth content');
                            expect(parseInt(createdPost.author.id)).to.be.equal(userId);
                        })
                        .catch(handleError);
                });
            });

            describe('updatePost', () => {
                it('should update an existing Post', () => {
                    let body = {
                        query: `
                            mutation updateExistingPost($id: ID!, $input: PostInput!) {
                                updatePost(id: $id, input: $input) {
                                    title
                                    content
                                    photo
                                }
                            }
                        `,
                        variables: {
                            id: postId,
                            input: {
                                title: "First Post - now with changes",
                                content: "First content - now with changes",
                                photo: "some_photo"
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            const updatedPost = res.body.data.updatePost;
                            expect(updatedPost).to.be.an('object');
                            expect(updatedPost).to.have.keys(['title', 'content', 'photo']);
                            expect(updatedPost.title).to.be.equal('First Post - now with changes');
                            expect(updatedPost.content).to.be.equal('First content - now with changes');
                            expect(updatedPost.photo).to.be.equal('some_photo');
                        })
                        .catch(handleError);
                });
            });

            describe('deletePost', () => {
                it('should delete an existing Post', () => {
                    let body = {
                        query: `
                            mutation deleteExistingPost($id: ID!) {
                                deletePost(id: $id)
                            }
                        `,
                        variables: {
                            id: postId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data).to.have.key('deletePost');
                            expect(res.body.data.deletePost).to.be.true;
                        })
                        .catch(handleError);
                });
            });
        });
    });
});