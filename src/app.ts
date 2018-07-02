import * as express from 'express';
import * as graphqlHTTP from 'express-graphql'

import db from './models'
import schema from './graphql/schema';
import { DataLoaderFactory } from './graphql/dataloaders/DataLoaderFactory';
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';
import { RequestedFields } from './graphql/ast/RequestedFields';

class App {
    public express: express.Application;
    private dataLoaderFactory: DataLoaderFactory;
    private requestedFields: RequestedFields;

    constructor() {
        this.express = express();
        this.init();
    }

    private init(): void {
        this.dataLoaderFactory = new DataLoaderFactory(db);
        this.requestedFields = new RequestedFields();
        this.middleware();
    }

    private middleware(): void {
        this.express.use('/graphql', 

            extractJwtMiddleware(),

            (req, res, next) => {
                req['context']['db'] = db;
                req['context']['dataloaders'] = this.dataLoaderFactory.getLoaders();
                req['context']['requestedFields'] = this.requestedFields;
                next();
            },

            graphqlHTTP((req) => ({
                schema: schema,
                graphiql: process.env.NODE_ENV === 'development',
                context: req['context']
            }))
        );
    }
}

export default new App().express;