import { EntityNode } from "./entity-node";

export interface IEntityNodeService {
  getEntityNodes(path: string): Promise<{[model: string]: EntityNode[]}>;
  persistEntityNodes<T>(path: string, data: T): Promise<void>;
}