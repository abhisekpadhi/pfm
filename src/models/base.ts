import { z } from 'zod';

// any is required here, since it also includes class type
export type Klass = { new (...arg: any[]): any };

export interface IBase<T> {
	readonly data: T;
	serialized: () => SerializedObjectProperties<T>;
	copy: (arg: Partial<T>) => BaseDTO<T>;
}

export class BaseDTO<T> implements IBase<T> {
	public readonly data: T;
	constructor(init: T) {
		this.data = init;
	}
	copy = (overrides: Partial<T>) => {
		return new BaseDTO<T>({ ...this.data, ...overrides });
	};
	serialized = () => serialize(this.data);
	toString = () => JSON.stringify(this.data);
}

export type SerializedObjectProperties<T> = {
	[K in keyof T]: T[K] extends object ? string : T[K];
};

export type TSerialisable = string | number | boolean | null | object;
export type TEncodableUriComponent = string | number | boolean;
export const serialize = <T>(data: T): SerializedObjectProperties<T> => {
	const obj: Record<string, TSerialisable> = {};
	Object.getOwnPropertyNames(data).forEach((key) => {
		const value = (data as Record<string, TSerialisable>)[key];
		obj[key] = typeof value === 'object' ? JSON.stringify(value) : value;
	});
	return obj as SerializedObjectProperties<T>;
};

const maybeJsonStringRegex = /^\{.*\}$|^\[.*\]$/;

export const deserialize = <T>(data: SerializedObjectProperties<T>): T => {
	const obj: Record<string, TSerialisable> = {};
	for (const key of Object.keys(data)) {
		const value = (data as Record<string, TSerialisable>)[key];
		switch (typeof value) {
			case 'string': {
				try {
					if (maybeJsonStringRegex.test(value)) {
						// first try SuperJSON
						const parsed = JSON.parse(value);
						if (parsed) {
							obj[key] = parsed;
							continue;
						}
						// fallback JSON.parse instead
						obj[key] = JSON.parse(value);
					} else {
						obj[key] = value;
					}
				} catch {
					obj[key] = value;
				}
				break;
			}
			case 'number':
			case 'bigint':
			case 'boolean': {
				obj[key] = value;
				break;
			}
			default: {
				obj[key] = value;
				break;
			}
		}
	}
	return obj as T;
};

export const AuditableSchema = z.object({
	id: z.number().optional().default(0),
	createdAt: z.number().default(Date.now),
});

export type TApiResponse<T = null> = {
	success: boolean;
	data: T | null;
	message: string;
	code: number;
};

export const UUIDSchema = z.string().length(36).default('');
