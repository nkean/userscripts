// 'beforescriptexecute' event [es5]
// original version: https://gist.github.com/jspenguin2017/cd568a50128c71e515738413cd09a890

(function() {
	;('use strict')
	function Event(script, target) {
		this.script = script
		this.target = target

		this._cancel = false
		this._replace = null
		this._stop = false
	}
	Event.prototype.preventDefault = function() {
		this._cancel = true
	}
	Event.prototype.stopPropagation = function() {
		this._stop = true
	}
	Event.prototype.replacePayload = function(payload) {
		this._replace = payload
	}

	var callbacks = []
	var addBeforeScriptExecuteListener = function(f) {
		if (!f instanceof Function) {
			throw new Error('Event handler must be a function.')
		}
		callbacks.push(f)
	}
	var removeBeforeScriptExecuteListener = function(f) {
		var i = callbacks.length
		while (i--) {
			if (callbacks[i] === f) {
				callbacks.splice(i, 1)
			}
		}
	}
	var addev = window.addEventListener.bind(window)
	var rmev = window.removeEventListener.bind(window)
	window.addEventListener = function() {
		if (arguments[0].toLowerCase() === 'beforescriptexecute') addBeforeScriptExecuteListener(arguments[1])
		else addev.apply(null, arguments)
	}
	window.removeEventListener = function() {
		if (arguments[0].toLowerCase() === 'beforescriptexecute') removeBeforeScriptExecuteListener(arguments[1])
		else rmev.apply(null, arguments)
	}

	var dispatch = function(script, target) {
		var e = new Event(script, target)

		if (window.onbeforescriptexecute instanceof Function) {
			try {
				window.onbeforescriptexecute(e)
			} catch (err) {
				console.error(err)
			}
		}

		for (var i = 0; i < callbacks.length; i++) {
			if (e._stop) {
				break
			}
			try {
				callbacks[i](e)
			} catch (err) {
				console.error(err)
			}
		}

		return e
	}
	var observer = new MutationObserver(mutations => {
		for (var i = 0; i < mutations.length; i++) {
			for (var j = 0; j < mutations[i].addedNodes.length; j++) {
				var el = mutations[i].addedNodes[j]
				if (el.tagName !== 'SCRIPT') continue
				var e = dispatch(el, mutations[i].target)
				if (e._cancel) {
					el.remove()
				} else if (typeof e._replace === 'string') {
					el.textContent = e._replace
				}
			}
		}
	})
	observer.observe(document, {
		childList: true,
		subtree: true
	})
})();
