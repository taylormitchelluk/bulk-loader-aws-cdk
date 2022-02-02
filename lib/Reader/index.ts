import {AWSError, S3} from 'aws-sdk';
import {GetObjectOutput} from "aws-sdk/clients/s3";

const s3 = new S3();

const read = async (event: any, context: any) => {
    console.dir({ event, context }, { depth: null });

    const message = event.Records[0].Sns.Message;
    const records = JSON.parse(message);
    const resource = records.Records[0].s3;

    const Bucket  = resource.bucket.name;
    const Key = resource.object.key;

    try {
        const data: GetObjectOutput = await s3.getObject({ Bucket, Key }).promise();
        console.log({ content: data.Body?.toString() })
    } catch (err) {
        console.log({ err, stack: err.stack })
    }
}

exports.read = read;