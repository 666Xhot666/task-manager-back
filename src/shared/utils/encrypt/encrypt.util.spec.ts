import { encrypt, HashUtils } from './encrypt.util';

describe('EncryptUtil', () => {
	describe('hash', () => {
		it('should generate scrypt hash by default', async () => {
			const hash = await encrypt.hash('password');
			expect(hash).toMatch(/^\$scrypt/);
		});

		it('should generate argon2 hash when specified', async () => {
			const hash = await encrypt.hash('password', HashUtils.Argon2);
			expect(hash).toMatch(/^\$argon2id/);
		});

		it('should throw error for unsupported algorithm', () => {
			expect(() => encrypt.hash('password', 'unknown' as HashUtils)).toThrow(
				'Unsupported encryption util: unknown',
			);
		});
	});

	describe('verify', () => {
		it('should validate scrypt hash', async () => {
			const hash = await encrypt.hash('test123');
			await expect(encrypt.verify('test123', hash)).resolves.toBe(true);
			await expect(encrypt.verify('wrong-pass', hash)).resolves.toBe(false);
		});

		it('should validate argon2 hash', async () => {
			const hash = await encrypt.hash('test123', HashUtils.Argon2);
			await expect(encrypt.verify('test123', hash)).resolves.toBe(true);
			await expect(encrypt.verify('wrong-pass', hash)).resolves.toBe(false);
		});

		it('should throw error for invalid hash format', () => {
			expect(() => encrypt.verify('pass', 'invalid-hash')).toThrow(
				'Unsupported encryption util: undefined',
			);
		});
	});
});
