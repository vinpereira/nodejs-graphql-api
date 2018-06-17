import { Query } from './query';
import { Mutation } from './mutation';
import { commentTypes } from './resources/comment/comment.schema';
import { postTypes } from './resources/post/post.schema';
import { userTypes } from './resources/user/user.schema';

import { makeExecutableSchema } from 'graphql-tools'

const SchemaDefinition = `
    type Schema {
        query: Query
        mutation: Mutation
    }
`;

export default makeExecutableSchema({
    typeDefs: [
        SchemaDefinition,
        Query,
        Mutation,
        commentTypes,
        postTypes,
        userTypes
    ]
});