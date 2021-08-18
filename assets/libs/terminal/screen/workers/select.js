;(function(){
  'use strict';

  window.TerminalScreenSelect = Worker(({ state, workers }) => {
    const self = {
      select: undefined,
      normalized: undefined,
    };

    return {
      frame() {
        if ( self.normalized ) delete self.normalized;
      },
      get() {
        if ( !self.select?.to ) return undefined;

        if ( !self.normalized ) {
          self.normalized = _normalize( self.select );
        }

        return {
          from: { ...self.normalized.from },
          to: { ...self.normalized.to },
        };
      },
      from({ rx, ry }) {
        if ( !self.select ) self.select = {};

        self.select.from = { rx, ry };
        workers.matrix.refresh();
      },
      to({ rx, ry }) {
        if ( !self.select ) self.select = {};

        self.select.to = { rx, ry };
        workers.matrix.refresh();
      },
      stop() {
        if ( !self.select?.to ) return;

        if ( self.select.from.rx === self.select.to.rx ) {
          if ( self.select.from.ry === self.select.to.ry ) {
            delete self.select;
          }
        }

        workers.matrix.refresh();
      },
      remove() {
        if ( self.select ) delete self.select;
      },
    };
  });

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