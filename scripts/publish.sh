#!/usr/bin/env sh

version_type="${1}"
echo "${version_type}"

npm run package
git add dist
git commit -m 'Package a new binary'
npm version "${version_type}" -m "Upgrade to version %s"
git push
git push --tags
npm publish
