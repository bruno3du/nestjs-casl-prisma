import { z } from "zod";

const resources = [
    "banners",
    "compras",
    "pedido",
    "financeiro",
    "users",
    "recursos",
    "permissoes",
    "roles",
] as const;
const actions = ["manage", "read", "create", "update", "delete"] as const;

export const Action = z.enum(actions);

export const Resources = z.enum(resources);
export const ResourceTuple = z.tuple([Action, Resources]);

export type ResourceTupleType = z.infer<typeof ResourceTuple>;
export type ActionType = z.infer<typeof Action>;
export type ResourceType = z.infer<typeof Resources>;
