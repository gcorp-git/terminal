;(function(){
  'use strict';

  window.TerminalConfig = Worker(({ state, workers }) => {
    const self = {
      options: {
        wrap: false,
        select: {
          enabled: false,
          bg: '#eee',
          color: '#111',
        },
        font: {
          weight: 400,
          size: 16,
        },
        caret: {
          width: 9,
          height: 17,
        },
      },
    };

    return {
      get wrap() {
        return self.options.wrap;
      },
      get select() {
        return { ...self.options.select };
      },
      get font() {
        return { ...self.options.font };
      },
      get caret() {
        return { ...self.options.caret };
      },
      edit( options ) {
        if ( !( options instanceof Object ) ) return;

        if ( options?.wrap !== undefined ) {
          self.options.wrap = !!options.wrap;
          workers.screen.camera.reset();
        }

        if ( options?.select instanceof Object ) {
          self.options.select.enabled = !!options.select.enabled;
          self.options.select.bg = options.select.bg ?? self.options.select.bg;
          self.options.select.color = options.select.color ?? self.options.select.color;
        }

        if ( options?.font instanceof Object ) {
          const size = options.font.size ?? self.options.font.size;
          const weight = options.font.weight ?? self.options.font.weight;

          self.options.font.size = size;
          self.options.font.weight = weight;

          self.options.caret.width = Math.floor( 0.5 * self.options.font.size ) + 1;
          self.options.caret.height = self.options.font.size;
        }

        workers.screen.refresh();
      },
    };
  });

})();