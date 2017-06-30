#!/usr/bin/env node

/**
 * Build a changelog json from marked commits in git tag TimeRanges
 * and apply data to a given template
 */

/* eslint quotes:0 no-param-reassign:0 */

const fs = require('fs');
const fse = require('fs-extra');
const exec = require('child_process').exec;
const path = require('path');
const handlebars = require('handlebars');
require('handlebars-helpers')({ handlebars });

const createCommitJson = (startTag, endTag, options) => {
  const formatCommitJson = (commits, template) => {
    if (!template) return JSON.stringify(commits, null, '  ');

    const tpl = handlebars.compile(fs.readFileSync(path.resolve('./', template), { encoding: 'utf8' }));
    return tpl({ commits, startTag, endTag });
  };

  const command = [
    endTag ? `git log ${startTag}...${endTag}` : `git log ${startTag}`,
    `--pretty=format:',{ "hash":"%H", "committer":"%cn", "subject":"%s", "body":"%b" }'`,
    `--reverse --grep "#changelog"`
  ].join(' ');

  exec(command, (err, stdout) => {
    if (err) {
      throw err;
    }

    let commits = null;
    const tagFinder = /#\b[a-zA-Z0-9-_.]{3,}\b/g;

    try {
      commits = JSON.parse(`[${stdout.substr(1)}]`.replace(/\n/g, ''));
    } catch (e) {
      throw new Error(`
        Can not convert the changelog commits to a valid json!
        You may have double quotes in your commit subject or body.
      `);
    }

    commits.forEach((commit) => {
      commit.tags = (commit.body.match(tagFinder) || [])
        .filter(tag => tag !== '#changelog')
        .map(tag => tag.substr(1));
      delete commit.body;
    });

    const changelog = formatCommitJson(commits, options.tpl);
    if (!options.out) console.log(changelog);
    else fse.outputFileSync(path.resolve('./', options.out), changelog, { encoding: 'utf8' });
  });
};

const param = ['startTag', 'endTag'];
const args = process.argv.slice(2).reduce((result, arg, index) => {
  if (arg.indexOf('--') === 0) {
    arg = arg.substr(2).split('=');
    result.options[arg[0].trim()] = arg[1].trim();
    return result;
  }

  result[param[index]] = arg;
  return result;
}, { options: {} });

if (!args.startTag) {
  throw new Error(`
    Mandatory arguments missing!
    Usage: 'node bin/changelog.js <startTag> [<endTag> --out=<dir/filename> --tpl=<path-to-template]>'
  `);
}

createCommitJson(args.startTag, args.endTag, args.options);
