import 'react-native-gesture-handler/jestSetup'; // common RN testing setup
import 'whatwg-fetch'; // optional: fetch in Node environment

// Your existing encoders/clone shims are OK:
import { TextDecoder, TextEncoder } from 'util';
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
global.TextDecoderStream = class {};
global.TextEncoderStream = class {};
global.structuredClone = global.structuredClone || ((v) => JSON.parse(JSON.stringify(v)));

// Keep test-only envs here
if (!global.process) global.process = {};
if (!global.process.env) global.process.env = {};
process.env.EXPO_PUBLIC_API_URL = 'https://mock-api-url-for-tests.com';
