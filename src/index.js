// External dependencies
const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const jsYAML = require('js-yaml');
// const simpleGit = require('simple-git');
const { exec } = require('child_process');
// const { GitHub, getOctokitOptions } = require('@actions/github/lib/utils');

function assert(condition) {
	if (!condition) {
		throw new Error('Assertion failed...');
	}
}

async function run() {
	core.info('Clone repo');

	exec('find . -name dc-config.yml', (err, stdout, stderr) => {
		assert(!err);
		assert(!stderr);

		const dcConfigDirs = stdout.split('\n')
			.filter(filePath => filePath)
			.map(filePath => path.dirname(filePath));

		// Loop trough all themes
		for (const dir of dcConfigDirs) {
			let conf = {};

			try {
				conf = jsYAML.load(fs.readFileSync(path.join(dir, 'dc-config.yml'), 'utf8'));
			} catch (e) {
				throw new Error(`Error parsing dc-config.yml: ${e.message}`);
			}

			try {
				exec('npm install --quiet', { cwd: dir });
			} catch (e) {
				throw new Error(`Error running npm install: ${e.message}`);
			}

			try {
				exec(conf.build_command, { cwd: dir });
			} catch (e) {
				throw new Error(`Error running ${conf.build_command}: ${e.message}`);
			}
		}
	});
}

run();
