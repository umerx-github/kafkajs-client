# kafkajs-client

## Updating This Package

1. Commit changes to git.

2. In the project root directory, run `npm version <update_type>` to update the version number in `package.json`. Replace `<update_type>` with one of the semantic versioning release types (patch, minor, or major).

3. Push to GitHub. Jenkins is configured to build and publish the package to npm on every push to the `main` branch.

4. Check your package page (`https://www.npmjs.com/package/@umerx/kafkajs-client`) to check that the package version has been updated.
