import {UnbxdService, UnbxdApiError } from "../services/unbxdService.js";
import { searchRequestSchema,  searchResponse} from "../schema/search.js";

const unbxdServiceObj = new UnbxdService();

async function searchRouter(fastify) {

    fastify.post('', 
        { schema: { body: searchRequestSchema, response: {200: searchResponse}} }, 
        async (request, reply) => {

            try {
                // const unbxdServiceObj = new UnbxdService();
                return await unbxdServiceObj.search(request.body);
            }
            catch (error) {

                if ( error instanceof UnbxdApiError){
                    request.log.error({
                        msg: 'Unbxd upstream error',
                        statusCode: error.statusCode,
                        responseBody: error.responseBody,
                    });
                    return reply.code(502).send({
                        error: 'Upstream Error',
                        message: 'Failed to fetch data from upstream service. Please try again later.'
                    })
                }
                request.log.error(error);
                reply.code(500).send({error : 'Internal Server Error', message :`Failed to fetch data, Please try again.`});
            }
    });

}

export default searchRouter;