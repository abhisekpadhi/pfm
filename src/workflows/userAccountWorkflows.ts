import { ApiUtils } from '@/common/utils/apiUtils';
import config from '@/common/utils/config';

import jwtUtils from '@/common/utils/jwtUtils';
import { LOG } from '@/common/utils/logger';
import cache from '@/common/utils/redisUtils';
import {
	TUserAccountLoginOTPReq,
	TUserAccountLoginReq,
	TUserAccountRegisterReq,
	UserAccount,
} from '@/models/account';

import userRepository from '@/repositories/userRepository';
import { randomUUID } from 'crypto';

import { StatusCodes } from 'http-status-codes';
import namespaceWorkflows from './namespaceWorkflows';

class UserAccountWorkflow {
	private readonly repo = userRepository;
	register = async (input: TUserAccountRegisterReq) => {
		try {
			const existing = await this.repo.getUserByEmail({
				email: input.email,
				namespaceId: input.namespaceId,
			});

			if (existing?.data?.email.length > 0 ?? false) {
				return ApiUtils.makeResponse(
					false,
					StatusCodes.OK,
					null,
					config.responseMessages.accountAlreadyExists,
				);
			}

			const namespace = await namespaceWorkflows.getNamespace({
				namespaceId: input.namespaceId,
			});
			if (namespace.code === StatusCodes.NOT_FOUND) {
				return ApiUtils.makeResponse(
					false,
					StatusCodes.FORBIDDEN,
					null,
					config.responseMessages.namespaceNotExits,
				);
			}
			const newAccount = await this.repo.insertAndGetAccount(
				new UserAccount({
					createdAt: Date.now(),
					userId: randomUUID(),
					namespaceId: input.namespaceId,
					email: input.email,
					name: input.name,
					currency: input.currency,
				}),
			);
			return ApiUtils.makeResponse(
				true,
				StatusCodes.CREATED,
				newAccount.data,
			);
		} catch (e) {
			console.log(e);
			LOG.info({ msg: 'Error in register account', input, error: e });
			return config.response.serverError;
		}
	};

	loginOtpRequest = async (input: TUserAccountLoginOTPReq) => {
		try {
			const existing = await this.repo.getUserByEmail({
				email: input.email,
				namespaceId: input.namespaceId,
			});
			if (
				existing === null ||
				existing?.data?.namespaceId != input.namespaceId
			) {
				return ApiUtils.makeResponse(
					false,
					StatusCodes.NOT_FOUND,
					null,
					config.responseMessages.accountNotFound,
				);
			}
			// TODO: Rate limit
			// const otp = genId(); // <-- this is for prod
			const otp = '000000'; // hardcoded for testing - remove in prod
			const redisKey = config.redisKeyOtp(input.email, input.namespaceId);
			await cache.set(redisKey, otp);
			await cache.expire(redisKey, config.otpExpiryInSeconds);
			return ApiUtils.makeResponse(
				true,
				StatusCodes.OK,
				null,
				config.responseMessages.otpSent,
			);
		} catch (e) {
			console.log(e);
			LOG.info({ msg: 'Error in requesting OTP', input, error: e });
			return config.response.serverError;
		}
	};

	login = async (input: TUserAccountLoginReq) => {
		const res = { token: '', account: null };
		try {
			const cachedOtp = await cache.get(
				config.redisKeyOtp(input.email, input.namespaceId),
			);
			if (!cachedOtp) {
				return ApiUtils.makeResponse(
					false,
					StatusCodes.OK,
					null,
					config.responseMessages.otpExpired,
				);
			}
			if (cachedOtp != input.otp) {
				return ApiUtils.makeResponse(
					false,
					StatusCodes.OK,
					null,
					config.responseMessages.otpMismatch,
				);
			}
			res.account = await this.repo.getUserByEmail({
				email: input.email,
				namespaceId: input.namespaceId,
			});
			res.token = await jwtUtils.makeJwt({
				userId: res.account.data.userId,
				namespaceId: res.account.data.namespaceId,
			});
			return ApiUtils.makeResponse(true, StatusCodes.OK, res);
		} catch (e) {
			LOG.info({ msg: 'Error in login', input, error: e });
			return config.response.serverError;
		}
	};
}

export default new UserAccountWorkflow();
