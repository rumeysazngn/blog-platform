import Redis from 'ioredis';
import { config } from './config';

export const publisher = new Redis(config.redisUrl);
export const subscriber = new Redis(config.redisUrl);

// örnek abonelik (ayrı bir process de olabilir)
subscriber.subscribe('post_published');
subscriber.on('message', (channel:string, message:string) => {
  if (channel === 'post_published') {
    console.log('📣 Yeni yazı yayınlandı:', message);
    // burada skor hesaplama, öneri tetikleme vs.
  }
});
