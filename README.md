# GemeenteNijmegen projen project type
This repository contains an NPM package that can be used to create a new Projen AWS CDK App project.

The project type `GemeenteNijmegenCdkApp` provides a number of default configurations and provides features used within our organization. There are:
- Comments with CloudFormation template diffs on PRs
- Cfn-lint Github wrokflow
- Defautl configuration values

## Github secrets
This project type relies on Github secrets to be set in order for all its Github workflows to work.
| Environment variable | Explanation                                                                            |
|----------------------|----------------------------------------------------------------------------------------|
| GITHUB_PROJEN_TOKEN  | [Projen Github personal access token](https://projen.io/github.html#github-api-access) |
| SLACK_WEBHOOK_URL    | This is the url used for the emergency workflow to publish to slack                    |


## Using this project type

### For new projects
```bash
npx projen new --from @gemeentenijmegen/projen-project-type {type}
```
The following project types can be used:
- `cdk-app` standard CDK project
- `cdk-lib` standard CDK construct library (published to NPM by default)
- `jsii-lib` a JSII application (published to NPM by default)
- `ts-lib` a typescript project (published to NPM by default)

Adding sample files to a cdk-app can be done with
``` bash
npx projen new --from @gemeentenijmegen/projen-project-type cdk-app --makeSampleFiles
```

### For existing projects
For instructions on how to start using the project type in existing projects there is the [setup guide](./SETUP.md). 
Note: for switching back to the awscdk-app-ts projen project type also see the [setup guide](./SETUP.md).


## Properties overview
There are a number of relevant properties that are provided by projen
| Property             | Default      | Explanation                                                               |
|----------------------|--------------|---------------------------------------------------------------------------|
| cdkVersion           | '2.1.0'      | Minimum version of the cdk to use (upgraded using projen upgrade task)    |
| defaultReleaseBranch | 'main'       | Should be set to acceptance                                               |
| name                 | project name | Sets the project name                                                     |
| gitignore            |              | A number of default ignored files are set specific to our projects        |
| scripts              |              | The cfn-lint script is added to the list of scripts configured            |
| license              | EUPL-1.2     | The defult license used by us                                             |
| depsUpgradeOptions   |              | Upgrade workflow configuration (branch: `acceptance`, labels: `cfn-diff`) |


The project type in this npm package provides some additional configuration options:
| Property                    | Default | Explanation                                                                 |
|-----------------------------|---------|-----------------------------------------------------------------------------|
| enableCfnLintOnGithub       | true    | Enable step in the Github build workflow that runs cfn-lint                 |
| enableEmergencyProcedure    | true    | Adds the emergency procedure workflow to Github workflows                   |
| enableAutoMergeDependencies | true    | Adds the auto-merge workflow for PR's to acceptance (from upgrade workflow) |


## Upgrade dependencies
De upgrade dependencies task en Github workflow zijn standaard enabled. Deze task zal de laatste versies van de dependencies zoeken (volgens [semantic versionioning](https://semver.org/lang/nl/)) en upgraden in de `package.json`. 

Dit project type zet de default branch voor het uitvoeren van de workflow op `acceptance`.
De Github workflow voert de upgrade dependencies taak uit en maakt een PR naar `acceptance` en geeft het PR een label `cfn-diff` en `auto-merge`.

### Automerge workflow
De automerge workflow gaat af als een PR `acceptance` als base heeft en het label `auto-merge` heeft. Deze probeert het PR te mergen met de auto-merge
feature van Github. Hiervoor moet in het Github-project automerge aan staan. **NB**: Zorg dat branch protection aan staat voor acceptance, met de eis dat aan
alle voorwaarden voldaan is. Anders kan de auto-merge worden uitgevoerd voordat de build succesvol is.

### CDK upgrade
De upgrade dependencies taak in projen is inclusief de CDK versie. Hiervoor wordt de minimum versie in de `.projenrc.js` van een project ingesteeld. 

Dit betekent dat:
- Wanneer `cdkVersion: '2.1.0` gebruikt wordt in de `.projenrc.js` dit in de `package.json` wordt geimporteerd als `"aws-cdk-lib": "^2.1.0"`
- Wanneer de upgrade dependencies taak draait de `package.json` wordt geupdate naar bijv: `"aws-cdk-lib": "^2.31.0"`
- Semantic versioning zorgt er voor dat er nooit een major upgrade wordt gedaan omdat deze braking changes kan hebben.

### Projen upgrade
De projen versie wordt ook geupgrade in de upgrade dependencies task.


## Local testing
One can locally test project creation using this package by running
``` bash
# Run the extract command on this project
cd /path/to/the/package/modules-projen && npx projen extact

# Create a new test project
mkdir test-project
cd test-project
npx projen new --from file://path/to/the/package/modules-projen/dist/js/package cdk-app
```