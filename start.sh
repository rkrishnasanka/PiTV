#!/bin/bash

npm install
node app.js &
export DISPLAY=:0.0
sudo chromium --kiosk 'http://localhost:1330'
