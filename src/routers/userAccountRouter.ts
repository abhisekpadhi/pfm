import { handleResponse, validateRequest } from '@/common/utils/httpHandlers';
import {
	UserAccountLoginOTPReqSchema,
	UserAccountLoginReqSchema,
	UserAccountRegisterReqSchema,
} from '@/models/account';
import userAccountWorkflows from '@/workflows/userAccountWorkflows';
import { Router } from 'express';

export const userAccountRouter: Router = (() => {
	const router = Router();

	router.post(
		'/register',
		validateRequest(UserAccountRegisterReqSchema),
		async (req, res) => {
			const input = UserAccountRegisterReqSchema.parse(req.body);
			const out = await userAccountWorkflows.register(input);
			handleResponse(out, res);
		},
	);

	router.post(
		'/login/otp',
		validateRequest(UserAccountLoginOTPReqSchema),
		async (req, res) => {
			const input = UserAccountLoginOTPReqSchema.parse(req.body);
			const out = await userAccountWorkflows.loginOtpRequest(input);
			handleResponse(out, res);
		},
	);

	router.post(
		'/login',
		validateRequest(UserAccountLoginReqSchema),
		async (req, res) => {
			const input = UserAccountLoginReqSchema.parse(req.body);
			const out = await userAccountWorkflows.login(input);
			handleResponse(out, res);
		},
	);

	return router;
})();
