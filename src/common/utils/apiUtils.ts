import { TApiResponse } from '@/models/base';
import { StatusCodes } from 'http-status-codes';

type arrType = string[] | number[];
const makeParams = (payload: { [k: string]: string | number | arrType }) => {
	let result = '?';
	const keys = Object.keys(payload).entries();
	for (const [idx, key] of keys) {
		if (payload[key] instanceof Array) {
			if ((payload[key] as unknown[]).length > 0) {
				const listData = payload[key] as unknown[];
				let partial = `&${key}=${encodeURIComponent(
					listData[0] as string | number,
				)}`;
				listData.slice(1).forEach((o) => {
					partial += `&${key}=${encodeURIComponent(
						o as string | number,
					)}`;
				});
				if (result === '?') {
					result += partial.slice(1);
				} else {
					result += partial;
				}
			}
		} else {
			result +=
				idx === 0
					? `${key}=${encodeURIComponent(
							payload[key] as string | number,
							// eslint-disable-next-line no-mixed-spaces-and-tabs
						)}`
					: `&${key}=${encodeURIComponent(
							payload[key] as string | number,
							// eslint-disable-next-line no-mixed-spaces-and-tabs
						)}`;
		}
	}
	return result;
};

const makeResponse = <T>(
	success: boolean,
	code: StatusCodes = 200,
	data?: T | null,
	message = '',
): TApiResponse<T> => {
	return {
		success,
		code,
		data: data ?? null,
		message: message ?? '',
	};
};

export const ApiUtils = {
	makeResponse,
	makeParams,
};
