"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResolvers = {
    Post: {
        author: (parent, args, { db }, info) => {
            return db.User.findById(parent.get('author'));
        },
        comments: (parent, { first = 10, offset = 0 }, { db }, info) => {
            return db.Comment.findAll({
                where: { post: parent.get('id') },
                limit: first,
                offset: offset
            });
        }
    },
    Query: {
        posts: (parent, { first = 10, offset = 0 }, { db }, info) => {
            return db.Post.findAll({
                limit: first,
                offset: offset
            });
        },
        post: (parent, { id }, { db }, info) => {
            return db.Post
                .findById(id)
                .then((post) => {
                if (!post)
                    throw new Error(`Post with id ${id} not found!`);
                return post;
            });
        }
    },
    Mutation: {
        createPost: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((t) => {
                return db.Post.create(input, { transaction: t });
            });
        },
        updatePost: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    if (!post)
                        throw new Error(`Post with id ${id} not found!`);
                    return post.update(input, { transaction: t });
                });
            });
        },
        deletePost: (parent, { id }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    if (!post)
                        throw new Error(`Post with id ${id} not found!`);
                    return post
                        .destroy({ transaction: t })
                        .then((post) => !!post);
                });
            });
        }
    }
};
