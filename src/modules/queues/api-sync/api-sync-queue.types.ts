export enum ApiSyncJobType {
	GITHUB_REPOSITORIES = 'github.repositories',
	WEATHER = 'weather',
}

export enum ApiSyncJobPriority {
	HIGH = 1,
	MEDIUM,
	LOW,
}

export interface GithubSearchData {
	userId: string;
	searchTitle: string;
}

export interface WeatherData {
	userId: string;
	city: string;
}

export type ApiSyncJobData =
	| { type: ApiSyncJobType.GITHUB_REPOSITORIES; data: GithubSearchData }
	| { type: ApiSyncJobType.WEATHER; data: WeatherData };
