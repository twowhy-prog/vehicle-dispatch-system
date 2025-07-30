const fs = require('fs');
const path = require('path');

describe('Utility functions', () => {
  beforeAll(() => {
    // Load scripts to define functions in global scope
    require(path.join('..', 'script.js'));
    require(path.join('..', 'user-script.js'));
  });

  test('getStatusText returns Korean status', () => {
    expect(getStatusText('inprogress')).toBe('진행 중');
  });

  test('getPriorityClass returns class name', () => {
    expect(getPriorityClass('긴급')).toBe('medium');
  });
});
