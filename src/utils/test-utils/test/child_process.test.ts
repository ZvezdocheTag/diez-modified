import {cleanupMockCommandData, mockExec} from '../src/mocks/@diez/cli-core';

describe('child_process mock', () => {
  test('basic functionality', () => {
    expect(mockExec).toHaveBeenCalledTimes(0);
    mockExec('foobar');
    expect(mockExec).toHaveBeenCalledTimes(1);
    cleanupMockCommandData();
    expect(mockExec).toHaveBeenCalledTimes(0);
  });
});
