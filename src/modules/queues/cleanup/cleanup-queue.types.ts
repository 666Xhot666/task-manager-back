export enum CleanupJobType {
	DELETE_PROJECT = 'project.delete',
}

export interface DeleteProjectData {
	projectId: string;
}
