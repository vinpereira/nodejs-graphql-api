"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentResolvers = {
    Comment: {
        user: (parent, args, { db }, info) => {
            return db.User.findById(parent.get('user'));
        },
        post: (parent, args, { db }, info) => {
            return db.Post.findById(parent.get('post'));
        }
    },
    Query: {
        commentsByPost: (parent, { postId, first = 10, offset = 0 }, { db }, info) => {
            return db.Comment.findAll({
                where: { post: postId },
                limit: first,
                offset: offset
            });
        }
    },
    Mutation: {
        createComment: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((t) => {
                return db.Comment.create(input, { transaction: t });
            });
        },
        updateComment: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Comment
                    .findById(id)
                    .then((comment) => {
                    if (!comment)
                        throw new Error(`Comment with id ${id} not found!`);
                    return comment.update(input, { transaction: t });
                });
            });
        },
        deleteComment: (parent, { id }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Comment
                    .findById(id)
                    .then((comment) => {
                    if (!comment)
                        throw new Error(`Comment with id ${id} not found!`);
                    return comment
                        .destroy({ transaction: t })
                        .then((comment) => !!comment);
                });
            });
        }
    }
};
