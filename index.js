const core = require("@actions/core");
const axios = require("axios");
const sleep = require("sleep");

try {
    const group = core.getInput("group");
    const repo = core.getInput("repo");
    const tag = core.getInput("tag");
    const match = core.getInput("match");

    const api_url = tag === '' ? `https://api.github.com/repos/${group}/${repo}/releases/latest`
                               : `https://api.github.com/repos/${group}/${repo}/releases/tags/${tag}`;
    const re = new RegExp(match);

    let getReply = false;
    for (let i = 0; i < 5 && !getReply; i++) {
        try {
            axios.get(api_url).then((res) => {
                getReply = true;
                const release = res.data;
                for (let asset of release.assets) {
                    console.log(`checking ${asset.name}\n`);
                    if (re.test(asset.name)) {
                        core.setOutput("download-link", asset.browser_download_url);
                        core.setOutput("release-tag", release.tag);
                        console.log(`Found matched release download link: ${asset.browser_download_url}`);
                        return;
                    }
                }
                core.setFailed(`no matching release (re = ${match})`);
            });
        } catch (err) {
            console.log("Retry after 5s\n");
            sleep.sleep(5);
        }
    }
} catch (error) {
    core.setFailed(error.message);
}
