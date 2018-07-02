import * as DataLoader from "dataloader";

import { DataLoaderParam } from "./DataLoaderParamInterface";
import { PostInstance } from "../models/PostModel";
import { UserInstance } from "../models/UserModel";

export interface DataLoaders {
    userLoader: DataLoader<DataLoaderParam<number>, UserInstance>;
    postLoader: DataLoader<DataLoaderParam<number>, PostInstance>;
}