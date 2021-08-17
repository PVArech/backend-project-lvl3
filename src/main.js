import path from 'path';
import axios from 'axios';
import fsp from 'fs/promises';
import cheerio from 'cheerio';
import _ from 'lodash';

const urlToFile = (str) => str.replace(/\W/g, '-');

const makeFileName = (name, urlObj) => `${urlToFile(urlObj.hostname)}-${urlToFile(name)}`;

const writeData = (filePath, data) => fsp.writeFile(filePath, data);

const downloadData = (resources, resourcesPath, urlObj) => Promise.resolve()
  .then(() => resources.links.map((link) => {
    const linkObj = path.parse(link);
    const resourceName = `${resourcesPath}/${makeFileName(_.trimStart(linkObj.dir, '/'), urlObj)}-${linkObj.base}`;
    const urlLink = `${urlObj.origin}/${link}`;
    return axios.get(urlLink, { responseType: 'arraybuffer' })
      .then((response) => writeData(resourceName, response.data));
  }))
  .then(() => resources.data);

const searchResources = (data, resourcesName, urlObj) => {
  console.log(resourcesName);
  const $ = cheerio.load(data);
  const links = [];
  $('img').each((index, link) => {
    const resourceLink = $(link).attr('src');
    const resourceObj = path.parse(resourceLink);
    const resourcePath = path.join(resourcesName, makeFileName(_.trimStart(resourceObj.dir, '/'), urlObj));
    $(link).attr('src', `${resourcePath}-${resourceObj.base}`);
    links.push(resourceLink);
  });
  return { data: $.html(), links };
};

const pageLoad = (page, output = process.cwd()) => {
  const urlObj = new URL(page);
  const pathName = _.trimStart(urlObj.pathname, '/');
  const fileName = `${makeFileName(pathName, urlObj)}.html`;
  const filePath = path.join(output, fileName);
  const resourcesName = `${makeFileName(pathName, urlObj)}_files`;
  const resourcesPath = path.join(output, resourcesName);

  return fsp.access(output)
    .then(() => fsp.mkdir(resourcesPath, { recursive: true }))
    .then(() => axios.get(page))
    .then((response) => searchResources(response.data, resourcesName, urlObj))
    .then((response) => downloadData(response, resourcesPath, urlObj))
    .then((response) => writeData(filePath, response))
    .then(() => filePath)
    .catch((error) => {
      console.log('!!!page-loader error!!!', error);
      throw error;
    });
};

export default pageLoad;
