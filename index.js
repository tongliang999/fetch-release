const core = require("@actions/core");
const axios = require("axios");

function sleep(s) {
    return new Promise((resolve, _reject) => {
        setTimeout(() => {
            resolve();
        }, s * 1000);
    });
}

async function fetch_release() {
    const group = core.getInput("group");
    const repo = core.getInput("repo");
    const tag = core.getInput("tag");
    const match = core.getInput("match");

    const api_url = tag === '' ? `https://api.github.com/repos/${group}/${repo}/releases/latest`
        : `https://api.github.com/repos/${group}/${repo}/releases/tags/${tag}`;
    const re = new RegExp(match);

    for (let i = 0; i < 10; i++) {
        try {
            let res = await axios.get(api_url);
            const release = res.data;
            for (let asset of release.assets) {
                console.log(`checking ${asset.name}\n`);
                if (re.test(asset.name)) {
                    core.setOutput("download-link", asset.browser_download_url);
                    core.setOutput("release-tag", release.tag_name);
                    console.log(`Found matched release(${release.tag_name}) download link: ${asset.browser_download_url}`);
                    return;
                }
            }
            core.setFailed(`no matching release (re = ${match})`);
        } catch (err) {
            console.log("Retry after 10s\n");
            await sleep(10);
        }
    }
    core.setFailed("Failed to get release info after 10 retries.");
}

(async () => {
    try {
        await fetch_release();
    } catch (error) {
        core.setFailed(error.message);
    }
})();
