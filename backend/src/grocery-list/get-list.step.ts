import { ApiRouteConfig, ApiRouteHandler } from "motia";

export const config: ApiRouteConfig = {
    name: "GetListAPI",
    type: "api",
    path: "/grocery-list/get-list",
    method: "GET",
    description: "Retrieves the grocery list",
    emits: [],
}

export const handler: ApiRouteHandler = async (req, ctx) => {
    const items = await ctx.state.getGroup("grocery-list");
    return {
        status: 200,
        body: {
            items
        }
    };
}