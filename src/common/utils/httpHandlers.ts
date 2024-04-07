import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError, ZodSchema } from 'zod';
import { TApiResponse } from '@/models/base';
import config from './config';
import { ApiUtils } from './apiUtils';

export const handleResponse = (
	serviceResponse: TApiResponse<any>,
	response: Response,
) => {
	return response.status(serviceResponse.code).send(serviceResponse);
};

export const validateRequest =
	(schema: ZodSchema) =>
	(req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.body);
			next();
		} catch (e) {
			if (e instanceof ZodError) {
				const errorMessage = `Invalid input`;
				res.status(StatusCodes.BAD_REQUEST).json(
					ApiUtils.makeResponse(
						false,
						StatusCodes.BAD_REQUEST,
						e.issues,
						errorMessage,
					),
				);
			} else {
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
					config.response.serverError,
				);
			}
		}
	};
