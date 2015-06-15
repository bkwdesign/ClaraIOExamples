To test this external plugin:

```
npm install -g http-server
http-server -S -C server.crt -K server.key -p 8888 --cors
```

Then, inside the app, set up a new plugin called "External" to "Load From Server", and point it to
`https://localhost:8888/external.js`

It is important that the plugin is named "External" as this defines the namespace for the operators in the external.js plugin.  Otherwise there will be a disagreement between the two.
