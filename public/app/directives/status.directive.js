(function () {
  'use strict';

  angular
    .module('dds')
    .directive('ddsStatus', ddsStatus);
  
  function ddsStatus() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        status: '='
      },
      template: ddsStatusTemplate,
      link: ddsStatusLink
    };
    
    function ddsStatusTemplate() {
      return (
        '<span ng-class="getTheme()">[{{status}}]</span>'
      );
    }

    function ddsStatusLink(scope) {
      scope.themes = {
        1: 'text-info',
        2: 'text-success',
        3: 'text-warning',
        4: 'text-danger',
        5: 'text-danger'
      };
      scope.getTheme = getTheme;

      function getTheme() {
        return scope.themes[Math.floor(scope.status / 100)] || '';
      }
    }
  }
})();
