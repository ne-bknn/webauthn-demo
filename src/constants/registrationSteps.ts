import type { StepDefinition } from '../types';

export const registrationSteps: StepDefinition[] = [
  {
    id: 'reg-1-server-options',
    label: '1. Generate Registration Options',
    description: 'Server creates a challenge and registration options',
    direction: 'server-to-browser',
    activeColumns: ['server', 'wire'],
    cells: {
      server: {
        type: 'code',
        label: 'Generate Options',
        defaultCode: `// Generate a random challenge and build registration options
const challenge = server.randomChallenge();

const options = {
  challenge,
  user: 'demo-user@example.com',
  discoverable: 'preferred',
  userVerification: 'preferred',
};

return options;`,
      },
      wire: {
        type: 'json',
        label: 'Registration Options',
      },
      browser: { type: 'empty' },
      token: { type: 'empty' },
    },
  },
  {
    id: 'reg-2-browser-create',
    label: '2. Create Credential',
    description: 'Browser calls navigator.credentials.create() via WebAuthn API',
    direction: 'browser-to-server',
    activeColumns: ['browser', 'token', 'wire'],
    cells: {
      server: { type: 'empty' },
      wire: {
        type: 'json',
        label: 'Registration Response',
      },
      browser: {
        type: 'code',
        label: 'Call WebAuthn API',
        defaultCode: `const opts = stepData['reg-1-server-options'];

// Build PublicKeyCredentialCreationOptions
// The WebAuthn API requires ArrayBuffers, not strings
const publicKey = {
  challenge: base64urlToBuffer(opts.challenge),
  rp: { name: window.location.hostname, id: window.location.hostname },
  user: {
    id: new TextEncoder().encode(opts.user),
    name: opts.user,
    displayName: opts.user,
  },
  pubKeyCredParams: [
    { alg: -7, type: 'public-key' },   // ES256
    { alg: -257, type: 'public-key' },  // RS256
  ],
  authenticatorSelection: {
    residentKey: opts.discoverable || 'preferred',
    userVerification: opts.userVerification || 'preferred',
  },
  timeout: 60000,
};

// This triggers the authenticator dialog
const cred = await navigator.credentials.create({ publicKey });

// Convert ArrayBuffer response to base64url for the wire
const response = cred.response;
return {
  id: cred.id,
  rawId: bufferToBase64url(cred.rawId),
  type: cred.type,
  authenticatorAttachment: cred.authenticatorAttachment,
  response: {
    attestationObject: bufferToBase64url(response.attestationObject),
    clientDataJSON: bufferToBase64url(response.clientDataJSON),
    authenticatorData: bufferToBase64url(response.getAuthenticatorData()),
    publicKey: bufferToBase64url(response.getPublicKey()),
    publicKeyAlgorithm: response.getPublicKeyAlgorithm(),
    transports: response.getTransports(),
  },
  clientExtensionResults: cred.getClientExtensionResults(),
  user: { id: opts.user, name: opts.user, displayName: opts.user },
};`,
      },
      token: {
        type: 'token-info',
        label: 'Authenticator',
      },
    },
  },
  {
    id: 'reg-3-server-verify',
    label: '3. Verify Registration',
    description: 'Server verifies the attestation and extracts the public key',
    direction: 'browser-to-server',
    activeColumns: ['server', 'wire'],
    cells: {
      server: {
        type: 'code',
        label: 'Verify Attestation',
        defaultCode: `// Get the registration response from the browser
const registration = stepData['reg-2-browser-create'];

// Verify with expected values
const expected = {
  challenge: stepData['reg-1-server-options'].challenge,
  origin: window.location.origin,
};

const result = await server.verifyRegistration(registration, expected);

console.log('Verification successful!');
console.log('Algorithm:', result.credential.algorithm);
console.log('Authenticator:', result.authenticator.name);

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
    id: 'reg-4-server-store',
    label: '4. Store Credential',
    description: 'Server stores the credential for future authentication',
    direction: 'browser-to-server',
    activeColumns: ['server'],
    cells: {
      server: {
        type: 'code',
        label: 'Store Credential',
        defaultCode: `// Extract the verified result
const result = stepData['reg-3-server-verify'];

// Store the credential
addCredential({
  id: result.credential.id,
  publicKey: result.credential.publicKey,
  algorithm: result.credential.algorithm,
  transports: result.credential.transports || [],
  user: result.user,
  registeredAt: Date.now(),
  counter: result.authenticator.counter,
  aaguid: result.authenticator.aaguid,
  authenticatorName: result.authenticator.name,
});

console.log('Credential stored successfully!');
return { stored: true, credentialId: result.credential.id };`,
      },
      wire: { type: 'empty' },
      browser: { type: 'empty' },
      token: { type: 'empty' },
    },
  },
];
