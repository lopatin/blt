#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BLT_HOME=$DIR/..

$BLT_HOME/node_modules/.bin/webpack-dev-server \
	--config $BLT_HOME/webpack.config.dev.js \
	--content-base $BLT_HOME/src/static
