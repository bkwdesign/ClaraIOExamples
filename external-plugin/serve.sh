#!/bin/sh
http-server -S -C server.crt -K server.key -p 8888 --cors
