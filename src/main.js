import path from 'path';
import axios from 'axios';
import fsp from 'fs/promises';
import cheerio from 'cheerio';
import _ from 'lodash';
import debug from 'debug';
import 'axios-debug-log';

const log = debug('page-loader:');

const urlToFile = (str) => str.replace(/\W/g, '-');

const makeFileName = (name, urlObj) => {
  const separator = name ? '-' : '';
  return `${urlToFile(urlObj.hostname)}${separator}${urlToFile(name)}`;
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

const searchResources = (data, resourcesDir, urlObj) => {
  const $ = cheerio.load(data);
  const links = _.flatten(Object.keys(mapping)
    .map((tag) => $(tag)
      .map((index, link) => {
        const resourceLink = $(link).attr(mapping[tag]);
        const linkObj = new URL(resourceLink, urlObj);
        if ((linkObj.host !== urlObj.host) || !resourceLink) return null;
        const resourceObj = path.parse(resourceLink);
        const resourcePath = path.join(resourcesDir, makeFileName(_.trimStart(resourceObj.dir, '/'), urlObj));
        $(link).attr(mapping[tag], `${resourcePath}-${resourceObj.base}`);
        return resourceLink;
      }).toArray()));
  return { data: $.html(), links };
};

const pageLoad = (page, output = process.cwd()) => {
  const urlObj = new URL(page);
  const convertedName = makeFileName(_.trimStart(urlObj.pathname, '/'), urlObj);
  const filePath = path.join(output, `${convertedName}.html`);
  const resourcesDir = `${convertedName}_files`;
  const resourcesPath = path.join(output, resourcesDir);

  return fsp.access(output)
    // .then(() => fsp.mkdir(resourcesPath, { recursive: true }))
    .then(() => fsp.mkdir(resourcesPath))
    .then(() => {
      log(`get basePage: ${page}`);
      return axios.get(page);
    })
    .then((response) => searchResources(response.data, resourcesDir, urlObj))
    .then((response) => {
      const tasks = response.links.map((link) => {
        const linkObj = path.parse(link);
        const resourceName = `${resourcesPath}/${makeFileName(_.trimStart(linkObj.dir, '/'), urlObj)}-${linkObj.base}`;
        const urlLink = `${urlObj.origin}/${_.trimStart(link, '/')}`;
        log(`found link: ${urlLink}`);
        return downloadData(urlLink, resourceName);
      });
      return Promise.all(tasks)
        .then(() => {
          log(`save content to file: ${filePath}`);
          return fsp.writeFile(filePath, response.data);
        });
    })
    .then(() => filePath);
};

export default pageLoad;
