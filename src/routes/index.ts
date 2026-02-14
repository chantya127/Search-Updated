import searchRouter from "./search.js";
import type { FastifyInstance } from "fastify";

async function routes(fastify: FastifyInstance): Promise<void> {
    fastify.register(searchRouter, { prefix: '/products' });
}

export default routes;
