import { AuthUser } from "./AuthUserInterface";
import { DataLoaders } from "./DataLoadersInterface";
import { DbConnection } from "./DbConnectionInterface";
import { RequestedFields } from "../graphql/ast/RequestedFields";

export interface ResolverContext {
    authorization?: string;
    authUser?: AuthUser;
    dataloaders?: DataLoaders;
    db?: DbConnection;
    requestedFields?: RequestedFields;
}