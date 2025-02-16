# kafkajs-client

## Updating Package Version

1. To change the version number in `package.json`, on the command line, in the package root directory, run the following command, replacing `<update_type>` with one of the semantic versioning release types (patch, major, or minor):

`npm version <update_type>`

2. Commit and push. Jenkins is configured to build and publish the package to npm on every push to the `main` branch.

3. Check your package page (`https://www.npmjs.com/package/@umerx/kafkajs-client`) to check that the package version has been updated.
