;(function(){
  'use strict';

  /*
    const TestWorker = Worker(({ state, workers }) => ({
      state: { done: false },
      service: ({ state, workers }) => ({
        init() {
          console.log(`name: ${state.name}, age: ${state.age}`);
          state.done = true;
        },
      }),
    }));
  */
  window.Worker = function( constructor ) {
    return function( env ) {
      let { state, service } = constructor( env );
      
      if ( state === undefined ) state = {};
      if ( !( state instanceof Object ) ) throw 'Incorrect state declaration';
      if ( typeof service !== 'function' ) throw 'Incorrect service declaration';

      for ( const key in state ) {
        env.state[ key ] = state[ key ];
      }

      return service( env );
    };
  };

})();