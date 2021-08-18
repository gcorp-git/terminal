;(function(){
  'use strict';

  window.TerminalScreen = Director(() => ({
    state: {
      $canvas: undefined,
      ctx: undefined,
      changed: false,
      bg: '#111',
      color: '#eee',
      width: 0,
      height: 0,
    },
    workers: {
      camera: TerminalScreenCamera,
      coords: TerminalScreenCoords,
      matrix: TerminalScreenMatrix,
      power: TerminalScreenPower,
      select: TerminalScreenSelect,
    },
    service: ({ state, workers }) => ({
      on: workers.power.on.bind( workers.power ),
      off: workers.power.off.bind( workers.power ),
      frame: workers.matrix.frame.bind( workers.matrix ),
      refresh: workers.matrix.refresh.bind( workers.matrix ),
      camera: {
        reset: workers.camera.reset.bind( workers.camera ),
        move: workers.camera.move.bind( workers.camera ),
      },
      select: {
        get: workers.select.get.bind( workers.select ),
        from( sx, sy ) {
          workers.select.from( workers.coords.get_real_coords( sx, sy ) );
        },
        to( sx, sy ) {
          workers.select.to( workers.coords.get_real_coords( sx, sy ) );
        },
        stop: workers.select.stop.bind( workers.select ),
        remove: workers.select.remove.bind( workers.select ),
      },
    }),
  }));

})();