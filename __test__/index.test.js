import path from 'path';
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';
import os from 'os';
import nock from 'nock';

import main from '../index.js';

const getPageLoad = main;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);

let tempDir;
let data;
let imgFile;
let scriptFile;
let styleFile;

beforeAll(async () => {
  data = await fsp.readFile(getFixturePath('hexlet_result.html'), 'utf-8');
  imgFile = await fsp.readFile(getFixturePath('image_node.png'));
  scriptFile = await fsp.readFile(getFixturePath('script.js'));
  styleFile = await fsp.readFile(getFixturePath('style.css'));
});

beforeEach(async () => {
  tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

nock.disableNetConnect();

test('page-loader all resources', async () => {
  nock(/page-loader\.hexlet\.repl\.co/)
    .get(/\//)
    .replyWithFile(200, getFixturePath('hexlet.html'), {
      'Content-Type': 'application/json',
    })
    .get(/\/assets\/professions\/nodejs.png/)
    .replyWithFile(200, getFixturePath('image_node.png'), {
      'Content-Type': 'application/json',
    })
    .get(/\/script.js/)
    .replyWithFile(200, getFixturePath('script.js'), {
      'Content-Type': 'application/json',
    })
    .get(/\/assets\/application\.css/)
    .replyWithFile(200, getFixturePath('style.css'), {
      'Content-Type': 'application/json',
    })
    .get(/\/courses/)
    .replyWithFile(200, getFixturePath('courses.txt'), {
      'Content-Type': 'application/json',
    });

  const pathFile = await getPageLoad('https://page-loader.hexlet.repl.co/', tempDir);
  await expect(pathFile).toEqual(path.join(tempDir, 'page-loader-hexlet-repl-co.html'));

  const fileData = await fsp.readFile(pathFile, 'utf-8');
  await expect(fileData).toEqual(data);
  await expect(fileData).toMatchSnapshot();

  const imgPath = path.join(tempDir, 'page-loader-hexlet-repl-co_files', 'page-loader-hexlet-repl-co-assets-professions-nodejs.png');
  const imgData = await fsp.readFile(imgPath);

  const scriptPath = path.join(tempDir, 'page-loader-hexlet-repl-co_files', 'page-loader-hexlet-repl-co-script.js');
  const scriptData = await fsp.readFile(scriptPath);
  await expect(scriptData).toEqual(scriptFile);

  const stylePath = path.join(tempDir, 'page-loader-hexlet-repl-co_files', 'page-loader-hexlet-repl-co-assets-application.css');
  const styleData = await fsp.readFile(stylePath);
  await expect(styleData).toEqual(styleFile);

  await expect(imgData).toEqual(imgFile);

  nock.cleanAll();
  nock.enableNetConnect();
});
