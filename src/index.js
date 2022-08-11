const { getInput, setFailed, info, error } = require("@actions/core");

const PullRequestChecker = require("./pullRequestChecker");

async function run() {
    try {
        const mesajeBlock = getInput("mesaje-block", { required: true });
        info(`START CHECK Mensaje block: ${mesajeBlock}`);
        await new PullRequestChecker(
            getInput("repo-token", { required: true }),
            mesajeBlock,
        ).process();
    } catch (errorCheck) {
        error(errorCheck);
        setFailed(errorCheck.message);
    }
}

run();
