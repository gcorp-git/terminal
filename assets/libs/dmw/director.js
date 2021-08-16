;(function(){
  'use strict';

  /*
    const TestDirector = Director(( name ) => ({
      state: { name },
      workers: {
        test_manager: TestManager,
      },
      service: ({ state, workers }) => ({
        init: workers.test_manager.init,
      }),
    }));
  */
  window.Director = function( constructor ) {
    return function() {
      let { state, workers, service } = constructor( ...arguments );
      
      if ( state === undefined ) state = {};
      if ( !( state instanceof Object ) ) throw 'Incorrect state declaration';
      if ( workers === undefined ) workers = {};
      if ( !( workers instanceof Object ) ) throw 'Incorrect workers declaration';
      if ( typeof service !== 'function' ) throw 'Incorrect service declaration';

      const env = { state, workers: {} };

      for ( const name in workers ) {
        env.workers[ name ] = new workers[ name ]({ ...env });
      }

      return service( env );
    };
  };

})();