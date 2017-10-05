#!/bin/sh

node server/server.js > /dev/null &
PID=$!
npm test
kill $PID
