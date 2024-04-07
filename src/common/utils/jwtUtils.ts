import config from './config';
import * as jose from 'jose';
import { LOG } from './logger';

const { jwtSecret } = config;
type TJwtPayload = Record<string, string | number | boolean>;

const makeJwt = async (payload: TJwtPayload) => {
	// const expDelta = 90 * 24 * 60 * 60 * 1000; // 90 days
	const token = await new jose.SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		// .setIssuedAt(Date.now())
		// .setExpirationTime(Date.now() + expDelta) // we are not expiring tokens
		.sign(Buffer.from(jwtSecret));
	return token;
};

const validateJwt = async (token: string): Promise<TJwtPayload | null> => {
	try {
		const result = await jose.jwtVerify(token, Buffer.from(jwtSecret), {
			algorithms: ['HS256'],
		});

		return result.payload as TJwtPayload;
	} catch (e) {
		LOG.info({ msg: `failed jwt validation`, e });
		return null;
	}
};

export default {
	makeJwt,
	validateJwt,
};
