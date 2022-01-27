# Bulk Loader

Purpose: Queue large csv/xls data files and trickle data to destination.

Will load csv/xls to s3, notify, read, validate, push to queue, and push to destination.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
 
### Required.

Set source ip.

```zsh

export SOURCE_IP="..."

```

### Architecture - Basic.

fe -> s3 -> sns -> lambda -> sqs -> lambda -> // -> destination.

capture csv/xls -> store -> notify -> read lines, push onto queue -> queue -> pop from queue, send to dest

### Architecture - Extended.

Possibly add 'Progress' to from 'Pop/Sender' to Frontend.
