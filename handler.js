'use strict';

const AWS = require('aws-sdk');

exports.publishRsvp = (event, context) => {
  const sns = new AWS.SNS();

  event.Records.forEach(async (record) => {
    console.log('Stream record received: ', JSON.stringify(record, null, 2));

    if (record.eventName === 'INSERT') {
      try {
        const attending = record.dynamodb.NewImage.attending.S;
        const who = record.dynamodb.NewImage.name.S;
        const people = record.dynamodb.NewImage.people.S;
        const song = record.dynamodb.NewImage.song.S;
        const diet = record.dynamodb.NewImage.diet.S;

        const params = {
          Subject: `A new RSVP from ${who}`,
          Message: `${who} is ${
            attending === 'no'
              ? 'not coming'
              : `coming\nWith: ${people}\nSong choice: ${song}\nDietary Requirements: ${diet}`
          }`,
          TopicArn: 'arn:aws:sns:eu-west-1:787958983120:rsvpTopic',
        };

        await sns.publish(params, (err, data) => {
          if (err) {
            console.error(
              'Unable to send message. Error JSON:',
              JSON.stringify(err, null, 2)
            );
          } else {
            console.log(
              'Results from sending message: ',
              JSON.stringify(data, null, 2)
            );
          }
        });

        console.log(`Successfully processed ${event.Records.length} records.`);
        return;
      } catch (e) {
        console.error('Failed to process rsvp: ', e);
      }
    }
    return console.error(
      'Event type must be INSERT to be processed by this SNS handler'
    );
  });
};
