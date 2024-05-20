#!/bin/bash
API_SERVER_ID=$(screen -ls | grep api_server | cut -d. -f1 | awk '{print $1}');
kill "$API_SERVER_ID"; screen -dmS api_server bash -c 'nvm use 18; yarn start:api'
