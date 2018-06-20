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
    }
};
