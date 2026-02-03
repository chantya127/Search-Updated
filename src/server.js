import Fastify from "fastify";
import routes from "./routes/index.js";
import config from "./config.js";
import process from "process";

const fastify = Fastify({
    logger: true
});

fastify.register(routes, { prefix: '/api/v1' });
fastify.get('/health', async () => ({ status: 'ok', timestamp: Date.now() }));

const PORT = config.PORT;

const start = async () => {
    try {
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        fastify.log.info(`Started listening on port: ${PORT}`);
    }
    catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

// Graceful shutdown — finish in-flight requests before exiting
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach(signal => {
    process.on(signal, async () => {
        fastify.log.info(`Received ${signal}, shutting down gracefully...`);
        await fastify.close();
        process.exit(0);
    });
});

start();