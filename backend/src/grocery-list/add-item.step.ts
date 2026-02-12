import { ApiRouteConfig, ApiRouteHandler, Handlers } from "motia";
import { z } from "zod";

const ItemSchema = z.object({
    name: z.string().min(1, "Item name is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer")
});

export const config: ApiRouteConfig = {
    name: "AddItemAPI",
    type: "api",
    path: "/grocery-list/add-item",
    method: "POST",
    bodySchema: ItemSchema,
    description: "Adds an item to the grocery list",
    emits: ["item-added"],
}

export const handler: ApiRouteHandler = async (req, ctx) => {
    const data = ItemSchema.parse(req.body);
    const { name, quantity } = data;
    await ctx.state.set("grocery-list", `grocery-list:item:${name}`, { name, quantity });
    return {
        status: 200,
        body: {
            message: `Item '${name}' with quantity ${quantity} added to grocery list!`
        }
    };
}