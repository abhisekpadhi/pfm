import { ApiUtils } from './apiUtils';
import { env } from './envConfig';
const { makeResponse } = ApiUtils;

export const __DEV__ = process.env['ENV'] ?? 'dev';

export default Object.freeze({
	env: (process.env['ENV'] ?? 'dev') as string,
	webEnv: (process.env['NEXT_PUBLIC_ZUT_ENV'] ?? 'dev') as string,
	symbols: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz',
	digits: '0123456789',
	jwtSecret: (process.env['JWT_SECRET'] ?? 'notARealSecret') as string,
	otpLen: 4,
	server: {
		host: '0.0.0.0',
		port: 3000,
	},
	brandNameBase: 'zut',

	db: {
		connectionLimit: 30,
		host: env.DB_HOST,
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		database: env.DB_NAME,
	},
	response: {
		ok: makeResponse<null>(true, null, 'ok', 200),
		conflict: makeResponse<null>(false, null, 'conflict', 409),
		empty: makeResponse<null>(true, null, 'empty', 204),
		processing: makeResponse<null>(true, null, 'processing', 102),
		badRequest: makeResponse<null>(false, null, 'invalid request', 400),
		unauthorised: makeResponse<null>(false, null, 'server error', 401),
		forbidden: makeResponse<null>(false, null, 'forbidden', 403),
		notFound: makeResponse<null>(false, null, 'not found', 404),
		expired: makeResponse<null>(false, null, 'expired', 410),
		serverError: makeResponse<null>(false, null, 'server error', 500),
		redirect: (toUrl: string) =>
			makeResponse<string>(false, toUrl, 'redirect', 302),
	},
	tables: {},
});
