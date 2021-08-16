;(function(){
  'use strict';

  /*
    const TestManager = Manager(({ state, workers }) => ({
      state: { age: 30 },
      workers: {
        test_worker: TestWorker,
      },
      service: ({ state, workers }) => ({
        init() {
          workers.test_worker.init();
        },
      }),
    }));
  */
  window.Manager = function( constructor ) {
    return function( env ) {
      let { state, workers, service } = constructor( env );
      
      if ( state === undefined ) state = {};
      if ( !( state instanceof Object ) ) throw 'Incorrect state declaration';
      if ( workers === undefined ) workers = {};
      if ( !( workers instanceof Object ) ) throw 'Incorrect workers declaration';
      if ( typeof service !== 'function' ) throw 'Incorrect service declaration';

      for ( const key in state ) {
        env.state[ key ] = state[ key ];
      }

      for ( const name in workers ) {
        env.workers[ name ] = new workers[ name ]({ ...env });
      }

      return service( env );
    };
  };

})();