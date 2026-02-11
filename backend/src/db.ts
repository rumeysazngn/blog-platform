import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool(config.db);

// PostgreSQL bağlantı kontrolü
pool.on('connect', () => {
  console.log('🐘 PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// basit helper
export const query = (text: string, params?: any[]) => pool.query(text, params);
