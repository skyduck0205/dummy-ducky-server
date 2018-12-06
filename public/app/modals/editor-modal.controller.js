(function () {
  'use strict';

  angular
    .module('dds')
    .controller('EditorModalController', EditorModalController);
  
  function EditorModalController($uibModalInstance, route, isEdit, METHODS, ddsService, toastService) {
    const vm = this;

    vm.isEdit = isEdit;
    vm.form = {
      path: '',
      method: 'GET',
      responses: []
    };
    vm.methodSelector = METHODS;
    vm.newResponseKey = '';
    vm.openedResponse = null;
    vm.init = init;
    vm.checkSubmitDisabled = checkSubmitDisabled
    vm.checkPathConflict = checkPathConflict;
    vm.checkResponseKeyConflict = checkResponseKeyConflict;
    vm.onMethodSelect = onMethodSelect;
    vm.onAddResponseClick = onAddResponseClick;
    vm.onKeyRemoveClick = onKeyRemoveClick;
    vm.onOkClick = onOkClick;
    vm.onCancelClick = onCancelClick;
    vm.onCreateSuccess = onCreateSuccess;
    vm.onCreateError = onCreateError;
    vm.onUpdateSuccess = onUpdateSuccess;
    vm.onUpdateError = onUpdateError;

    vm.init();

    function init() {
      if (route) {
        const cloned = _.cloneDeep(route);
        vm.form.path = cloned.path;
        vm.form.method = cloned.method;
        vm.form.responses = cloned.responses;
      }
    }

    function checkSubmitDisabled() {
      return !vm.form.path || vm.checkPathConflict();
    }

    function checkPathConflict() {
      const { path, method } = vm.form;
      return (
        // is new api or has modified its path/method
        (!vm.isEdit || path !== route.path || method !== route.method) &&
        // path, method conflict with current api
        _.get(ddsService.db.routes, [path, method])
      );
    }

    function checkResponseKeyConflict() {
      return vm.newResponseKey && _.find(vm.form.responses, { key: vm.newResponseKey });
    }

    function onMethodSelect(method) {
      vm.form.method = method;
    }

    function onAddResponseClick() {
      if (!vm.newResponseKey || vm.checkPathConflict()) {
        return;
      }
      vm.form.responses.push({
        key: vm.newResponseKey,
        value: {
          status: 200,
          body: 'Ok'
        },
        isOpened: true
      });
      vm.openedResponse = vm.newResponseKey;
      vm.newResponseKey = '';
    }

    function onKeyRemoveClick(e, index) {
      e.preventDefault();
      e.stopPropagation();
      vm.form.responses.splice(index, 1);
    }

    function onOkClick() {
      if (vm.checkSubmitDisabled()) {
        return;
      }

      const { path, method, responses } = vm.form;
      const responsesObject = _.reduce(
        responses,
        (result, response) => ({ ...result, [response.key]: response.value }),
        {}
      );
      if (vm.isEdit) { // update api
        // if path or method changed, remove old one and create a new api
        if (path !== route.path || method !== route.method) {
          ddsService.removeApi(route.path, route.method);
          ddsService.createApi(path, method, responsesObject)
            .then(vm.onUpdateSuccess, vm.onUpdateError);
        } else {
          ddsService.updateApi(path, method, responsesObject)
            .then(vm.onUpdateSuccess, vm.onUpdateError);
        }
      } else { // create api
        ddsService.createApi(path, method, responsesObject)
          .then(vm.onCreateSuccess, vm.onCreateError)
      }
    }

    function onCancelClick() {
      $uibModalInstance.dismiss();
    }

    function onCreateSuccess() {
      toastService.success('Create API successfully.');
      $uibModalInstance.close(vm.form);
    }

    function onCreateError(error) {
      const { status, data } = error;
      toastService.error(`Create API failed: [${status}] ${data}`);
    }

    function onUpdateSuccess() {
      toastService.success('Update API successfully.');
      $uibModalInstance.close(vm.form);
    }

    function onUpdateError(error) {
      const { status, data } = error;
      toastService.error(`Update API failed: [${status}] ${data}`);
    }
  }
})();
