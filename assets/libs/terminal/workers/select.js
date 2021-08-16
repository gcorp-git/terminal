;(function(){
  'use strict';

  window.TerminalSelect = Worker(({ state, workers }) => ({
    state: {
      select: undefined,
      normalized: undefined,
    },
    service: ({ state, workers }) => ({
      frame() {
        if ( state.normalized ) delete state.normalized;
      },
      get() {
        return { ...state.select };
      },
      set( value ) {
        state.select = value;
      },
      edit( patch ) {
        state.select = { ...state.select, ...patch };
      },
      remove() {
        if ( state.select ) delete state.select;
      },
      get_normalized() {
        if ( !state.select?.to ) return undefined;

        if ( !state.normalized ) {
          state.normalized = _normalize( state.select );
        }

        return {
          from: { ...state.normalized.from },
          to: { ...state.normalized.to },
        };
      },
    }),
  }));

  function _normalize( select ) {
    const from = { ...select.from };
    const to = { ...select.to };

    const original = { from: from, to: to };
    const reversed = { from: to, to: from };

    const min_rx = Math.min( from.rx, to.rx );
    const min_ry = Math.min( from.ry, to.ry );

    return from.ry === to.ry
      ? ( from.rx === min_rx ? original : reversed )
      : ( from.ry === min_ry ? original : reversed );
  }

})();