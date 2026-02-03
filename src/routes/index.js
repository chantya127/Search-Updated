import searchRouter from "./search.js";

async function routes(fastify,) {
    fastify.register(searchRouter, { prefix: '/products/search' });
}

export default routes;