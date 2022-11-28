export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV,
  auth_microservice: {
    host: process.env.AUTH_MS_HOST,
    port: parseInt(process.env.AUTH_MS_PORT, 10) || 4000,
  },
  catalogo_microservice: {
    host: process.env.MS_CATALOGO_HOST,
    port: parseInt(process.env.MS_CATALOGO_PORT, 10) || 4020,
  },
  usuario_microservice: {
    host: process.env.USER_MS_HOST,
    port: parseInt(process.env.USER_MS_PORT, 10) || 4010,
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    dbName: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
});
