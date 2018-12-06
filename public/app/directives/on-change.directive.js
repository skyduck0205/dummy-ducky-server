(function () {
  'use strict';

  angular
    .module('dds')
    .directive('onChange', onChange);
  
  function onChange() {
    return {
      restrict: 'A',
      link: onChangeLink
    };
    
    function onChangeLink(scope, element, attrs) {
      const onChangeHandler = scope.$eval(attrs.onChange);
      element.on('change', onChangeHandler);
      element.on('$destroy', () => element.off());
    }
  }
})();
