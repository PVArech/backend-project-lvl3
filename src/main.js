import path from 'path';
import axios from 'axios';
import fsp from 'fs/promises';
import cheerio from 'cheerio';
import _ from 'lodash';
import debug from 'debug';
import 'axios-debug-log';
import Listr from 'listr';

const log = debug('page-loader:');

const makeFileName = (urlObj, output) => {
  const charReplace = (str, regExp, separator) => str.replace(regExp, separator);
  const reg = /-(?=\w{2,3}$)/; // замена последнего '-' в строке
  const regAll = /\W/g; // замена всех '-' в строке

  const linkPath = path.join(urlObj.hostname, _.trimStart(urlObj.pathname, '/'));
  const convertedName = `${charReplace(linkPath, regAll, '-')}`;
  const filePath = path.join(output, convertedName);
  const { ext } = path.parse(urlObj.toString());
  const fileWithExt = ext ? charReplace(convertedName, reg, '.') : convertedName;
  const filePathWithExt = path.join(output, fileWithExt);
  const resourcesDir = `${convertedName}_files`;
  const resourcesPath = path.join(output, resourcesDir);

  return {
    filePath, filePathWithExt, resourcesDir, resourcesPath,
  };
};

const downloadData = (urlLink, resourceName) => {
  log(`GET: ${urlLink}`);
  return axios.get(urlLink, { responseType: 'arraybuffer' })
    .then(({ data }) => {
      log(`save content to file: ${resourceName}`);
      return fsp.writeFile(resourceName, data);
    });
};

const mapping = {
  img: 'src',
  script: 'src',
  link: 'href',
};

const getPageContent = (html, resourcesDir, urlObj) => {
  const $ = cheerio.load(html);
  const links = _.flatten(Object.keys(mapping)
    .map((tag) => $(tag)
      .map((index, link) => {
        const resourceLink = $(link).attr(mapping[tag]);
        const linkObj = new URL(resourceLink, urlObj);
        if ((linkObj.host !== urlObj.host) || !resourceLink) return null;
        const { filePathWithExt } = makeFileName(linkObj, resourcesDir);
        $(link).attr(mapping[tag], filePathWithExt);
        return linkObj;
      }).toArray()));
  return { data: $.html(), links };
};

const makeTaskDownloadData = (links, resourcesPath) => {
  const tasks = links.map((urlLink) => {
    const { filePathWithExt } = makeFileName(urlLink, resourcesPath);
    log(`found link: ${urlLink.toString()}`);
    return ({
      title: urlLink.toString(),
      task: () => downloadData(urlLink.toString(), filePathWithExt),
    });
  });
  const listr = new Listr(tasks, { concurrent: true });
  return listr;
};

const pageLoad = (urlPage, output = process.cwd()) => {
  const urlObj = new URL(urlPage);
  const { filePath, resourcesDir, resourcesPath } = makeFileName(urlObj, output);
  let pageContent;

  return fsp.access(output)
    .then(() => {
      log(`get basePage: ${urlPage}`);
      return axios.get(urlPage);
    })
    .then((response) => {
      pageContent = getPageContent(response.data, resourcesDir, urlObj);
      return fsp.writeFile(`${filePath}.html`, pageContent.data);
    })
    // .then(() => fsp.mkdir(resourcesPath, { recursive: true }))
    .then(() => fsp.mkdir(resourcesPath))
    .then(() => {
      const listr = makeTaskDownloadData(pageContent.links, resourcesPath);
      return listr.run();
    })
    .then(() => `${filePath}.html`);
};

export default pageLoad;

// DEBUG=page-loader:* page-loader https://page-loader.hexlet.repl.co/

// DEBUG=axios page-loader https://page-loader.hexlet.repl.co/
