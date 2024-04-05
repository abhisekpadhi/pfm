import { z } from 'zod';
import { BoolishNumber } from '../lib/zodUtils';
import SuperJSON from 'superjson';

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
						const parsed = SuperJSON.parse(value);
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
	currentActive: z.boolean().default(true),
});

export const UserAuditableSchema = AuditableSchema.extend({
	userId: z.string().default(''),
});

export const UserVerifiedAuditableSchema = UserAuditableSchema.extend({
	verified: z.nativeEnum(BoolishNumber).default(BoolishNumber.false),
});

export enum CommonStatus {
	ACTIVE = 'ACTIVE',
	IN_REVIEW = 'IN_REVIEW',
	INACTIVE = 'INACTIVE',
}

export type TApiResponse<T> = {
	success: boolean;
	data: T | null;
	message: string;
	httpStatusCode: number;
};

// len <= 14, coz xId is 36 chars long and random part is 21 chars, and _ is used as seprator
export enum IDFor {
	login = 'logn', // login prod
	login_dev = 'logd', // login dev
	user = 'usr',
	product = 'prd',
	variant = 'vrnt',
	variation = 'vrsn',
	attribution = 'attr',
	sku = 'sku',
	coupon = 'cupn',
	order = 'ord',
	orderLine = 'ordln',
	txn = 'txn', // transaction
	category = 'cat',
	subcategory = 'sbct',
	vertical = 'vert',
	biz = 'biz',
	pref = 'pref', // user preference
	wat = 'wat', // whatsappp token
	wat_dev = 'watd', // whatsapp token dev
	media = 'mdia',
	task = 'task',
	ticker = 'tkr',
	tickerName = 'tkrnm',
	physicalAddress = 'phadr',
	kyc = 'kyc',
	taxInvoice = 'inv',
	inventoryReservation = 'res',
	chat = 'cht',
	sseToken = 'sse', // server sent events
	creditEntry = 'ce',
}

export const PaginatedSchema = z.object({
	limit: z.number(),
	offset: z.number(),
});

export type TFSM<T> = { [k: string]: { transitions: T[] } };
export class BaseFSM<T> {
	current: string;
	fsm: TFSM<T>;

	constructor(current: string, fsm: TFSM<T>) {
		this.current = current;
		this.fsm = fsm;
	}

	is = (state: T) => {
		return this.current === state;
	};

	can = (to: T) => {
		return this.fsm[this.current].transitions.includes(to);
	};

	transitions = (from?: string) => {
		return this.fsm[from ?? this.current].transitions;
	};
}

// ready made schemas
export const EntityIdSchema = z.string().max(36).min(1);
export const PaginationSchema = z.object({
	limit: z.number(),
	offset: z.number(),
});
// export const ListOfStringSchema = z.array(z.string()).default([]);
export const ListOfStringSchema = z
	.preprocess((v) => {
		return typeof v === 'string'
			? v === ''
				? []
				: JSON.parse(v as string)
			: v;
	}, z.array(z.string()))
	.default([]);

export type TAction = 'added' | 'removed' | 'updated';