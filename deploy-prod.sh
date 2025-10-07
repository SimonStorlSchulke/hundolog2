#!/bin/bash

git reset --hard
git pull
npm run build-prod
sudo rm -rf /var/www/hundolog
sudo mkdir /var/www/hundolog
sudo cp -r ./dist/* /var/www/hundolog