;(function(){
	'use strict';

	window.TerminalHead = function( env ) {
		env.enabled = false;

		return {
			enable: ( options ) => _enable( env, options ),
			disable: () => _disable( env ),
		};
	};

	function _enable( env, options ) {
		if ( env.enabled ) return;

		env.enabled = true;

		env.workers.config.edit( options );
		env.workers.screen.enable();
		env.workers.events.enable();

		const frame = () => {
			if ( !env.enabled ) return;
			
			env.workers.screen.frame();

			window.requestAnimationFrame( frame );
		};

		window.requestAnimationFrame( frame );
	}

	function _disable( env ) {
		if ( !env.enabled ) return;

		env.enabled = false;

		env.workers.events.disable();
		env.workers.screen.disable();
	}

})();