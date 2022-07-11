# Setup projen in existing project
How to install this custom projen project type in an existing cdk app project.

## 1. Install this package
1. Include dependency to '@gemeentenijmegen/modules-projen' in `.projenrc.js` deps.
2. Import project: 
    - `const { GemeenteNijmegenCdkApp } = require('@gemeentenijmegen/modules-projen');`
3. Change project to GemeenteNijmegenCdkApp: 
    - `const project = new GemeenteNijmegenCdkApp({`

## 2. Clean up
The folowing is now set by the project type, so it can be removed from the `.projenrc.js`:
- depsUpgradeOptions, set to acceptance branch by default. (Note: if you want to change this you'll override depsUpgradeOptions in full and all of its suboptions)
- Release property (managed by projen, default true)
- License propetty (default: EUPL-1.2)
- projenVersion property, this will be upgraded by the projen upgrade dependenceis workfow. So no need to pin it in the configuration.
- gitignore property (now set by default in project type)
- workflowBootstapSteps (setup cfn-lint, now handled by project type)
- postBuiltSteps (save cf templates, now handled by project type)

The folowing may be present in some project and is now set by the project type, so it can be removed from the `.projenrc.js`:
- Cfn-lint script (other scripts can stay in place)
- Github CloudFormation diff workflow

## 3. Configure
The following properties must be set in the `.projenrc.js`:
- cdkVersion property - This is the minimum cdk version so that it can be upgrades in the upgrade dependency projen task.

The following properties can be set in the `.projenrc.js` ([see readme for more details](./README.md)):
- enableEmergencyProcedure, default true.
- enableCfnLintOnGithub, default true.
- enableCfnDiffworkflow, default false.
 





# Switching back to the awscdk typescript app project type
1. Import: `const { awscdk } = require('projen');`
2. Set project type correctly: `const project = awscdk.AwsCdkTypeScriptApp({`
3. Remove gemeente nijmegen import
4. Remove @gemeentenijmegen/modules-projen configuration options
4. Remove dependency to @gemeentenijmegen/modules-projen
5. Add desired defaults and configuration manually (gitignore, release config, emergency workflow, scripts, postbuild steps, etc.)