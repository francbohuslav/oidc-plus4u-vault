#!/usr/bin/env node
// to enable mocks
const vaultCli = require("./app/cli");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
vaultCli()
    .then(() => {})
    .catch((e) => {
        console.log(`Error in application : ${e} stacktrace: ${e.stack}`);
    });
