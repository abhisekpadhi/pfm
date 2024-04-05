import pino from 'pino';

const levels = {
	http: 10,
	debug: 20,
	info: 30,
	warn: 40,
	error: 50,
	fatal: 60,
};

export const LOG = pino({
	// prettyPrint: false,
	customLevels: levels, // our defined levels
	useOnlyCustomLevels: true,
	level: 'debug',
});