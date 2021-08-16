;(function(){
	'use strict';

	window.TerminalHead = Worker(({ state, workers }) => ({
		state: { enabled: false },
		service: ({ state, workers }) => ({
			enable( options ) {
				if ( state.enabled ) return;

				state.enabled = true;

				workers.config.edit( options );
				workers.screen.enable();
				workers.events.enable();

				const frame = () => {
					if ( !state.enabled ) return;
					
					workers.screen.frame();

					window.requestAnimationFrame( frame );
				};

				window.requestAnimationFrame( frame );
			},
			disable() {
				if ( !state.enabled ) return;

				state.enabled = false;

				workers.events.disable();
				workers.screen.disable();
			},
		}),
	}));

})();