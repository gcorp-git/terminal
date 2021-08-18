;(function(){
  'use strict';

  window.TerminalScreenMatrix = Worker(({ state, workers }) => {
    const self = {
      buffer: undefined,
      config: undefined,
    };

    // todo: change `select` handling - bg and color may differ for each symbol

    return {
      refresh() {
        state.changed = true;
      },
      frame( buffer, config ) {
        if ( !state.changed ) return;

        self.buffer = buffer;
        self.config = config;

        const env = { self, state, workers };

        this.resize();

        workers.camera.frame( config );
        workers.select.frame();

        state.ctx.clearRect( 0, 0, state.$canvas.width, state.$canvas.height );

        const sw = state.width;
        const sh = state.height;

        const select = workers.select.get();

        for ( let sy = 0; sy < sh; sy++ ) {
          if ( !workers.coords.has_real_row( workers.camera.oy + sy ) ) continue;

          for ( let sx = 0; sx < sw; sx++ ) {
            const { rx, ry } = workers.coords.get_real_coords( sx, sy );

            _draw_symbol( env, rx, ry, sx, sy, select );
          }
        }

        state.changed = false;
      },
      resize() {
        const style = getComputedStyle( state.$canvas );
        const canvasWidth = parseInt( style.width );
        const canvasHeight = parseInt( style.height );

        if ( canvasWidth !== state.$canvas.width || canvasHeight !== state.$canvas.height ) {
          state.$canvas.width = canvasWidth;
          state.$canvas.height = canvasHeight;

          state.changed = true;
        }

        const sw = Math.floor( canvasWidth / self.config.caret.width );
        const sh = Math.floor( canvasHeight / self.config.caret.height );

        if ( sw !== state.width || sh !== state.height ) {
          state.width = sw;
          state.height = sh;
        }

        if ( state.changed ) workers.coords.update_real_coords( self.buffer, self.config );
      },
    };
  });

  function _draw_symbol( env, rx, ry, sx, sy, select ) {
    const { self, state, workers } = env;

    let symbol = self.buffer[ ry ] ? self.buffer[ ry ][ rx ] : undefined;
    
    const cw = self.config.caret.width;
    const ch = self.config.caret.height;

    const gx = sx * cw;
    const gy = sy * ch;

    const selected = select ? _is_selected_symbol( rx, ry, select ) : false;

    const bg = !selected
      ? ( symbol?.bg ?? state.bg )
      : self.config.select.bg;

    state.ctx.fillStyle = bg;
    state.ctx.fillRect( gx, gy, cw, ch );
    
    if ( symbol ) {
      const color = !selected
        ? ( symbol?.color ?? state.color )
        : self.config.select.color;

      const fw = self.config.font.weight;
      const fs = self.config.font.size;

      state.ctx.font = `normal ${fw} ${fs}px/1 monospace`;
      state.ctx.textBaseline = 'bottom';
      state.ctx.fillStyle = color;
      state.ctx.fillText( symbol.char, gx, gy + ch );
    }
  }

  function _is_selected_symbol( rx, ry, select ) {
    return select.from.ry === select.to.ry
      ? ry === select.from.ry && rx >= select.from.rx && rx <= select.to.rx
      : ( ry > select.from.ry && ry < select.to.ry )
        || ( ry === select.from.ry && rx >= select.from.rx )
        || ( ry === select.to.ry && rx <= select.to.rx );
  }

})();