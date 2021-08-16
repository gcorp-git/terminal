;(function(){
  'use strict';

  window.TerminalScreen = Worker(({ state, workers }) => ({
    state: {
      $canvas: undefined,
      ctx: undefined,
      bg: '#111',
      color: '#eee',
      width: 0,
      height: 0,
      offset: {
        sx: 0,
        sy: 0,
      },
      real: [],
      changed: false,
    },
    service: ({ state, workers }) => ({
      get $canvas() {
        return state.$canvas;
      },
      get width() {
        return state.width;
      },
      get height() {
        return state.height;
      },
      get ox() {
        return !workers.config.wrap ? state.offset.sx : 0;
      },
      set ox( ox ) {
        state.offset.sx = ox >= 0 ? ox : 0;
      },
      get oy() {
        return state.offset.sy;
      },
      set oy( oy ) {
        state.offset.sy = oy >= 0 ? oy : 0;
      },
      enable() {
        state.$canvas = document.querySelector( state.selector );

        state.$canvas.setAttribute( 'style', `
          display: block;
          width: 100%;
          height: 100%;
          background-color: ${state.bg};
          position: relative;
          cursor: text;
        `);

        state.ctx = state.$canvas.getContext( '2d' );

        this.resize();
      },
      disable() {
        state.$canvas.removeAttribute( 'style' );
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

        const sw = Math.floor( canvasWidth / workers.config.caret.width );
        const sh = Math.floor( canvasHeight / workers.config.caret.height );

        if ( sw !== state.width || sh !== state.height ) {
          state.width = sw;
          state.height = sh;
        }

        _update_real_coords( state, workers );
      },
      frame() {
        if ( !state.changed ) return;

        this.resize();

        workers.select.frame();

        state.ctx.clearRect( 0, 0, state.$canvas.width, state.$canvas.height );

        const sw = state.width;
        const sh = state.height;

        const ns = workers.select.get_normalized();

        for ( let sy = 0; sy < sh; sy++ ) {
          if ( !this.has_real_coords_row( sy ) ) continue;

          for ( let sx = 0; sx < sw; sx++ ) {
            const { rx, ry } = this.get_real_coords( sx, sy );

            _draw_symbol( state, workers, rx, ry, sx, sy, ns );
          }
        }

        state.changed = false;
      },
      reset() {
        state.offset.sx = 0;
        state.offset.sy = 0;
      },
      mark_for_refresh() {
        state.changed = true;
      },
      has_real_coords_row( sy ) {
        return !!state.real[ this.oy + sy ];
      },
      get_real_coords( sx, sy ) {
        const osx = this.ox + sx;
        const osy = this.oy + sy;

        const real = state.real[ osy ];

        const rx = real ? real[ 0 ] + osx : ( sx > 0 ? Infinity : -Infinity );
        const ry = real ? real[ 1 ] : ( sy > 0 ? Infinity : -Infinity );

        return { rx, ry };
      },
    }),
  }));

  function _update_real_coords( state, workers ) {
    if ( !state.changed ) return;

    const buffer = workers.io.get_buffer();

    let current = 0;

    state.real = [];

    for ( let i = 0, len = buffer.length; i < len; i++ ) {
      const rowLength = buffer[ i ] ? buffer[ i ].length : 0;

      state.real[ current ] = [ 0, i ];

      current += 1;

      if ( workers.config.wrap ) {
        for ( let j = state.width; j <= rowLength; j += state.width ) {
          state.real[ current ] = [ j, i ];
          current += 1;
        }
      }
    }
  }

  function _draw_symbol( state, workers, rx, ry, sx, sy, ns ) {
    const buffer = workers.io.get_buffer();

    let symbol = buffer[ ry ] ? buffer[ ry ][ rx ] : undefined;
    
    const cw = workers.config.caret.width;
    const ch = workers.config.caret.height;

    const gx = sx * cw;
    const gy = sy * ch;

    const selected = ns ? _is_selected_symbol( rx, ry, ns ) : false;

    const bg = !selected
      ? ( symbol?.bg ?? state.bg )
      : workers.config.select.bg;

    state.ctx.fillStyle = bg;
    state.ctx.fillRect( gx, gy, cw, ch );
    
    if ( symbol ) {
      const color = !selected
        ? ( symbol?.color ?? state.color )
        : workers.config.select.color;

      const fw = workers.config.font.weight;
      const fs = workers.config.font.size;

      state.ctx.font = `normal ${fw} ${fs}px/1 monospace`;
      state.ctx.textBaseline = 'bottom';
      state.ctx.fillStyle = color;
      state.ctx.fillText( symbol.char, gx, gy + ch );
    }
  }

  function _is_selected_symbol( rx, ry, ns ) {
    return ns.from.ry === ns.to.ry
      ? ry === ns.from.ry && rx >= ns.from.rx && rx <= ns.to.rx
      : ( ry > ns.from.ry && ry < ns.to.ry )
        || ( ry === ns.from.ry && rx >= ns.from.rx )
        || ( ry === ns.to.ry && rx <= ns.to.rx );
  }

})();