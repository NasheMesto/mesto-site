(function (w, d) {
  'use strict';
  if (w.mestoOpenAIAdsInitialized) return;

  function measure(name, data, options) {
    try {
      w.oaiq('measure', name, data, options);
    } catch (error) {
      // Measurement failures must not interrupt navigation.
    }
  }

  try {
    if (!w.oaiq) {
      var q = function () { q.q.push(arguments); };
      q.q = [];
      w.oaiq = q;
      var js = d.createElement('script');
      js.async = true;
      js.src = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';
      d.head.appendChild(js);
    }
    w.oaiq('init', { pixelId: 'EUjPUpeDEoQojQfKuuzjSA' });
    w.mestoOpenAIAdsInitialized = true;
    measure('page_viewed', { type: 'contents' });

    d.addEventListener('click', function (event) {
      try {
        var link = event.target.closest('a[href]');
        if (!link) return;
        var url = new URL(link.href);
        if (url.protocol === 'https:' && url.hostname === 'maps.app.goo.gl') {
          measure('custom', { type: 'custom' }, { custom_event_name: 'google_maps_clicked' });
        }
      } catch (error) {
        // Leave the original link action available even if tracking fails.
      }
    });
  } catch (error) {
    // The site remains usable when the SDK cannot initialize.
  }
})(window, document);
