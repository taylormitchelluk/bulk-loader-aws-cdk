import { S3 } from 'aws-sdk';
import { GetObjectOutput } from "aws-sdk/clients/s3";

const filterObjectParams = (event: any) => {
    const message = event.Records[0].Sns.Message;
    const records = JSON.parse(message);
    const resource = records.Records[0].s3;

    const Bucket = resource.bucket.name;
    const Key = resource.object.key;

    return {
        Bucket,
        Key
    }
}

const rowBuilder = (headerRow: string) => {
    const headers = headerRow.split(',').map(header => header.trim());
    return (row: string): object => {
        const parts = row.split(',').map(part => part.trim());
        const entries = headers.map((header: string, idx: number) => [ header, parts[idx] ]);

        // @ts-ignore
        return Object.fromEntries(entries)
    }
}

const parseCsv = (raw: any) => {
    const content = raw.toString();

    const [ headerRow, ...rows ] = content.split('\n');
    const buildRow = rowBuilder(headerRow);

    return rows.map(buildRow);
}

const reader = (s3: S3) => async (event: any, context: any) => {
    const { Bucket, Key } = filterObjectParams(event)

    try {
        const objectOutput: GetObjectOutput = await s3.getObject({ Bucket, Key }).promise();
        const data = parseCsv(objectOutput.Body);

        console.log({ data });
    } catch (err) {
        console.log({ err, stack: err.stack })
    }
}

exports.read = reader(new S3())