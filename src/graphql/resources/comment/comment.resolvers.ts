import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";

export const commentResolvers = {
    Comment: {
        user: (parent, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.User.findById(parent.get('user'));
        },

        post: (parent, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.Post.findById(parent.get('post'));
        }
    },

    Query: {
        commentsByPost: (parent, { postId, first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.Comment.findAll({
                where: { post: postId },
                limit: first,
                offset: offset 
            });
        }
    }
};