import { AuthUser } from "./AuthUserInterface";
import { DbConnection } from "./DbConnectionInterface";

export interface ResolverContext {
    authorization?: string;
    db?: DbConnection;
    authUser?: AuthUser;
}