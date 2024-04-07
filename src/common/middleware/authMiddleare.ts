import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import config from '../utils/config';
import { ApiUtils } from '../utils/apiUtils';
import jwtUtils from '../utils/jwtUtils';

const whitelist = [
	'/account/register',
	'/account/login/otp',
	'/account/login',
	'/namespace',
];

const authMiddleware: RequestHandler = async (req, res, next) => {
	const route = req.path;
	if (whitelist.includes(route)) {
		next();
		return;
	}
	if (!req.headers.authorization) {
		res.sendStatus(StatusCodes.UNAUTHORIZED).json(
			ApiUtils.makeResponse(
				false,
				StatusCodes.UNAUTHORIZED,
				null,
				config.responseMessages.credsNotExits,
			),
		);
		return;
	}
	const jwt = req.headers.authorization.replace('Bearer ', '');
	try {
		const jwtPayload = await jwtUtils.validateJwt(jwt);
		(req as any)['principal'] = {
			userId: jwtPayload?.userId ?? '',
			namespaceId: jwtPayload?.namespaceId ?? '',
		};
		next();
		return;
	} catch (e) {
		res.sendStatus(StatusCodes.UNAUTHORIZED).json(
			ApiUtils.makeResponse(
				false,
				StatusCodes.UNAUTHORIZED,
				null,
				config.responseMessages.credsInvalid,
			),
		);
		return;
	}
};

export default authMiddleware;
