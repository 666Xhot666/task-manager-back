export enum EmailJobType {
	TASK_ASSIGNED = 'task.assigned',
	TASK_COMPLETE = 'task.complete',
	PROJECT_FINISHED = 'project.finished',
}

export enum EmailJobPriority {
	HIGH = 'high',
	MEDIUM = 'medium',
	LOW = 'low',
}

export interface TaskAssignedEmailData {
	to: string;
	taskId: string;
	data: {
		taskName: string;
		projectName: string;
		assignedBy: string;
		taskLink: string;
	};
}

export interface TaskCompleteEmailData {
	to: string;
	taskId: string;
	data: {
		managerName: string;
		taskName: string;
		projectName: string;
		performerName: string;
		taskUrl: string;
	};
}

export interface ProjectFinishedEmailData {
	projectId: string;
}

export type EmailJobData =
	| { type: EmailJobType.TASK_ASSIGNED; data: TaskAssignedEmailData }
	| { type: EmailJobType.TASK_COMPLETE; data: TaskCompleteEmailData }
	| { type: EmailJobType.PROJECT_FINISHED; data: ProjectFinishedEmailData };
