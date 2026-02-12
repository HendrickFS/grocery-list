import { ApiRouteConfig, ApiRouteHandler } from "motia";
import { z } from "zod";

const UpdateItemSchema = z.object({
    name: z.string().min(1, "Item name is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer")
});

export const config: ApiRouteConfig = {
    name: "UpdateItemAPI",
    type: "api",
    path: "/grocery-list/update-item",
    method: "POST",
    bodySchema: UpdateItemSchema,
    description: "Updates the quantity of an item in the grocery list",
    emits: ["item-updated"],
}

export const handler: ApiRouteHandler = async (req, ctx) => {
    const data = UpdateItemSchema.parse(req.body);
    const { name, quantity } = data;
    await ctx.state.set("grocery-list", `grocery-list:item:${name}`, { name, quantity });
    return {
        status: 200,
        body: {
            message: `Item '${name}' updated with quantity ${quantity}!`
        }
    };
}
