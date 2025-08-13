export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwtSecret: process.env.JWT_SECRET,
  smsApiKey: process.env.SMS_API_KEY,
  emailApiKey: process.env.EMAIL_API_KEY,
  senderId: process.env.SENDER_ID,
  app: {
    name: process.env.APP_NAME || 'API',
    description: process.env.APP_DESCRIPTION || 'API Description',
  },
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'your-password',
    database: process.env.DB_DATABASE || 'your-database',
    sync: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
});
