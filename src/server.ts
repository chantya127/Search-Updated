import Fastify from "fastify";
import {
    serializerCompiler,
    validatorCompiler
} from "fastify-type-provider-zod";
import routes from "./routes/index.js";
import config from "./config.js";
import process from "process";

const fastify = Fastify({
    logger: true,
    requestTimeout: 30000,     // kill requests after 30s
    connectionTimeout: 10000,  // kill idle connections after 10s
});


fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(routes, { prefix: '/api/v1' });
fastify.get('/health', async () => ({ status: 'ok', timestamp: Date.now() }));

const PORT: number = config.PORT;

const start = async (): Promise<void> => {
    try {
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        fastify.log.info(`Started listening on port: ${PORT}`);
    }
    catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

// Graceful shutdown — finish in-flight requests before exiting
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach(signal => {
    process.on(signal, async () => {
        fastify.log.info(`Received ${signal}, shutting down gracefully...`);
        await fastify.close();
        process.exit(0);
    });
});

start();
