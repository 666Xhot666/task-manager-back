import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button } from '@react-email/components';

export interface TaskCompletedTemplateProps {
	managerName: string;
	taskName: string;
	projectName: string;
	performerName: string;
	taskUrl: string;
}

export default function TaskCompletedTemplate({ managerName, taskName, projectName, performerName, taskUrl,}: TaskCompletedTemplateProps) {
	return (
		<Html>
			<Head />
			<Preview>Task Completed Notification</Preview>
			<Body className="bg-gray-100 text-gray-900">
				<Container className="p-6 max-w-lg bg-white shadow-md rounded-lg">
					<Section>
						<Text className="text-xl font-semibold">Hello {managerName},</Text>
						<Text className="text-base">
							The task <strong>{taskName}</strong> in project <strong>{projectName}</strong> has been marked as completed by <strong>{performerName}</strong>.
						</Text>
						<Text className="text-base">You can review the task details using the link below:</Text>
						<Button
							className="mt-4 px-6 py-2 text-white bg-blue-600 rounded-lg"
							href={taskUrl}
						>
							View Task
						</Button>
						<Text className="text-sm text-gray-600 mt-4">Thank you,</Text>
						<Text className="text-sm text-gray-600">Your Project Management Team</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
};

