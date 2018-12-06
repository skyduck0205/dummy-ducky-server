(function () {
  'use strict';

  angular
    .module('dds')
    .controller('RemoveModalController', RemoveModalController);
  
  function RemoveModalController($uibModalInstance, route, ddsService, toastService) {
    const vm = this;

    vm.route = route;
    vm.onOkClick = onOkClick;
    vm.onCancelClick = onCancelClick;
    vm.onRemoveSuccess = onRemoveSuccess;
    vm.onRemoveError = onRemoveError;

    function onOkClick() {
      const { path, method } = vm.route;
      ddsService.removeApi(path, method)
        .then(vm.onRemoveSuccess, vm.onRemoveError);
    }

    function onCancelClick() {
      $uibModalInstance.dismiss();
    }

    function onRemoveSuccess() {
      const { path, method } = vm.route;
      toastService.success(`Good bye, ${method} ${path}`);
      $uibModalInstance.close();
    }

    function onRemoveError(error) {
      const { status, data } = error;
      toastService.error(`Remove API failed: [${status}] ${data}`);
    }
  }
})();
