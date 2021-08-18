;(function(){
  'use strict';

  window.Director = constructor => ( ...args ) => {
    let { state = {}, workers = {}, managers, service } = constructor( ...args );
    const env = { state, workers: {} };

    for ( const name in workers ) {
      env.workers[ name ] = workers[ name ]({ ...env });
    }

    if ( managers !== undefined ) {
      const _workers = managers({ ...env });

      for ( const name in _workers ) {
        env.workers[ name ] = _workers[ name ];
      }
    }
    
    return service( env );
  };

  window.Worker = constructor => env => {
    return constructor( env );
  };

})();