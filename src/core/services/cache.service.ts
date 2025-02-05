import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
	private readonly logger = new Logger(CacheService.name);

	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

	/**
	 * Get a value from cache
	 * @param key - Cache key
	 * @returns The cached value or null if not found
	 */
	async get<T>(key: string): Promise<T | null> {
		try {
			const value = await this.cacheManager.get<T>(key);
			if (value !== null) {
				this.logger.debug(`Cache hit for key: ${key}`);
			} else {
				this.logger.debug(`Cache miss for key: ${key}`);
			}
			return value;
		} catch (error) {
			this.logger.error(
				`Error retrieving cache for key: ${key}`,
				error instanceof Error ? error.stack : 'Stack supposed to be here....',
			);
			return null;
		}
	}

	/**
	 * Set a value in cache
	 * @param key - Cache key
	 * @param value - Value to cache
	 * @param ttl - Time to live in seconds (optional)
	 */
	async set<T>(key: string, value: T, ttl?: number): Promise<void> {
		try {
			await this.cacheManager.set(key, value, ttl ? ttl * 1000 : undefined);
			this.logger.debug(`Cache set for key: ${key}`);
		} catch (error) {
			this.logger.error(
				`Error setting cache for key: ${key}`,
				error instanceof Error ? error.stack : 'Stack supposed to be here....',
			);
		}
	}

	/**
	 * Delete a value from cache
	 * @param key - Cache key
	 */
	async delete(key: string): Promise<void> {
		try {
			await this.cacheManager.del(key);
			this.logger.debug(`Cache deleted for key: ${key}`);
		} catch (error) {
			this.logger.error(
				`Error deleting cache for key: ${key}`,
				error instanceof Error ? error.stack : 'Stack supposed to be here....',
			);
		}
	}

	/**
	 * Get or set cache value with a factory function
	 * @param key - Cache key
	 * @param factory - Function to generate value if not in cache
	 * @param ttl - Time to live in seconds (optional)
	 * @returns The cached or generated value
	 */
	async getOrSet<T>(
		key: string,
		factory: () => Promise<T>,
		ttl?: number,
	): Promise<T> {
		const cachedValue = await this.get<T>(key);
		if (cachedValue !== null) {
			return cachedValue;
		}

		const value = await factory();
		await this.set(key, value, ttl);
		return value;
	}

	/**
	 * Generate a cache key from multiple parts
	 * @param parts - Parts to combine into a key
	 * @returns Combined cache key
	 */
	generateKey(...parts: (string | number)[]): string {
		return parts.join(':');
	}
}
