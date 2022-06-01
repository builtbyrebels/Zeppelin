#!/bin/bash

TARGET_DIR=/var/www/zeppelin.gg

# Load nvm
. ~/.nvm/nvm.sh

# Update dashboard
cd dashboard
git pull origin master
nvm use
npm ci
npm run build
rm -r $TARGET_DIR/*
cp -R dist/* $TARGET_DIR

# Return
cd ..
