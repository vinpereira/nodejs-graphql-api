import * as DataLoader from "dataloader";

import { PostInstance } from "../models/PostModel";
import { UserInstance } from "../models/UserModel";

export interface DataLoaders {
    userLoader: DataLoader<number, UserInstance>;
    postLoader: DataLoader<number, PostInstance>;
}