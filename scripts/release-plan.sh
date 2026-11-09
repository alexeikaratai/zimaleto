#!/bin/sh
# Decides what the release jobs on main do, and prints it for $GITHUB_OUTPUT:
#   mode=version  changesets are pending, so the Version Packages PR needs opening or updating;
#   mode=stage    the merged version has no tag yet, so it gets staged on npm and then tagged;
#   mode=none     there is nothing to release.
# A tag marks a staged version, because npm doesn't list a version until the owner approves it.
set -eu

pending=$(find .changeset -name '*.md' ! -name README.md | head -n 1)

if [ -n "$pending" ]; then
    echo "mode=version"
    exit 0
fi

version=$(node -p 'require("./packages/zima/package.json").version')

# 0.0.0 is the version before the first release, which nothing should stage.
if [ "$version" = "0.0.0" ] || git rev-parse --quiet --verify "refs/tags/@zimaleto/zima@$version" > /dev/null; then
    echo "mode=none"
else
    echo "mode=stage"
fi
