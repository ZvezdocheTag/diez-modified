import {UnauthorizedRequestException} from '@diez/cli-core';
import {performGetRequest} from '../src/utils.network';

jest.mock('request', () => (_: never, callback: any) => {
  callback(true, {statusCode: 403});
});

describe('request.unauthorized', () => {
  test('failure', async () => {
    await expect(performGetRequest<never>('')).rejects.toThrowError(UnauthorizedRequestException);
  });
});
