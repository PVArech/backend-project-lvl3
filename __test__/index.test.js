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
let data;
let imgFile;
let scriptFile;
let styleFile;

beforeEach(async () => {
  tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  data = await fsp.readFile(getFixturePath('hexlet_result.html'), 'utf-8');
  imgFile = await fsp.readFile(getFixturePath('image_node.png'));
  scriptFile = await fsp.readFile(getFixturePath('script.js'));
  styleFile = await fsp.readFile(getFixturePath('style.css'));
});

nock.disableNetConnect();

describe('tests page-loader', () => {
  it('page-loader all resources', async () => {
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
    expect(pathFile).toEqual(path.join(tempDir, 'page-loader-hexlet-repl-co.html'));

    const fileData = await fsp.readFile(pathFile, 'utf-8');
    expect(fileData).toEqual(data);
    expect(fileData).toMatchSnapshot();

    const imgPath = path.join(tempDir, 'page-loader-hexlet-repl-co_files', 'page-loader-hexlet-repl-co-assets-professions-nodejs.png');
    const imgData = await fsp.readFile(imgPath);

    const scriptPath = path.join(tempDir, 'page-loader-hexlet-repl-co_files', 'page-loader-hexlet-repl-co-script.js');
    const scriptData = await fsp.readFile(scriptPath);
    expect(scriptData).toEqual(scriptFile);

    const stylePath = path.join(tempDir, 'page-loader-hexlet-repl-co_files', 'page-loader-hexlet-repl-co-assets-application.css');
    const styleData = await fsp.readFile(stylePath);
    expect(styleData).toEqual(styleFile);

    expect(imgData).toEqual(imgFile);

    nock.cleanAll();
    nock.enableNetConnect();
  });
});

// DEBUG=axios page-loader https://page-loader.hexlet.repl.co/
// DEBUG=axios page-loader https://optimization.guide/flying-by-instruments.html

// DEBUG=page-loader:* page-loader https://page-loader.hexlet.repl.co/
// DEBUG=page-loader:* page-loader https://optimization.guide/flying-by-instruments.html

// asciinema rec
// tree
// page-loader -h
// page-loader https://page-loader.hexlet.repl.co/
// page-loader https://optimization.guide/flying-by-instruments.html
// page-loader -o ./page-loader
// https://optimization.guide/flying-by-instruments.html
