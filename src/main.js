import path from 'path';
import axios from 'axios';
import fs from 'fs/promises';

const makeFileName = (str) => {
  const url = new URL(str);
  const regex = /\W/g;
  const hostName = url.hostname.replace(regex, '-');
  const pathName = url.pathname.replace(regex, '-');
  return `${hostName}${pathName.endsWith('-html') ? pathName.replace('-html', '.html') : `${pathName}.html`}`;
};

const pageLoad = (url, output = process.cwd()) => {
  const fileName = makeFileName(url);
  const filePath = path.join(output, fileName);
  // console.log('url =', url, 'filePath=', filePath);
  return axios.get(url)
    .then((response) => {
      fs.writeFile(filePath, response.data);
    })
    .then(() => filePath);
};

export default pageLoad;
