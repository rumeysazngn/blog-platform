import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000'),
  env: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost', // ✅ postgres_db → localhost
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'blog_platform',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'yusufgks2021',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecretkey',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379', // ✅ redis_cache → localhost
  
  aiServiceUrl: process.env.AI_SERVICE_URL!,

};