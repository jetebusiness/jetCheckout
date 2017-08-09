(function ($) {
  module('jQuery.jetRoute');

  test('is jetRoute', function () {
    expect(2);
    strictEqual($.jetRoute(), 'jetRoute.', 'should be jetRoute');
    strictEqual($.jetRoute({punctuation: '!'}), 'jetRoute!', 'should be thoroughly jetRoute');
  });
  
}(jQuery));
