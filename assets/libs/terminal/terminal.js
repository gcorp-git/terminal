;(function(){
	'use strict';

	window.Terminal = Director(( selector ) => ({
		state: { selector },
		workers: {
			config: TerminalConfig,
			events: TerminalEvents,
			head: TerminalHead,
			io: TerminalIO,
			screen: TerminalScreen,
			select: TerminalSelect,
		},
		service: ({ state, workers }) => ({
			enable: workers.head.enable,
			disable: workers.head.disable,
			config: workers.config.edit,
			print: workers.io.print,
			get: workers.io.get,
			set: workers.io.set,
			remove: workers.io.remove,
		}),
	}));

})();