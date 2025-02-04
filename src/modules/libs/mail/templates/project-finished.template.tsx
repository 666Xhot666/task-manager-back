import * as React from 'react';
import { Html } from '@react-email/html';
import { Tailwind } from '@react-email/tailwind';
import { Head } from '@react-email/head';
import { Preview } from '@react-email/preview';
import { Body } from '@react-email/body';
import { Container } from '@react-email/container';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';
import { Heading } from '@react-email/heading';

export interface ProjectFinishedTemplateProps {
	recipientName: string;
	projectName: string;
}

export const ProjectFinishedTemplate = ({ recipientName, projectName, }:ProjectFinishedTemplateProps) => {
	return (
		<Html>
			<Head />
			<Preview>Project "{projectName}" has been successfully completed!</Preview>
			<Tailwind>
				<Body className="bg-gray-100 text-gray-900">
					<Container className="mx-auto p-6 max-w-xl bg-white rounded-lg shadow-md">
						<Section>
							<Heading className="text-xl font-semibold text-gray-800">Project Completed: {projectName}</Heading>
							<Text className="text-gray-700">
								Hello {recipientName},
							</Text>
							<Text className="text-gray-700">
								We are pleased to inform you that the project "{projectName}" has been successfully completed. Thank you for your contributions and effort throughout this journey.
							</Text>
							<Text className="text-gray-700">
								If you have any questions or need further details, please feel free to reach out.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};
