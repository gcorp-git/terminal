;(function(){
  'use strict';

  window.Terminal = Director(( selector ) => ({
    state: { selector },
    workers: {
      clipboard: TerminalClipboard,
      config: TerminalConfig,
      events: TerminalEvents,
      input: TerminalInput,
      power: TerminalPower,
    },
    managers: ({ state, workers }) => ({
      screen: TerminalScreen(),
    }),
    service: ({ state, workers }) => ({
      on: workers.power.on.bind( workers.power ),
      off: workers.power.off.bind( workers.power ),
      config: workers.config.edit.bind( workers.config ),
      print: workers.input.print.bind( workers.input ),
      get: workers.input.get.bind( workers.input ),
      set: workers.input.set.bind( workers.input ),
      remove: workers.input.remove.bind( workers.input ),
    }),
  }));

})();