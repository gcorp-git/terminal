;(function(){
  'use strict';

  window.TerminalScreenPower = Worker(({ state, workers }) => {
    const self = {};

    return {
      on( $canvas ) {
        state.$canvas = $canvas;
        state.$canvas.setAttribute( 'style', `
          display: block;
          width: 100%;
          height: 100%;
          background-color: ${state.bg};
          position: relative;
          cursor: text;
        `);

        state.ctx = state.$canvas.getContext( '2d' );
      },
      off() {
        state.$canvas.removeAttribute( 'style' );
      },
    };
  });

})();