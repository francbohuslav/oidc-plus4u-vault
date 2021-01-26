This tool for maintains AES-256 encrypted file with accessCodes to oidc.plus4u.net.
This project is extended copy of https://github.com/jiridudekusy/keystore-insomnia-oidc-plus4u

[Changelog](doc/CHANGELOG.md)

# How to install ?

`npm install -g plus4u-insomnia-keystore-vault`

# How to use ?

![Help](doc/help.png)

## Structure of text file
*{user UID} {AccessCode1} {AccessCode2}*

12-3456-1 g156fd1g65d1g65df1g56d gd1f6g1d56g1d6f5g1d6f5 \
12-3456-2 54dv6g24dv26g4d6v5g24d 4jng257jd8f27v4d9s8c4g \
...

# How to develop ?

Publish new version
1. `npm pack`
2. `npm publish --registry https://registry.npmjs.org/`


