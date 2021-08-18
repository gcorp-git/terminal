;(function(){
  'use strict';

  window.TerminalScreenCamera = Worker(({ state, workers }) => {
    const self = {
      config: undefined,
      offset: {
        sx: 0,
        sy: 0,
      },
    };

    return {
      get ox() {
        return !self.config.wrap ? self.offset.sx : 0;
      },
      get oy() {
        return self.offset.sy;
      },
      frame( config ) {
        self.config = config;
      },
      move( dx, dy ) {
        self.offset.sx += dx;
        self.offset.sy += dy;

        if ( self.offset.sx < 0 ) self.offset.sx = 0;
        if ( self.offset.sy < 0 ) self.offset.sy = 0;

        workers.matrix.refresh();
      },
      reset() {
        self.offset.sx = 0;
        self.offset.sy = 0;

        workers.matrix.refresh();
      },
    };
  });

})();