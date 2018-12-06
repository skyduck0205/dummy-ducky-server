(function () {
  'use strict';

  angular
    .module('dds', [
      'ngAnimate',
      'ui.router',
      'ui.bootstrap',
      'ngToast',
      'ng.jsoneditor'
    ])
    .constant('METHODS', ['GET', 'POST', 'PUT', 'DELETE'])
    .config(routeConfig)
    .config(toastConfig)
    .config(httpConfig)
    .run(injectRoot);

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'app/app.html'
      })
      .state('app.list', {
        url: '',
        templateUrl: 'app/list/list.html',
        controller: 'ListController',
        controllerAs: 'vm'
      });
  }

  function toastConfig(ngToastProvider) {
    ngToastProvider.configure({
      animation: 'fade',
      timeout: 3000,
      horizontalPosition: 'left'
    });
  }

  function httpConfig($httpProvider) {
    $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
  }

  function injectRoot($rootScope) {
    $rootScope._ = window._;
  }
})();
