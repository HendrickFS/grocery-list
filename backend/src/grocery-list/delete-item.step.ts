import { ApiRouteConfig, ApiRouteHandler } from "motia";
import { z } from "zod";

const DeleteItemSchema = z.object({
    name: z.string().min(1, "Item name is required")
});

export const config: ApiRouteConfig = {
    name: "DeleteItemAPI",
    type: "api",
    path: "/grocery-list/delete-item",
    method: "POST",
    bodySchema: DeleteItemSchema,
    description: "Deletes an item from the grocery list",
    emits: ["item-deleted"],
}

export const handler: ApiRouteHandler = async (req, ctx) => {
    const data = DeleteItemSchema.parse(req.body);
    const { name } = data;
    await ctx.state.delete("grocery-list", `grocery-list:item:${name}`);
    return {
        status: 200,
        body: {
            message: `Item '${name}' deleted from grocery list!`
        }
    };
}