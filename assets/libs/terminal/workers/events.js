;(function(){
  'use strict';

  window.TerminalEvents = Worker(({ state, workers }) => {
    const self = {
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
    };
    
    return {
      on( $canvas ) {
        window.onresize = workers.screen.refresh;

        const env = { self, state, workers };

        _on( env, $canvas, 'mousedown', e => _on_mouse_down( env, e ) );
        _on( env, document, 'mousemove', e => _on_mouse_move( env, e ) );
        _on( env, document, 'mouseup', e => _on_mouse_up( env, e ) );
        _on( env, $canvas, 'wheel', e => _on_mouse_wheel( env, e ) );
        _on( env, document, 'keydown', e => _on_key_down( env, e ) );
        _on( env, document, 'keydown', e => _on_key_up( env, e ) );
      },
      off() {
        self.listeners.forEach(({ $node, event, handler }) => {
          $node.removeEventListener( event, handler );
        });

        self.listeners = [];
      },
    };
  });

  function _on_mouse_down( env, e ) {
    const sx = Math.floor( e.offsetX / env.workers.config.caret.width );
    const sy = Math.floor( e.offsetY / env.workers.config.caret.height );

    if ( e.which === 1 && env.workers.config.select.enabled ) {
      env.self.mouse.left = true;
      env.workers.screen.select.from( sx, sy );
    }
  }

  function _on_mouse_move( env, e ) {
    const sx = Math.floor( e.offsetX / env.workers.config.caret.width );
    const sy = Math.floor( e.offsetY / env.workers.config.caret.height );

    if ( e.which === 1 && env.self.mouse.left ) {
      env.workers.screen.select.to( sx, sy );
    }
  }

  function _on_mouse_up( env, e ) {
    const sx = Math.floor( e.offsetX / env.workers.config.caret.width );
    const sy = Math.floor( e.offsetY / env.workers.config.caret.height );

    if ( e.which === 1 && env.self.mouse.left ) {
      env.self.mouse.left = false;
      env.workers.screen.select.to( sx, sy );
      env.workers.screen.select.stop();
    }
  }

  function _on_mouse_wheel( env, e ) {
    e.preventDefault();

    let delta = Math.floor( e.deltaY / 100 );

    const dx = env.self.kb.shift ? delta : 0;
    const dy = !env.self.kb.shift ? delta : 0;

    env.workers.screen.camera.move( dx, dy );
  }

  function _on_key_down( env, e ) {
    switch ( e.key ) {
      case 'Control': env.self.kb.ctrl = true; break;
      case 'Shift': env.self.kb.shift = true; break;
      case 'Alt': env.self.kb.alt = true; break;
    }

    if ( e.code === 'KeyC' && e.ctrlKey ) {
      env.workers.clipboard.copy( env.workers.screen.select.get() ?? {} );
    }
  }

  function _on_key_up( env, e ) {
    switch ( e.key ) {
      case 'Control': env.self.kb.ctrl = false; break;
      case 'Shift': env.self.kb.shift = false; break;
      case 'Alt': env.self.kb.alt = false; break;
    }
  }

  function _on( env, $node, event, handler ) {
    $node.addEventListener( event, handler );

    const found = env.self.listeners.find( listener => (
         listener.$node === $node
      && listener.event === event
      && listener.handler === handler
    ));

    if ( found ) return;

    env.self.listeners.push({ $node, event, handler });
  }

})();