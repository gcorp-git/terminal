;(function(){
	'use strict';

	window.TerminalEvents = Worker(({ state, workers }) => ({
		state: {
			listeners: [],
			kb: {
				ctrl: false,
				shift: false,
				alt: false,
			},
			mouse: {
				left: false,
				right: false,
			},
		},
		service: ({ state, workers }) => ({
			enable() {
				const $canvas = workers.screen.$canvas;

				window.onresize = workers.screen.mark_for_refresh;

				const env = { state, workers };

				_on( state, $canvas, 'mousedown', e => _on_mouse_down( env, e ) );
				_on( state, document, 'mousemove', e => _on_mouse_move( env, e ) );
				_on( state, document, 'mouseup', e => _on_mouse_up( env, e ) );
				_on( state, $canvas, 'wheel', e => _on_mouse_wheel( env, e ) );
				_on( state, document, 'keydown', e => _on_key_down( env, e ) );
				_on( state, document, 'keydown', e => _on_key_up( env, e ) );
			},
			disable() {
				state.listeners.forEach(({ $node, event, handler }) => {
					$node.removeEventListener( event, handler );
				});

				state.listeners = [];
			},
		}),
	}));

	function _on_mouse_down( env, e ) {
		const sx = Math.floor( e.offsetX / env.workers.config.caret.width );
		const sy = Math.floor( e.offsetY / env.workers.config.caret.height );

		if ( e.which === 1 && env.workers.config.select.enabled ) {
			env.state.mouse.left = true;
			env.workers.select.set({ from: env.workers.screen.get_real_coords( sx, sy ) });
			env.workers.screen.mark_for_refresh();
		}
	}

	function _on_mouse_move( env, e ) {
		const sx = Math.floor( e.offsetX / env.workers.config.caret.width );
		const sy = Math.floor( e.offsetY / env.workers.config.caret.height );

		if ( e.which === 1 && env.state.mouse.left ) {
			env.workers.select.edit({ to: env.workers.screen.get_real_coords( sx, sy ) });
			env.workers.screen.mark_for_refresh();
		}
	}

	function _on_mouse_up( env, e ) {
		const sx = Math.floor( e.offsetX / env.workers.config.caret.width );
		const sy = Math.floor( e.offsetY / env.workers.config.caret.height );

		if ( e.which === 1 && env.state.mouse.left ) {
			env.state.mouse.left = false;

			env.workers.select.edit({ to: env.workers.screen.get_real_coords( sx, sy ) });

			const select = env.workers.select.get();

			if ( select.from.rx === select.to.rx ) {
				if ( select.from.ry === select.to.ry ) {
					env.workers.select.remove();
				}
			}

			env.workers.screen.mark_for_refresh();
		}
	}

	function _on_mouse_wheel( env, e ) {
		e.preventDefault();

		let delta = Math.floor( e.deltaY / 100 );

		if ( env.state.kb.shift ) {
			env.workers.screen.ox = env.workers.screen.ox + delta;
		} else {
			env.workers.screen.oy = env.workers.screen.oy + delta;
		}

		env.workers.screen.mark_for_refresh();
	}

	function _on_key_down( env, e ) {
		switch ( e.key ) {
			case 'Control': env.state.kb.ctrl = true; break;
			case 'Shift': env.state.kb.shift = true; break;
			case 'Alt': env.state.kb.alt = true; break;
		}

		const select = env.workers.select.get();

		if ( select?.to ) {
			if ( e.code === 'KeyC' && e.ctrlKey ) {
				const normalized_select = env.workers.select.get_normalized();
				const buffer = env.workers.io.get_buffer();
				const result = [];

				let fragment = [];

				if ( normalized_select.from.ry === normalized_select.to.ry ) {
					fragment = [];

					const row = buffer[ normalized_select.from.ry ];

					for ( let ix = normalized_select.from.rx; ix <= normalized_select.to.rx; ix++ ) {
						fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
					}

					result.push( fragment.join('') );
				} else {
					for ( let iy = normalized_select.from.ry; iy <= normalized_select.to.ry; iy++ ) {
						fragment = [];

						const row = buffer[ iy ];

						if ( !row ) continue;

						if ( iy === normalized_select.from.ry ) {
							for ( let ix = normalized_select.from.rx; ix < row.length; ix++ ) {
								fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
							}

							result.push( fragment.join('') );
							continue;
						}

						if ( iy === normalized_select.to.ry ) {
							for ( let ix = 0; ix <= normalized_select.to.rx && ix < row.length; ix++ ) {
								fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
							}

							result.push( fragment.join('') );
							continue;
						}

						for ( let ix = 0; ix < row.length; ix++ ) {
							fragment.push( row[ ix ] ? row[ ix ].char : ' ' );
						}

						result.push( fragment.join('') );
					}
				}

				// todo: copy to inner clipboard

				console.log( result.join( '\n' ) );
			}
		}
	}

	function _on_key_up( env, e ) {
		switch ( e.key ) {
			case 'Control': env.state.kb.ctrl = false; break;
			case 'Shift': env.state.kb.shift = false; break;
			case 'Alt': env.state.kb.alt = false; break;
		}
	}

	function _on( state, $node, event, handler ) {
		$node.addEventListener( event, handler );

		const found = state.listeners.find( listener => (
			   listener.$node === $node
			&& listener.event === event
			&& listener.handler === handler
		));

		if ( found ) return;

		state.listeners.push({ $node, event, handler });
	}

})();