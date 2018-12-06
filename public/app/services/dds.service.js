(function () {
  'use strict';

  angular
    .module('dds')
    .factory('ddsService', ddsService);

  function ddsService($http) {
    const service = {
      db: null,
      getConfig,
      updateConfig,
      createApi,
      updateApi,
      removeApi,
      updateResponseKey,
      updateDisabled
    };
    return window.dds = service;

    function getConfig() {
      return $http.get('/_dds')
        .then(response => service.db = response.data);
    }

    function updateConfig(config) {
      return $http.put('/_dds', config)
        .then(() => service.db = config);
    }

    function createApi(path, method, responses) {
      const data = { path, method, responses };
      return $http.post('/_dds/api', data);
    }

    function updateApi(path, method, responses) {
      const data = { path, method, responses };
      return $http.put('/_dds/api', data);
    }

    function removeApi(path, method) {
      const data = { path, method };
      return $http.delete('/_dds/api', { data });
    }

    function updateResponseKey(path, method, key) {
      const data = { path, method, key };
      return $http.put('/_dds/api/current', data);
    }

    function updateDisabled(path, method, disabled) {
      const data = { path, method, disabled };
      return $http.put('/_dds/api/disabled', data);
    }
  }
})();
