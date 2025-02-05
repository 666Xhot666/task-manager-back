export interface JwtPayload {
	userId: string;
}

export interface JwtPayloadSecret extends JwtPayload {
	jti: string;
}
