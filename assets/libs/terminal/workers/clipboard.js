;(function(){
  'use strict';

  window.TerminalClipboard = Worker(({ state, workers }) => {
    const self = {};

    return {
      copy({ from, to }) {
        if ( !from || !to ) return;

        const buffer = workers.input.get_buffer();
        const result = [];

        let fragment = [];

        if ( from.ry === to.ry ) {
          fragment = [];

          const row = buffer[ from.ry ];

          for ( let ix = from.rx; ix <= to.rx; ix++ ) {
            fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
          }

          result.push( fragment.join('') );
        } else {
          for ( let iy = from.ry; iy <= to.ry; iy++ ) {
            fragment = [];

            const row = buffer[ iy ];

            if ( !row ) continue;

            if ( iy === from.ry ) {
              for ( let ix = from.rx; ix < row.length; ix++ ) {
                fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
              }

              result.push( fragment.join('') );
              continue;
            }

            if ( iy === to.ry ) {
              for ( let ix = 0; ix <= to.rx && ix < row.length; ix++ ) {
                fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
              }

              result.push( fragment.join('') );
              continue;
            }

            for ( let ix = 0; ix < row.length; ix++ ) {
              fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
            }

            result.push( fragment.join('') );
          }
        }

        // todo: copy to inner clipboard

        console.log( result.join( '\n' ) );
      },
    };
  });

})();