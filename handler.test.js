const AWS = require('aws-sdk-mock');

const handler = require('./handler.js');

describe('handler', () => {
  afterEach(() => {
    AWS.restore('SNS', 'publish');
  });

  it('should call sns.publish with payload for yes response', () => {
    const mockSNSCall = jest.fn();

    AWS.mock('SNS', 'publish', mockSNSCall);
    const mockEvent = {
      Records: [
        {
          eventName: 'INSERT',
          dynamodb: {
            NewImage: {
              attending: { S: 'yes' },
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
        'testName is coming\nWith: testPeople\nSong choice: testSong\nDietary Requirements: testDiet',
      Subject: 'A new RSVP from testName',
      TopicArn: 'arn:aws:sns:eu-west-1:787958983120:rsvpTopic',
    });
  });

  it('should call sns.publish with payload for yes response', () => {
    const mockSNSCall = jest.fn();

    AWS.mock('SNS', 'publish', mockSNSCall);
    const mockEvent = {
      Records: [
        {
          eventName: 'INSERT',
          dynamodb: {
            NewImage: {
              attending: { S: 'no' },
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
      Message: 'testName is not coming',
      Subject: 'A new RSVP from testName',
      TopicArn: 'arn:aws:sns:eu-west-1:787958983120:rsvpTopic',
    });
  });

  it('should not call sns.publish with payload if not of type INSERT', () => {
    const mockSNSCall = jest.fn();

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
