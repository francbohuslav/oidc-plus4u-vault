const TaskUtils = require("../misc/task-utils");
const SecureStoreCliCommon = require("../secure-store-cli-common");
const { promisify } = require("util");
const r2 = require("r2");
const readFile = promisify(require("fs").readFile);

const DEFAULT_OIDC_SERVER = "https://uuidentity.plus4u.net/uu-oidc-maing02/bb977a99f4cc4c37a2afce3fd599d0a7/oidc";

const optionsDefinitions = [
    {
        name: "file",
        type: String,
        typeLabel: "{underline file}",
        defaultOption: true,
        description: "Path file that contains access codes for new accounts.",
    },
    {
        name: "url",
        type: String,
        typeLabel: "{underline oidc url}",
        description: "URL to the OIDC server. If not set, defaults to " + DEFAULT_OIDC_SERVER + ".",
    },
    {
        name: "help",
        alias: "h",
        type: Boolean,
        description: "Displays this usage guide.",
    },
];

const help = [
    {
        header: "add file command",
        content: "Stores user credentials to the vault from file.",
    },
    {
        header: "Synopsis",
        content: [
            "$ plus4u-insomnia-keystore-vault addfile {underline file}",
            "$ plus4u-insomnia-keystore-vault addfile [{bold --url} {underline oidc url}] {underline file}",
        ],
    },
    {
        header: "Options",
        optionList: optionsDefinitions,
    },
];

class AddFileTask {
    constructor() {
        this._taskUtils = new TaskUtils(optionsDefinitions, help);
    }

    async execute(cliArgs) {
        let options = this._taskUtils.parseCliArguments(cliArgs);
        this._taskUtils.testOption(options.file, "File is mandatory option.");

        let content = (await readFile(options.file)).toString();
        let lines = content.split(/[\r\n]+/);
        let accounts = lines.filter((line) => line.split(/\s+/).length > 2).map((line) => line.split(/\s+/));
        console.log("File cointans accounts for users: " + accounts.map((a) => a[0]).join(", "));

        let secureStoreCliCommon = await SecureStoreCliCommon.init();
        let secureStoreCnt = await secureStoreCliCommon.readSecureStore();

        const oidcServer = options.url;

        for (var ai = 0; ai < accounts.length; ai++) {
            let [user, ac1, ac2] = accounts[ai];
            console.log(`Trying to login ${user} using provided credentials...`);
            if (await this._testLogin(ac1, ac2, oidcServer)) {
                console.log("Login has been successful.");
                secureStoreCnt[user] = { ac1, ac2 };
                secureStoreCliCommon.writeSecureStore(secureStoreCnt);
                console.log(`Access code 1 and Access code 2 for user ${user} has been successfully stored into secure store.`);
            } else {
                console.error(`Cannot login to oidc.plus4u.net for ${user}. Probably invalid combination of Access Code 1 and Access Code 2.`);
            }
        }
    }

    async _testLogin(accessCode1, accessCode2, oidcServer) {
        if (accessCode1.length === 0 || accessCode2.length === 0) {
            throw `Access code cannot be empty.`;
        }
        let credentials = {
            accessCode1,
            accessCode2,
            grant_type: "password",
        };
        let tokenEndpointUrl = await this._getTokenEndpoint(oidcServer);
        let resp = await r2.post(tokenEndpointUrl, { json: credentials }).json;
        if (Object.keys(resp.uuAppErrorMap).length > 0) {
            return false;
        }
        return true;
    }

    async _getTokenEndpoint(oidcServer) {
        let oidcServerConfigUrl = (oidcServer || DEFAULT_OIDC_SERVER) + "/.well-known/openid-configuration";
        let oidcConfig = await r2.get(oidcServerConfigUrl).json;
        if (Object.keys(oidcConfig.uuAppErrorMap).length > 0) {
            throw `Cannot get configuration of OIDC server on ${oidcServer}. Probably invalid URL.`;
        }
        return oidcConfig.token_endpoint;
    }
}

module.exports = AddFileTask;
