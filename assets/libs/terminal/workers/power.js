;(function(){
  'use strict';

  window.TerminalPower = Worker(({ state, workers }) => {
    const self = {
      enabled: false,
    };

    return {
      on( options ) {
        if ( self.enabled ) return;

        self.enabled = true;

        const $canvas = document.querySelector( state.selector );

        workers.config.edit( options );
        workers.screen.on( $canvas );
        workers.events.on( $canvas );

        const on_frame = () => {
          workers.screen.frame( workers.input.get_buffer(), {
            wrap: workers.config.wrap,
            caret: workers.config.caret,
            font: workers.config.font,
            select: workers.config.select,
          });
        };

        on_frame();

        const frame = () => {
          if ( !self.enabled ) return;

          on_frame();

          window.requestAnimationFrame( frame );
        };

        window.requestAnimationFrame( frame );
      },
      off() {
        if ( !self.enabled ) return;

        self.enabled = false;

        workers.events.off();
        workers.screen.off();
      },
    };
  });

})();