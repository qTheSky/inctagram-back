interface DefaultPayload {
  iat: number;
  exp: number;
}

export interface AccessPayload extends DefaultPayload {
  userId: string;
}
export interface RefreshPayload extends AccessPayload {
  deviceId: string;
}
