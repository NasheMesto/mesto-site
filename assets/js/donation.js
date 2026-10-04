(function () {
	'use strict';

	var currentLanguage = 'en';
	var toastTimer;

	function copyText(value) {
		if (navigator.clipboard && window.isSecureContext) {
			return navigator.clipboard.writeText(value);
		}

		return new Promise(function (resolve, reject) {
			var textArea = document.createElement('textarea');
			textArea.value = value;
			textArea.setAttribute('readonly', '');
			textArea.style.position = 'fixed';
			textArea.style.opacity = '0';
			document.body.appendChild(textArea);
			textArea.select();

			try {
				document.execCommand('copy');
				resolve();
			} catch (error) {
				reject(error);
			} finally {
				document.body.removeChild(textArea);
			}
		});
	}

	function showToast(message) {
		var toast = document.querySelector('.copy-toast');
		if (!toast) return;

		window.clearTimeout(toastTimer);
		toast.textContent = message;
		toast.classList.add('is-visible');
		toastTimer = window.setTimeout(function () {
			toast.classList.remove('is-visible');
		}, 1800);
	}

	function updateCopyLabels() {
		document.querySelectorAll('[data-copy-label]').forEach(function (label) {
			label.textContent = label.closest('.copy-button').classList.contains('copy-button--block')
				? (currentLanguage === 'ru' ? 'Копировать адрес' : 'Copy address')
				: (currentLanguage === 'ru' ? 'Копировать' : 'Copy');
		});
	}

	function setLanguage(language) {
		currentLanguage = language === 'ru' ? 'ru' : 'en';
		document.documentElement.lang = currentLanguage;

		document.querySelectorAll('[data-copy-en][data-copy-ru]').forEach(function (element) {
			element.textContent = element.getAttribute('data-copy-' + currentLanguage);
		});

		document.querySelectorAll('[data-lang-panel]').forEach(function (panel) {
			panel.hidden = panel.getAttribute('data-lang-panel') !== currentLanguage;
		});

		document.querySelectorAll('[data-language]').forEach(function (button) {
			var isActive = button.getAttribute('data-language') === currentLanguage;
			button.classList.toggle('is-active', isActive);
			button.setAttribute('aria-pressed', String(isActive));
		});

		updateCopyLabels();

		try {
			window.localStorage.setItem('mesto-support-language', currentLanguage);
		} catch (error) {
			// Language preference remains available for the current page view.
		}
	}

	function activateMethod(method) {
		document.querySelectorAll('[data-method]').forEach(function (button) {
			var isActive = button.getAttribute('data-method') === method;
			button.classList.toggle('is-active', isActive);
			button.setAttribute('aria-selected', String(isActive));
			button.tabIndex = isActive ? 0 : -1;
		});

		document.querySelectorAll('[data-method-panel]').forEach(function (panel) {
			panel.hidden = panel.getAttribute('data-method-panel') !== method;
		});

		if (method === 'card') {
			var widget = document.querySelector('.coffee-widget');
			if (widget && !widget.getAttribute('src')) {
				widget.src = widget.getAttribute('data-src');
			}
		}
	}

	document.querySelectorAll('[data-language]').forEach(function (button) {
		button.addEventListener('click', function () {
			setLanguage(button.getAttribute('data-language'));
		});
	});

	document.querySelectorAll('[data-method]').forEach(function (button) {
		button.addEventListener('click', function () {
			activateMethod(button.getAttribute('data-method'));
		});

		button.addEventListener('keydown', function (event) {
			if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

			var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-method]'));
			var currentIndex = tabs.indexOf(button);
			var direction = event.key === 'ArrowRight' ? 1 : -1;
			var nextTab = tabs[(currentIndex + direction + tabs.length) % tabs.length];
			activateMethod(nextTab.getAttribute('data-method'));
			nextTab.focus();
		});
	});

	document.querySelectorAll('[data-copy-value]').forEach(function (button) {
		button.addEventListener('click', function () {
			copyText(button.getAttribute('data-copy-value')).then(function () {
				var label = button.querySelector('[data-copy-label]');
				var originalLabel = label.textContent;
				button.classList.add('is-copied');
				label.textContent = currentLanguage === 'ru' ? 'Скопировано' : 'Copied';
				showToast(currentLanguage === 'ru' ? 'Скопировано в буфер обмена' : 'Copied to clipboard');

				window.setTimeout(function () {
					button.classList.remove('is-copied');
					label.textContent = originalLabel;
				}, 1600);
			}).catch(function () {
				showToast(currentLanguage === 'ru' ? 'Не удалось скопировать' : 'Could not copy');
			});
		});
	});

	var savedLanguage = null;
	try {
		savedLanguage = window.localStorage.getItem('mesto-support-language');
	} catch (error) {
		// Use the browser language when storage is unavailable.
	}

	setLanguage(savedLanguage || (navigator.language.toLowerCase().indexOf('ru') === 0 ? 'ru' : 'en'));
	activateMethod('card');
})();
