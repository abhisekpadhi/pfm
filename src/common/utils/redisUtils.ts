import { createClient } from 'redis';
import config from './config';
import { LOG } from './logger';

const cache = createClient({ url: config.redis.url });
cache
	.on('error', (err) => LOG.info({ msg: 'Redis client error', error: err }))
    
	.connect();
export default cache;
