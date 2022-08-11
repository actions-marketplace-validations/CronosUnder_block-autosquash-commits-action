const core = require("@actions/core");
const { getContext } = require("./github/context");
const { context, getOctokit } = require("@actions/github");
const github = require("@actions/github");
const { info, error } = require("@actions/core");

async function runAction() {
	const pull_request_number = context.issue.number;

	const repo = context.repo;
	const repoToken = core.getInput("github_token", { required: true });
	const messaje = core.getInput("messaje", { required: true });
	const envContext = getContext();

	core.startGroup(`Run action PR : ${pull_request_number} : ` + messaje);
	const octokit = getOctokit(repoToken);

	const commits = await octokit.paginate(
		"GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
		{
			...repo,
			pull_number: pull_request_number,
			per_page: 100
		}
	);
	core.info(
		`${commits.length} commit(s) in the pull request branch , check if constain: ${messaje}`);
	let branch = "";
	try {
		branch = process.env.GITHUB_REF.split("/").slice(2).join("/");
	} catch (e) {
		console.log("no branch");
	}
	const mensaje = messaje.replace("{actual-branch}", branch);
	let blockedCommits = 0;

	for (const {
		commit: { message },
		sha,
		url,
	} of commits) {
		const constainMessage = message.includes(mensaje);
		info(`${sha} ${message} ${constainMessage} ${mensaje}`);
		if (constainMessage) {
			error(`Commit ${sha} is an blocked commit: ${url}`);
			blockedCommits += 1;
			// await octokit.issues.createComment({
			await octokit.rest.issues.createComment({
				repo,
				issue_number: pull_request_number,
				body: `Commit ${sha} is an blocked commit: ${mensaje}`
			});
		}
	}

	core.info(
		`found ${blockedCommits} message(s) in the pull request branch ${branch}`
	);
	core.endGroup();
}

runAction().catch((error) => {
	core.debug(error.stack || "No error stack trace");
	core.setFailed(error.message);
});
