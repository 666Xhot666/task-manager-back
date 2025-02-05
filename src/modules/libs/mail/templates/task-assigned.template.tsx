import * as React from 'react';
import { Html, Head, Preview, Body, Container, Heading, Text, Link } from '@react-email/components';

export interface TaskCreatedTemplateProps {
	taskName: string;
	projectName: string;
	assignedBy: string;
	taskLink: string;
}

export default function TaskAssignedTemplate({ taskName, projectName, assignedBy, taskLink }:TaskCreatedTemplateProps): React.JSX.Element {
	return (
		<Html>
			<Head />
			<Preview>New Task Assigned: {taskName}</Preview>
			<Body className="bg-gray-100 text-gray-900">
				<Container className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
					<Heading className="text-xl font-bold text-center text-gray-800">
						New Task Assigned
					</Heading>
					<Text className="text-gray-700">
						You have been assigned a new task: <strong>{taskName}</strong> in the project <strong>{projectName}</strong>.
					</Text>
					<Text className="text-gray-700">Assigned by: <strong>{assignedBy}</strong></Text>
					<Text className="text-gray-700">
						Click the link below to view the task details:
					</Text>
					<Link href={taskLink} className="inline-block px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700">
						View Task
					</Link>
					<Text className="mt-6 text-gray-500 text-sm">
						If you have any questions, please contact your project manager.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
