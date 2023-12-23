import { Git, PushData } from "node-git-server";
import { join } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port =
    !process.env.PORT || Number.isNaN(process.env.PORT)
        ? 7005
        : parseInt(process.env.PORT);

const repos = new Git(join(__dirname, "./repo"), {
    autoCreate: true,
    authenticate(options, callback) {
        // console.log(
        //     {
        //         type: options.type,
        //         repo: options.repo,
        //         user: await options.user(),
        //     },
        //     { depth: null }
        // );
        options.user().then(([username, password]) => {
            console.log({
                type: options.type,
                repo: options.repo,
                username,
                password,
            });
            callback();
        });
    },
});

repos.on("push", async (push) => {
    console.log(`push ${push.repo}/${push.commit} ( ${push.branch} )`);

    push.log();
    push.log("Hey!");
    push.log("Checkout these other repos:");
    for (const repo of await repos.list()) {
        push.log(`- ${repo}`);
    }
    push.log();
    push.accept();
});

repos.on("fetch", (fetch) => {
    console.log(`fetch ${fetch.commit}`);
    fetch.accept();
});

repos.listen(port, { type: "http" }, () => {
    console.log(`node-git-server running at http://localhost:${port}`);
});
