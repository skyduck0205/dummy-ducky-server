(function () {
  'use strict';

  angular
    .module('dds')
    .controller('ListController', ListController);
  
  function ListController(ddsService, $uibModal, toastService) {
    const vm = this;
    let newRoute = {};

    vm.routes = [];
    vm.init = init;
    vm.fetchDbConfig = fetchDbConfig;
    vm.onExportClick = onExportClick;
    vm.onImportClick = onImportClick;
    vm.onResponseSelect = onResponseSelect;
    vm.onApiEditClick = onApiEditClick;
    vm.onApiDisableClick = onApiDisableClick;
    vm.onApiRemoveClick = onApiRemoveClick;
    vm.onFetchConfigSuccess = onFetchConfigSuccess;
    vm.onImportSuccess = onImportSuccess;
    vm.onImportError = onImportError;
    vm.onEditorClose = onEditorClose;
    vm.onResponseUpdateSuccess = onResponseUpdateSuccess;
    vm.onResponseUpdateError = onResponseUpdateError;
    vm.onApiDisableSuccess = onApiDisableSuccess;
    vm.onApiDisableError = onApiDisableError;

    vm.init();

    function init() {
      vm.fetchDbConfig();
    }

    function fetchDbConfig() {
      ddsService.getConfig()
        .then(vm.onFetchConfigSuccess);
    }

    function onExportClick() {
      var dataString = `data:text/json;charset=utf-8,${JSON.stringify(ddsService.db)}`;
      const a = document.createElement('a');
      a.setAttribute('href', dataString);
      a.setAttribute('download', 'db.json');
      a.click();
    }

    function onImportClick() {
      const input = document.createElement('input');
      const reader = new FileReader();
      input.setAttribute('type', 'file');
      input.setAttribute('accept', '.json');
      input.click();
      input.onchange = (e) => {
        const file = input.files[0];
        if (file.type !== 'application/json') {
          toastService.error('Should import a JSON file.');
          return;
        }
        reader.readAsText(file)
      }
      reader.onload = (e) => {
        const result = e.target.result;
        try {
          const config = JSON.parse(result);
          ddsService.updateConfig(config)
            .then(vm.onImportSuccess, vm.onImportError);
        } catch (error) {
          toastService.error('JSON parsing failed.');
        }
      }
    }

    function onResponseSelect(route, response) {
      route.currentResponse = response;
      ddsService.updateResponseKey(route.path, route.method, response.key)
        .then(vm.onResponseUpdateSuccess, vm.onResponseUpdateError);
    }

    function onApiEditClick(route, isEdit) {
      const modal = $uibModal.open({
        size: 'lg',
        templateUrl: 'app/modals/editor-modal.html',
        controller: 'EditorModalController',
        controllerAs: 'vm',
        resolve: {
          route: () => route,
          isEdit: () => isEdit
        }
      });
      modal.result.then(vm.onEditorClose, _.noop);
    }

    function onApiDisableClick(route) {
      route.disabled = !route.disabled;
      ddsService.updateDisabled(route.path, route.method, route.disabled)
        .then(vm.onApiDisableSuccess, vm.onApiDisableError);
    }

    function onApiRemoveClick(route) {
      const modal = $uibModal.open({
        templateUrl: 'app/modals/remove-modal.html',
        controller: 'RemoveModalController',
        controllerAs: 'vm',
        resolve: {
          route: () => route
        }
      });
      modal.result.then(vm.fetchDbConfig, _.noop);
    }

    function onFetchConfigSuccess() {
      vm.routes = [];

      // parse db
      _.forIn(ddsService.db.routes, (routeConfig, path) => {
        _.forIn(routeConfig, (responseConfig, method) => {
          const { disabled, current, responses = {} } =  responseConfig;
          const currentResponse = {
            key: current,
            value: responses[current]
          };
          // transform responses object to array
          const responseArray = _.transform(
            responses,
            (result, value, key) => result.push({ value, key }), 
            []
          );
          vm.routes.push({
            isNew: newRoute.path === path && newRoute.method === method,
            currentResponse,
            disabled,
            path,
            method,
            responses: responseArray
          });
        })
      });
    }

    function onImportSuccess() {
      toastService.success('Import config successfully.');
      vm.onFetchConfigSuccess();
    }

    function onImportError(error) {
      const { status, data } = error;
      toastService.error(`Import config failed: [${status}] ${data}`);
    }

    function onEditorClose(route) {
      newRoute = route;
      vm.fetchDbConfig();
    }

    function onResponseUpdateSuccess() {
      toastService.success('Update response key successfully.');
    }

    function onResponseUpdateError(error) {
      const { status, data } = error;
      toastService.error(`Update response key failed: [${status}] ${data}`);
    }

    function onApiDisableSuccess() {
      toastService.success('Update API visibility successfully.');
    }

    function onApiDisableError(error) {
      const { status, data } = error;
      toastService.error(`Update API visibility failed: [${status}] ${data}`);
    }
  }
})();
