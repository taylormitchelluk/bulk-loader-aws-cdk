import {
  Stack,
  StackProps,
  aws_s3 as s3,
  aws_iam as iam,
  aws_sns as sns,
  aws_s3_notifications as s3n,
  aws_lambda as lambda,
  aws_sns_subscriptions as subscriptions,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export class BulkLoaderStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { SOURCE_IP } = process.env;

    /**
     * TODO: Validate SOURCE_IP
     */

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'BulkLoaderQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    /**
     * Frontend.
     * TODO: Do frontend last/later, can upload to s3 from cli for now.
     */

    /**
     * S3 data store bucket.
     * TODO: Add encryption to datastore bucket.
     */
    const dataStoreBucket = new s3.Bucket(this, 'DataStoreBucket', {
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    /**
     * TODO: Restrict put to Frontend.
     * TODO: Restrict get to sns (if required)
     */
    const dataStoreBucketPolicy = new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:PutObject',
      ],
      resources: [
        dataStoreBucket.arnForObjects('*'),
      ],
      principals: [
        new iam.AnyPrincipal()
      ],
    });
    /**
     * TEMP: Restrict to ip for testing.
     */
    dataStoreBucketPolicy.addCondition('IpAddress', {
      'aws:SourceIp': [SOURCE_IP],
    });

    /**
     * Validate Data Source Bucket Resource Policy.
     */
    const dataStoreBucketResourcePolicy = dataStoreBucket.addToResourcePolicy(dataStoreBucketPolicy);
    if (!dataStoreBucketResourcePolicy.statementAdded) {
      console.log(`Failed to add dataStoreBucketResourcePolicy to ${dataStoreBucket.bucketName}`);
    }

    /**
     * SNS
     */
    const dataSourceAddedNotification = new sns.Topic(this, 'DataSourceAdded');
    dataStoreBucket.addEventNotification(
        s3.EventType.OBJECT_CREATED,
        new s3n.SnsDestination(dataSourceAddedNotification),
    );

    /**
     * Lambda - Reader.
     * Reads csv/xls, validates, adds to queue.
     */
    const readerLambda = new lambda.Function(this, 'Reader', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'Reader'))
    });

    const readerLambdaSubscription = new subscriptions.LambdaSubscription(readerLambda)
    dataSourceAddedNotification.addSubscription(readerLambdaSubscription);

    /**
     * SQS
     * FIFO.
     */

    /**
     * Lambda - Sender.
     */
  }
}
