import { TApiResponse } from "@/models/base";

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

export type HTTP_CODE =
	| 200
	| 204
	| 401
	| 400
	| 404
	| 403
	| 409
	| 500
	| 410
	| 102
	| 302;

const makeResponse = <T>(
	success: boolean,
	data?: T | null,
	message = '',
	httpStatusCode: HTTP_CODE = 200,
): TApiResponse<T> => {
	return {
		success,
		data: data ?? null,
		message: message ?? '',
		httpStatusCode,
	};
};
const makeResponseWithData = <T>(
	data?: T | null,
	message = '',
	httpStatusCode: HTTP_CODE = 200,
) => {
	return makeResponse((data ?? null) !== null, data, message, httpStatusCode);
};

export const ApiUtils = {
	makeResponse,
	makeParams,
	makeResponseWithData,
};