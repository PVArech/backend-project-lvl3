[![Actions Status](https://github.com/PVArech/backend-project-lvl3/workflows/hexlet-check/badge.svg)](https://github.com/PVArech/backend-project-lvl3/actions)
[![eslint-test](https://github.com/PVArech/backend-project-lvl3/actions/workflows/main.yml/badge.svg)](https://github.com/PVArech/backend-project-lvl3/actions/workflows/main.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/60cb04f65fbf108f8b9d/maintainability)](https://codeclimate.com/github/PVArech/backend-project-lvl3/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/60cb04f65fbf108f8b9d/test_coverage)](https://codeclimate.com/github/PVArech/backend-project-lvl3/test_coverage)


## Загрузчик страниц

**page-loader** утилита командной строки, которая, скачивает страницу из сети и сохраняет в указанную директорию (по умолчанию в директорию запуска программы). 
Имя файла формируется следующим образом:
 1. Берётся адрес страницы без протокола.
 2. Все символы, кроме букв и цифр заменяются на дефис -.
 3. В конце ставится .html.
 Программа возвращает полный путь к загруженному файлу.
  
Ресурсы страницы (изображения, стили и скрипты) размещаются в директории, имя которой формируется так же как и название основного файла, но в конце, вместо **.html** добавляется **_files**. Имена файлов формируются по аналогии как для страницы, с указанием расширения файла. При этом внутри основной страницы все ссылки заменены так, что они указывают на файлы в директории, что позволяет открывать страницу без Интернета.


## Как использовать:
 * выполните команду "**page-loader -h**", чтобы отобразить справочную информацию;
 * выполните команду "**page-loader** < адрес веб-страницы > **-o** < каталог загрузки >", чтобы загрузить веб-страницу.


### Примеры использования:
[![asciicast](https://asciinema.org/a/mrIhovXJiTDJQ0yojGfOcXNDh.svg)](https://asciinema.org/a/mrIhovXJiTDJQ0yojGfOcXNDh)
[![asciicast](https://asciinema.org/a/k7Fn77L1ONehGjNjZpydVb5CY.svg)](https://asciinema.org/a/k7Fn77L1ONehGjNjZpydVb5CY)
[![asciicast](https://asciinema.org/a/oltVKM9IMfv9oLcTStcjZVSr4.svg)](https://asciinema.org/a/oltVKM9IMfv9oLcTStcjZVSr4)
[![asciicast](https://asciinema.org/a/z1UQ92wq9KI031XydC163z9Xq.svg)](https://asciinema.org/a/z1UQ92wq9KI031XydC163z9Xq)
[![asciicast](https://asciinema.org/a/x2l4OYe78SfYaJrUY9dxIA0MX.svg)](https://asciinema.org/a/x2l4OYe78SfYaJrUY9dxIA0MX)
[![asciicast](https://asciinema.org/a/1qwnBiqjXldNo85zHGwkbXkm8.svg)](https://asciinema.org/a/1qwnBiqjXldNo85zHGwkbXkm8)
