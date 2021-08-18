import path from 'path';
import axios from 'axios';
import fsp from 'fs/promises';
import cheerio from 'cheerio';
import _ from 'lodash';

const urlToFile = (str) => str.replace(/\W/g, '-');

const makeFileName = (name, urlObj) => {
  const separator = name ? '-' : '';
  return `${urlToFile(urlObj.hostname)}${separator}${urlToFile(name)}`;
};

const writeData = (filePath, data) => fsp.writeFile(filePath, data);

const downloadData = (resources, resourcesPath, urlObj) => Promise.resolve()
  .then(() => resources.links.map((link) => {
    const linkObj = path.parse(link);
    const resourceName = `${resourcesPath}/${makeFileName(_.trimStart(linkObj.dir, '/'), urlObj)}-${linkObj.base}`;
    const urlLink = `${urlObj.origin}/${_.trimStart(link, '/')}`;
    return axios.get(urlLink, { responseType: 'arraybuffer' })
      .then((response) => writeData(resourceName, response.data));
  }))
  .then(() => resources.data);

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
        if ((linkObj.origin !== urlObj.origin) || !resourceLink) return null;
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
    .then(() => fsp.mkdir(resourcesPath, { recursive: true }))
    .then(() => axios.get(page))
    .then((response) => searchResources(response.data, resourcesDir, urlObj))
    .then((response) => downloadData(response, resourcesPath, urlObj))
    .then((response) => writeData(filePath, response))
    .then(() => filePath)
    .catch((error) => {
      console.log('!!!page-loader error!!!', error);
      throw error;
    });
};

export default pageLoad;
