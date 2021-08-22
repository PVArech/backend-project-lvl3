import path from 'path';
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';
import os from 'os';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http.js';

import main from '../index.js';

axios.defaults.adapter = httpAdapter;

const getPageLoad = main;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);

let tempDir;
let testFilesContent;
const basePage = 'https://page-loader.hexlet.repl.co/';

const scope = nock(basePage); // .persist();

const resources = [
  {
    name: 'hexlet_result.html',
    format: '/html/',
    fileName: 'page-loader-hexlet-repl-co.html',
  },
  {
    name: 'image_node.png',
    format: '/png/',
    fileName: 'page-loader-hexlet-repl-co_files/page-loader-hexlet-repl-co-assets-professions-nodejs.png',
  },
  {
    name: 'script.js',
    format: '/js/',
    fileName: 'page-loader-hexlet-repl-co_files/page-loader-hexlet-repl-co-script.js',
  },
  {
    name: 'style.css',
    format: '/css/',
    fileName: 'page-loader-hexlet-repl-co_files/page-loader-hexlet-repl-co-assets-application.css',
  },
];

beforeAll(async () => {
  tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

  const testfiles = resources.map(async ({ name, format, fileName }) => {
    const fileContent = await fsp.readFile(getFixturePath(name, 'utf8'));
    return { format, fileContent, fileName };
  });

  testFilesContent = await Promise.all(testfiles);
});

afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

nock.disableNetConnect();

describe('tests page-loader', () => {
  let filePath;

  beforeAll(async () => {
    filePath = path.join(tempDir, 'page-loader-hexlet-repl-co.html');
  });

  test('load base page', async () => {
    scope
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
    const loadHtml = await getPageLoad(basePage, tempDir);
    expect(loadHtml).toBe(filePath);
  });

  test('snapshot base page', async () => {
    const fileContent = await fsp.readFile(filePath, 'utf-8');
    expect(fileContent).toMatchSnapshot();
  });

  test.each(resources)('$format, $name', async ({ format, fileName }) => {
    const contentPath = path.join(tempDir, fileName);
    const [{ fileContent }] = testFilesContent.filter((item) => item.format === format);
    const content = await fsp.readFile(contentPath);
    await expect(content).toEqual(fileContent);
  });
});

describe('error tests', () => {
  test('get error 404', async () => {
    const fakeUrl = 'https://page-loader.hexlet.repl.co/one/';
    scope.get('/one/').reply(404);
    const tempdir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    const filesCount = await fsp.readdir(tempdir);
    await expect(getPageLoad(fakeUrl, tempdir)).rejects.toThrow(/404/);
    expect(filesCount).toHaveLength(0);
  });

  test('nonexistent directory for load', async () => {
    await expect(getPageLoad(basePage, '/tmp/page-loader')).rejects.toThrow('ENOENT');
  });
});
