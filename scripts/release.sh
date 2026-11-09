#!/bin/sh
# The publish script that changesets/action runs on main once no changesets are left.
# It stages the new version on npm, where a maintainer approves it with 2FA, and then tags it.
# A version that already has its tag was staged before, so later runs on the same version stop early.
set -eu

version=$(node -p 'require("./packages/zima/package.json").version')

if git rev-parse --quiet --verify "refs/tags/@zimaleto/zima@$version" > /dev/null; then
    echo "Version $version is already staged and tagged."
    exit 0
fi

pnpm turbo run build --filter="./packages/*"
pnpm stage publish --recursive --no-git-checks
# Writes the new tags to CHANGESETS_OUTPUT, from which the action pushes them and creates GitHub releases.
pnpm changeset tag
