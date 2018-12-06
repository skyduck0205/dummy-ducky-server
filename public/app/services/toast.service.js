(function () {
  'use strict';

  angular
    .module('dds')
    .factory('toastService', toastService);

  function toastService(ngToast) {
    const service = {
      create,
      success,
      error
    };
    return service;

    function create(option) {
      ngToast.create(option);
    }

    function success(content) {
      service.create({ content });
    }

    function error(content) {
      service.create({ 
        className: 'danger',
        content
      });
    }
  }
})();
