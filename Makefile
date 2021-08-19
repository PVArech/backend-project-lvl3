install: # Эта команда полезна при первом клонировании репозитория (или после удаления node_modules).            
	npm ci

page-loader:
	node bin/page-loader.js

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

testDebug:
	DEBUG=nock.* npm test

lint:
	npx eslint .

lintFix:
	npx eslint . --fix

asci:
	asciinema rec

publish:
	npm publish --dry-run

.PHONY: test
