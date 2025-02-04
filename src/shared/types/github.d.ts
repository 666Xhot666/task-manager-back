declare namespace github {
	export interface GithubRepository {
		id: number;
		name: string;
		full_name: string;
		html_url: string;
		description: string;
		owner: {
			login: string;
			avatar_url: string;
		};
	}
	export interface GithubRepositoryResponse {
		items: GithubRepository[];
	}
}