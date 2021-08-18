;(function(){
  'use strict';

  window.TerminalScreenCoords = Worker(({ state, workers }) => {
    const self = {
      real: [],
    };

    return {
      update_real_coords( buffer, config ) {
        const sw = state.width;
        const sh = state.height;

        let current = 0;

        self.real = [];

        for ( let i = 0, len = buffer.length; i < len; i++ ) {
          const rowLength = buffer[ i ] ? buffer[ i ].length : 0;

          self.real[ current ] = [ 0, i ];

          current += 1;

          if ( config.wrap ) {
            for ( let j = sw; j <= rowLength; j += sw ) {
              self.real[ current ] = [ j, i ];
              current += 1;
            }
          }
        }
      },
      has_real_row( sy ) {
        return !!self.real[ sy ];
      },
      get_real_coords( sx, sy ) {
        const osx = workers.camera.ox + sx;
        const osy = workers.camera.oy + sy;

        const real = self.real[ osy ];

        const rx = real ? real[ 0 ] + osx : ( sx > 0 ? Infinity : -Infinity );
        const ry = real ? real[ 1 ] : ( sy > 0 ? Infinity : -Infinity );

        return { rx, ry };
      },
    };
  });

})();