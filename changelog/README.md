# Semi automated changelog creation.

## Usage

~~~bash
node v1.1 v1.2 --out="temp/changelog.md" --tpl="template/md.hbs"
~~~

`out` and `tpl` parameters are optional. By default the result is
send to stdout in a json format.

Second tag name parameter is also optional.

### Result Object

~~~json
[
  {
    "hash": "commit hash",
    "subject": "commit message (first line)",
    "committer": "committer name",
    "tags": [
      "#Commit messages from the body that starts with a",
      "#",
      "#A special tag that is not exposed in the result is",
      "#changelog A given commit with this tag in the body will populate the changelog",
      "#others are ignored!",
      "#",
      "#A Tag is a whole word, have a minimum length of 3 chars",
      "#and made of those digits a-zA-Z0-9-_."
    ]
  }
]
~~~

### Commit convention

A commit to populate in changelog results.
~~~bash
Introduce semi automated changelog creator

#changelog
~~~

A changelog commit can have mutliple tags.
~~~bash
Fix a problem

#changelog #fix #TICKET-158
~~~


### Template Engine

We use [handlebars](http://handlebarsjs.com/) with a [helper set](https://github.com/helpers/handlebars-helpers).

The template will receive a changelog json including the commits, the startTag and endTag argument and all options.

~~~json
{
  "commits": ["see above"],
  "startTag": "v1.0",
  "endTag": "v1.1",
  "options": {
    "out": "tmp/changelog.md",
    "tpl": "template/md.hbs",
    "myKey": "myValue"
  }
}
~~~
