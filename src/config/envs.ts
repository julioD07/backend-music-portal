import "dotenv/config";
import * as Joi from "joi";

interface EnvVars {
    PORT: number;
    DATABASE_URL: string;
    SECRETKEY: string;
    PATH_FILES: string;
    // NATS_SERVERS: string[];
    // PRODUCTS_MICROSERVICE_HOST: string;
    // PRODUCTS_MICROSERVICE_PORT: number;
}

const envsSchema = Joi.object({
    PORT: Joi.number().required(),
    DATABASE_URL: Joi.string().required(),
    SECRETKEY: Joi.string().required(),
    PATH_FILES: Joi.string().required(),
    // NATS_SERVERS: Joi.array().items(Joi.string()).required(),
    // PRODUCTS_MICROSERVICE_HOST: Joi.string().required(),
    // PRODUCTS_MICROSERVICE_PORT: Joi.number().required(),
})
.unknown(true)

const {error, value} = envsSchema.validate({
    ...process.env,
    // NATS_SERVERS: process.env.NATS_SERVERS.split(","),
})

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

const envsVars: EnvVars = value;

export const envs = {
    port: envsVars.PORT,
    databaseUrl: envsVars.DATABASE_URL,
    secretKey: envsVars.SECRETKEY,
    pathFiles: envsVars.PATH_FILES,
    // natsServers: envsVars.NATS_SERVERS,
    // productsMicroserviceHost: envsVars.PRODUCTS_MICROSERVICE_HOST,
    // productsMicroservicePort: envsVars.PRODUCTS_MICROSERVICE_PORT,
}