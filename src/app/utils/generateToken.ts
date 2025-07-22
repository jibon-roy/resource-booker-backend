import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

// Define string type for expiresIn matching StringValue union
export type JwtExpiresIn =
  | number
  | `${number}${'d' | 'h' | 'm' | 's' | 'ms' | 'y'}`;

export const generateToken = (
  payload: string | object | Buffer,
  secret: Secret,
  expiresIn: JwtExpiresIn,
): string => {
  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn, // Now type-safe
  };

  const token = jwt.sign(payload, secret, options);

  return token;
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};
