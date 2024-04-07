import { handleResponse } from '@/common/utils/httpHandlers';
import analyticsWorkflows from '@/workflows/analyticsWorkflows';
import { Router, Request } from 'express';

export const analyticsRouter: Router = (() => {
	const router = Router();
	router.get('/', async (req: Request, res) => {
		const out = await analyticsWorkflows.getAnalytics(
			(req as any).principal,
		);
		handleResponse(out, res);
	});
	return router;
})();
