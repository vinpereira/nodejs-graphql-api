import { AuthUser } from "./AuthUserInterface";
import { DataLoaders } from "./DataLoadersInterface";
import { DbConnection } from "./DbConnectionInterface";

export interface ResolverContext {
    authorization?: string;
    dataloaders?: DataLoaders;
    db?: DbConnection;
    authUser?: AuthUser;
}