import type { StepDefinition } from '../types';

export const authenticationSteps: StepDefinition[] = [
  {
    id: 'auth-1-server-options',
    label: '1. Generate Authentication Options',
    description: 'Server creates a challenge and specifies allowed credentials',
    direction: 'server-to-browser',
    activeColumns: ['server', 'wire'],
    cells: {
      server: {
        type: 'code',
        label: 'Generate Challenge',
        defaultCode: `// Generate a random challenge
const challenge = server.randomChallenge();

// Build allowed credentials from stored ones
const allowCredentials = credentials.map(c => ({
  id: c.id,
  transports: c.transports,
}));

console.log('Stored credentials:', credentials.length);

const options = {
  challenge,
  allowCredentials,
  userVerification: 'preferred',
};

return options;`,
      },
      wire: {
        type: 'json',
        label: 'Authentication Options',
      },
      browser: { type: 'empty' },
      token: { type: 'empty' },
    },
  },
  {
    id: 'auth-2-browser-get',
    label: '2. Get Assertion',
    description: 'Browser calls navigator.credentials.get() via WebAuthn API',
    direction: 'browser-to-server',
    activeColumns: ['browser', 'token', 'wire'],
    cells: {
      server: { type: 'empty' },
      wire: {
        type: 'json',
        label: 'Authentication Response',
      },
      browser: {
        type: 'code',
        label: 'Call WebAuthn API',
        defaultCode: `const opts = stepData['auth-1-server-options'];

// Build PublicKeyCredentialRequestOptions
// Convert base64url credentials to ArrayBuffers
const allowCredentials = (opts.allowCredentials || []).map(c => ({
  id: base64urlToBuffer(c.id),
  type: 'public-key',
  transports: c.transports,
}));

const publicKey = {
  challenge: base64urlToBuffer(opts.challenge),
  allowCredentials,
  userVerification: opts.userVerification || 'preferred',
  timeout: 60000,
};

// This triggers the authenticator dialog
const cred = await navigator.credentials.get({ publicKey });

// Convert ArrayBuffer response to base64url for the wire
const response = cred.response;
return {
  id: cred.id,
  rawId: bufferToBase64url(cred.rawId),
  type: cred.type,
  authenticatorAttachment: cred.authenticatorAttachment,
  response: {
    clientDataJSON: bufferToBase64url(response.clientDataJSON),
    authenticatorData: bufferToBase64url(response.authenticatorData),
    signature: bufferToBase64url(response.signature),
    userHandle: response.userHandle
      ? bufferToBase64url(response.userHandle) : null,
  },
  clientExtensionResults: cred.getClientExtensionResults(),
};`,
      },
      token: {
        type: 'token-info',
        label: 'Authenticator',
      },
    },
  },
  {
    id: 'auth-3-server-verify',
    label: '3. Verify Assertion',
    description: 'Server verifies the signature using the stored public key',
    direction: 'browser-to-server',
    activeColumns: ['server', 'wire'],
    cells: {
      server: {
        type: 'code',
        label: 'Verify Signature',
        defaultCode: `// Get the authentication response
const authentication = stepData['auth-2-browser-get'];

// Find the matching stored credential
const credentialId = authentication.id;
const storedCred = credentials.find(c => c.id === credentialId);

if (!storedCred) {
  throw new Error('Unknown credential: ' + credentialId);
}

// Build the credential info object for verification
const credentialKey = {
  id: storedCred.id,
  publicKey: storedCred.publicKey,
  algorithm: storedCred.algorithm,
};

const expected = {
  challenge: stepData['auth-1-server-options'].challenge,
  origin: window.location.origin,
  userVerified: false,
};

const result = await server.verifyAuthentication(
  authentication,
  credentialKey,
  expected
);

console.log('Authentication successful!');
console.log('Counter:', result.counter);

return result;`,
      },
      wire: {
        type: 'json',
        label: 'Verification Input',
      },
      browser: { type: 'empty' },
      token: { type: 'empty' },
    },
  },
  {
    id: 'auth-4-server-update',
    label: '4. Update Counter',
    description: 'Server updates the sign counter for replay detection',
    direction: 'browser-to-server',
    activeColumns: ['server'],
    cells: {
      server: {
        type: 'code',
        label: 'Update Counter',
        defaultCode: `// Get the verification result
const result = stepData['auth-3-server-verify'];

// Update the stored credential's counter
updateCredential(result.credentialId, {
  counter: result.counter,
});

console.log('Counter updated to:', result.counter);
console.log('User authenticated successfully!');

return {
  authenticated: true,
  credentialId: result.credentialId,
  counter: result.counter,
};`,
      },
      wire: { type: 'empty' },
      browser: { type: 'empty' },
      token: { type: 'empty' },
    },
  },
];
