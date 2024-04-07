import { customAlphabet } from 'nanoid';
import config from './config';

const generate = customAlphabet(config.idgen.customAlphabets, config.otpLen);

export const genId = (size?: number) => generate(size);
