import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { UnbxdService, UnbxdApiError } from "../services/unbxdService.js";
import { SearchRequestSchema } from "../schema/search.js";


const unbxdServiceObj = new UnbxdService();

async function searchRouter(fastify: FastifyInstance): Promise<void> {

    fastify.withTypeProvider<ZodTypeProvider>().post(
        '/search',
        {
            schema: {
                body: SearchRequestSchema,
            }
        },
        async (request, reply) => {
            try {
                return await unbxdServiceObj.search(request.body);
            }
            catch (error: unknown) {
                if (error instanceof UnbxdApiError) {
                    request.log.error({
                        msg: 'Unbxd upstream error',
                        statusCode: error.statusCode,
                        responseBody: error.responseBody,
                    });
                    return reply.code(502).send({
                        error: 'Upstream Error',
                        message: 'Failed to fetch data from service. Please try again later.'
                    });
                }

                request.log.error(error);
                return reply.code(500).send({
                    error: 'Internal Server Error',
                    message: 'Failed to fetch data, Please try again.'
                });
            }
        }
    );
}

export default searchRouter;
