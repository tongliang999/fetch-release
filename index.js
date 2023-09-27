const core = require("@actions/core");
const axios = require('axios')

try {
    const group = core.getInput("group");
    const repo = core.getInput("repo");
    const match = core.getInput("match");

    const api_url = `https://api.github.com/repos/${group}/${repo}/releases/latest`;
    const re = new RegExp(match);

    axios.get(api_url).then((res) => {
        for (let asset of res.data.assets) {
            if (re.test(asset.name)) {
                core.setOutput("download_link", asset.browser_download_url);
            }
        }
    });
} catch (error) {
    core.setFailed(error.message);
}