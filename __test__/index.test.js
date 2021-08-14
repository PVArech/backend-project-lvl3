import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import os from 'os';
import nock from 'nock';

import main from '../index.js';

const getPageLoad = main;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

let tempDir;
let data;

beforeAll(async () => {
  data = await fs.readFile(getFixturePath('result.html'), 'utf-8');
});

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

nock.disableNetConnect();

test('page-loader getPathFile', async () => {
  nock(/ru\.hexlet\.io/)
    .get(/\/courses/)
    .replyWithFile(200, getFixturePath('result.html'), {
      'Content-Type': 'application/json',
    });

  const pathFile = await getPageLoad('https://ru.hexlet.io/courses', tempDir);
  expect(pathFile).toEqual(path.join(tempDir, 'ru-hexlet-io-courses.html'));
  const fileData = await fs.readFile(pathFile, 'utf-8');
  expect(fileData).toEqual(data);
});
