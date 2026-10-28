const detox = require('detox');
const config = require('./package.json').detox;
const adapter = require('detox/runners/jest/adapter');

jest.setTimeout(120000);

jasmine.getEnv().addReporter(adapter);

beforeAll(async () => {
  await detox.init(config, { launchApp: false });
  await device.launchApp({ newInstance: true, delete: true });
});

afterAll(async () => {
  await detox.cleanup();
});