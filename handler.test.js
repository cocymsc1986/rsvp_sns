const AWS = require('aws-sdk-mock');
const { objectContaining } = require('expect');

const handler = require('./handler.js');

describe('handler', () => {
  it('should call sns.publish with payload', () => {
    const mockSNSCall = jest.fn();
    const mockCallback = jest.fn();
    AWS.mock('SNS', 'publish', mockSNSCall);
    const mockEvent = {
      Records: [
        {
          eventName: 'INSERT',
          dynamodb: {
            NewImage: {
              name: { S: 'testName' },
              people: { S: 'testPeople' },
              song: { S: 'testSong' },
              diet: { S: 'testDiet' },
            },
          },
        },
      ],
    };

    handler.publishRsvp(mockEvent);

    expect(mockSNSCall).toHaveBeenCalled();
    expect(mockSNSCall.mock.calls[0][0]).toEqual({
      Message:
        '"testName" rsvp\'d\nComing with: "testPeople"\nSong choice: "testSong"\nDietary Requirements: "testDiet"',
      Subject: 'A new RSVP from "testName"',
      TopicArn: 'arn:aws:sns:eu-west-1:787958983120:rsvpTopic',
    });
  });

  it('should not call sns.publish with payload if not of type INSERT', () => {
    const mockSNSCall = jest.fn();
    const mockCallback = jest.fn();
    AWS.mock('SNS', 'publish', mockSNSCall);
    const mockEvent = {
      Records: [
        {
          eventName: 'SOMETHING-ELSE',
          dynamodb: {
            NewImage: {
              name: { S: 'testName' },
              people: { S: 'testPeople' },
              song: { S: 'testSong' },
              diet: { S: 'testDiet' },
            },
          },
        },
      ],
    };

    handler.publishRsvp(mockEvent);

    expect(mockSNSCall).not.toHaveBeenCalled();
  });
});
