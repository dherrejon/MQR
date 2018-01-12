app.directive('mensajeEmail',mensajeEmail);

  mensajeEmail.$inject=['$compile','$timeout','$rootScope'];

  function mensajeEmail( $compile, $timeout, $rootScope ) {

    return {
      restrict: 'A',
      scope:{
        mensajeEmail:'=',
        id:'='
    },
      link: function (scope, elem, attrs) {
        scope.$watch('id', function (valor_actual, valor_anterior) {
          $timeout(function () {
            try {
              var cuerpo = angular.element(elem[0].contentDocument.body);
              var encabezado = angular.element(elem[0].contentDocument.head);
              var contenido = $compile('<div id=\"wrapper_msj\" style=\"padding:15px;\">'+scope.mensajeEmail+'</div>')(scope);
              // console.log(attrs);

              encabezado.empty();
              encabezado.append('<base target=\"_blank\" />');
              cuerpo.empty();
              cuerpo.append(contenido);
              scope.$apply();
            } catch (e) {

            }
          },0);
        });
      }
    };

  }
