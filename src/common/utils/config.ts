import { ApiUtils } from './apiUtils';
import { env } from './envConfig';
const { makeResponse } = ApiUtils;

export default Object.freeze({
	jwtSecret: env.JWT_SECRET,
	redis: { url: env.REDIS_URL },
	db: {
		connectionLimit: 30,
		host: env.DB_HOST,
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		database: env.DB_NAME,
	},
	response: {
		ok: makeResponse<null>(true, 200, null, 'ok'),
		badRequest: makeResponse<null>(false, 400, null, 'invalid request'),
		unauthorised: makeResponse<null>(false, 401, null, 'server error'),
		forbidden: makeResponse<null>(false, 403, null, 'forbidden'),
		notFound: makeResponse<null>(false, 404, null, 'not found'),
		serverError: makeResponse<null>(false, 500, null, 'server error'),
	},
	tables: {
		namespace: 'namespace',
		balance: 'balance',
		transaction: 'transaction',
		userAccount: 'user_account',
	},
	otpLen: 6,
	otpExpiryInSeconds: 5 * 60,
	idgen: {
		customAlphabets: '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	},
	redisKeyOtp: (email: string, namespaceId: string) =>
		`otp:${namespaceId}:${email}`,
	redisKeyAnalytics: (userId: string, namespaceId: string) =>
		`analytics:${namespaceId}:${userId}`,
	redisKeyForTxnTableIdOffset: 'analytics:offset:transaction',
	responseMessages: {
		accountNotFound: 'Account not found, please register first',
		otpSent: 'OTP has been sent to your email',
		otpMismatch: 'OTP Mismatch, please try again',
		otpExpired: 'OTP Expired, please try again',
		accountAlreadyExists: 'Account already exists',
		namespaceNotExits: 'Namespace does not exits',
		credsNotExits: 'Credentials not found',
		credsInvalid: 'Credentials are invalid',
	},
});
