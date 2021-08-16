;(function(){
	'use strict';

	window.Terminal = function( selector ) {
		const state = {};

		state.selector = selector;

		const workers = {};

		workers.config = new TerminalConfig({ state, workers });
		workers.events = new TerminalEvents({ state, workers });
		workers.head = new TerminalHead({ state, workers });
		workers.io = new TerminalIO({ state, workers });
		workers.screen = new TerminalScreen({ state, workers });
		workers.select = new TerminalSelect({ state, workers });

		return {
			enable: workers.head.enable,
			disable: workers.head.disable,
			config: workers.config.edit,
			print: workers.io.print,
			get: workers.io.get,
			set: workers.io.set,
			remove: workers.io.remove,
		};
	}

})();