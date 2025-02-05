import { hash, verify } from 'argon2';
import * as crypto from 'node:crypto';

export enum HashUtils {
	Argon2 = 'argon2id',
	Scrypt = 'scrypt',
}

class EncryptUtil {
	constructor(
		private readonly argonUtil: ArgonUtil,
		private readonly scryptUtil: ScryptUtil,
	) {}

	hash = (password: string, util: HashUtils = HashUtils.Scrypt) => {
		switch (util) {
			case HashUtils.Argon2:
				return this.argonUtil.hash(password);
			case HashUtils.Scrypt:
				return this.scryptUtil.hash(password);
			default:
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				throw new Error(`Unsupported encryption util: ${util}`);
		}
	};

	verify = (password: string, encrypted: string) => {
		const [, key] = encrypted.split('$') as [undefined, HashUtils];

		switch (key) {
			case HashUtils.Argon2:
				return this.argonUtil.verify(password, encrypted);
			case HashUtils.Scrypt:
				return this.scryptUtil.verify(password, encrypted);
			default:
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				throw new Error(`Unsupported encryption util: ${key}`);
		}
	};
}

class ArgonUtil {
	public hash = (password: string) => hash(password);
	public verify = (password: string, encrypted: string) =>
		verify(encrypted, password);
}

interface ScryptParams {
	N: number;
	r: number;
	p: number;
	maxmem: number;
}

class ScryptUtil {
	private SCRYPT_PARAMS: ScryptParams = {
		N: 32768,
		r: 8,
		p: 1,
		maxmem: 64 * 1024 * 1024,
	};
	private SCRYPT_PREFIX: string = `$scrypt$N=${this.SCRYPT_PARAMS.N},r=${this.SCRYPT_PARAMS.r},p=${this.SCRYPT_PARAMS.p},maxmem=${this.SCRYPT_PARAMS.maxmem}$`;
	private SALT_LEN = 32;
	private KEY_LEN = 64;

	private serializeHash = (
		hash: Buffer<ArrayBufferLike>,
		salt: Buffer<ArrayBufferLike>,
	): string => {
		const saltString: string = salt.toString('base64').split('=')[0];
		const hashString: string = hash.toString('base64').split('=')[0];
		return `${this.SCRYPT_PREFIX}${saltString}$${hashString}`;
	};
	private parseOptions = (options: string) => {
		const items = options.split(',').map((item) => {
			const [key, val] = item.split('=');
			return [key, Number(val)];
		});
		return Object.fromEntries(items) as ScryptParams;
	};

	private deserializeHash = (phcString: string) => {
		const [, name, options, salt64, hash64] = phcString.split('$');
		if (name !== 'scrypt') {
			throw new Error('Node.js crypto module supports only scrypt');
		}
		const params = this.parseOptions(options);
		const salt = Buffer.from(salt64, 'base64');
		const hash = Buffer.from(hash64, 'base64');
		return {
			params,
			hash,
			salt,
		};
	};

	public hash = (password: string) =>
		new Promise<string>((resolve, reject) => {
			crypto.randomBytes(this.SALT_LEN, (err, salt) => {
				if (err) {
					reject(err);
					return;
				}
				crypto.scrypt(
					password,
					salt,
					this.KEY_LEN,
					this.SCRYPT_PARAMS,
					(err, hash) => {
						if (err) {
							reject(err);
							return;
						}
						resolve(this.serializeHash(hash, salt));
					},
				);
			});
		});
	public verify = (password: string, encrypted: string) => {
		const { params, salt, hash } = this.deserializeHash(encrypted);
		return new Promise((resolve, reject) => {
			const callback = (
				err: Error,
				hashedPassword: Buffer<ArrayBufferLike>,
			) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(crypto.timingSafeEqual(hashedPassword, hash));
			};
			crypto.scrypt(password, salt, hash.length, params, callback);
		});
	};
}

export const encrypt = new EncryptUtil(new ArgonUtil(), new ScryptUtil());
