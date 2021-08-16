;(function(){
	'use strict';

	window.TerminalSelect = function( env ) {
		env.select = undefined;
		env.normalized = undefined;

		return {
			frame: () => _frame( env ),
			get: () => _get( env ),
			set: ( value ) => _set( env, value ),
			edit: ( patch ) => _edit( env, patch ),
			remove: () => _remove( env ),
			get_normalized: () => _get_normalized( env ),
		};
	};

	function _frame( env ) {
		if ( env.normalized ) delete env.normalized;
	}

	function _get( env ) {
		return { ...env.select };
	}

	function _set( env, value ) {
		env.select = value;
	}

	function _edit( env, patch ) {
		env.select = { ...env.select, ...patch };
	}

	function _remove( env ) {
		if ( env.select ) delete env.select;
	}

	function _get_normalized( env ) {
		if ( !env.select?.to ) return undefined;

		if ( !env.normalized ) {
			const from = { ...env.select.from };
			const to = { ...env.select.to };

			const original = { from: from, to: to };
			const reversed = { from: to, to: from };

			const min_rx = Math.min( from.rx, to.rx );
			const min_ry = Math.min( from.ry, to.ry );

			env.normalized = from.ry === to.ry
				? ( from.rx === min_rx ? original : reversed )
				: ( from.ry === min_ry ? original : reversed );
		}

		return env.normalized;
	}

})();