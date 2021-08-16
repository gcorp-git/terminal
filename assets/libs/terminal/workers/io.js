;(function(){
  'use strict';

  const TAB_LENGTH = 4;

  window.TerminalIO = Worker(({ state, workers }) => ({
    state: { buffer: [] },
    service: ({ state, workers }) => ({
      print( sx, sy, text ) {
        if ( typeof text === 'string' ) text = { text };

        if ( !( text instanceof Object ) ) return;
        
        for ( let i = 0, len = text.text.length; i < len; i++ ) {
          const char = text.text.charAt( i );

          switch ( char ) {
            case '\b':
              if ( sx > 0 ) sx -= 1;
              break;
            case '\r':
              sx = 0;
              break;
            case '\n':
              sx = 0;
              sy += 1;
              break;
            case '\t':
              for ( let j = 0; j < TAB_LENGTH; j++ ) {
                this.remove( sx + j, sy );
              }

              sx += TAB_LENGTH;
              break;
            default:
              const symbol = {};

              symbol.char = char;

              if ( text.bg ) symbol.bg = text.bg;
              if ( text.color ) symbol.color = text.color;

              this.set( sx, sy, symbol );

              sx += 1;
              break;
          }
        }
      },
      get( sx, sy ) {
        return state.buffer[ sy ] ? state.buffer[ sy ][ sx ] : undefined;
      },
      set( sx, sy, symbol ) {
        if ( !symbol ) return this.remove( sx, sy );
        if ( !state.buffer[ sy ] ) state.buffer[ sy ] = [];

        if ( typeof symbol === 'string' ) {
          symbol = { char: symbol };
        }

        if ( !( symbol instanceof Object ) ) return;

        state.buffer[ sy ][ sx ] = symbol;

        workers.screen.mark_for_refresh();
      },
      remove( sx, sy ) {
        if ( sx !== undefined && sy !== undefined ) {
          if ( state.buffer[ sy ] && state.buffer[ sy ][ sx ] ) {
            delete state.buffer[ sy ] && state.buffer[ sy ][ sx ];
          }
        } else {
          state.buffer = [];
        }

        workers.screen.mark_for_refresh();
      },
      get_buffer() {
        return state.buffer;
      },
    }),
  }));

})();