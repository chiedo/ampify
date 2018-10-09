const cheerio = require('cheerio');

module.exports = function(html, baseUrl, extras = () => {}) {
  let $;

  // The tags that we will convert to amp versions
  const tags = {
    amp: ['img', 'video', 'iframe'],
  };

  // Load the html so we can manipulate it with jQuery syntax on the server
  $ = cheerio.load(html, {
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: false,
    cwd: '',
    round: true,
  });

  /**************************************************************************************
   * GROUNDWORK
   *************************************************************************************/
  //remove all script tags. If any specific script tags are needed
  //they can be added back later. This gives us a clean slate though
  $('script').each(function() {
    // Dont remove structured data & json darta & amp files scrips though
    const type = $(this).attr('type');
    const src = $(this).attr('src');
    
    if (type === 'application/ld+json' || type === 'application/json' || src && src.includes('ampproject')) {
      // dont remove ld+json / json / ampproject scripts
    } else {
      $(this).remove();
    }
  });

  // Add AMP HTML5 Video Support
  if($('body video').length > 0) {
    $('script[custom-element="amp-video"]').remove();
    $('head').append('<script async custom-element="amp-video" src="https://cdn.ampproject.org/v0/amp-video-0.1.js"></script>');
  }

  // Add AMP Iframe Support
  if($('body iframe').length > 0) {
    $('script[custom-element="amp-iframe"]').remove();
    $('head').append('<script async custom-element="amp-iframe" src="https://cdn.ampproject.org/v0/amp-iframe-0.1.js"></script>');
  }

  // Remove existing noscripts and styles
  $('noscript').remove();
  $('style').remove();

  //Add the amp attribute to the html
  $('html').attr('amp', '');

  //Add the required meta charset tags if not already present
  if ($('head meta[charset="utf-8"]').length === 0) {
    $('head').append('<meta charset="utf-8">');
  }

  // The amp version of the site should not have any amphtml.
  $('head').find('link[rel="amphtml"]').remove();

  // Remove preloader code
  $('head').find('link[as="script"]').remove();

  // If the viewport meta isn't correctly set in regards to the amp standards, then set it
  if ($('head meta[content="width=device-width,minimum-scale=1,initial-scale=1"]').length === 0) {
    // Remove the viewport meta if it exists
    $('head meta[name="viewport"]').remove();
    // Add the correct viewport meta
    $('head').prepend('<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">');
  }

  // add the main amp library
  if ($('head script[src="https://cdn.ampproject.org/v0.js"]').length === 0) {
    $('head').append('<script async src="https://cdn.ampproject.org/v0.js"></script>');
  }


  $('head').prepend('<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>');

  // Remove any styles we have that weren't added the 'amp' way
  $('link[rel=stylesheet]').each(function() {
    $(this).remove();
  });

  // remove style attributes from everything. No inline styles with amp
  $( '*' ).removeAttr('style');


  /**************************************************************************************
   * AMP CONVERSIONS
   *************************************************************************************/
  // convert img tags to amp-img tags and video tags to amp-video tags, etc.
  $(tags.amp.join(',')).each(function() {
    this.name = 'amp-' + this.name;
  });

  // Set the layouts for all the images
  $('.main-pane amp-img, .page amp-img').each(function(){
    if($(this).attr('data-layout')) {
      $(this).attr('layout', $(this).attr('data-layout'));
    } else {
      // For images that are really large, let them be responsive and allow them to go full screen
      // Fixed images that are really large don't scale down well with AMP for some reason. So this
      // is somewhat of a hack fix
      if($(this).attr('width') > 700 ) {
        $(this).attr('layout', 'responsive');
      // For most images, just let them be fixed and css will scale them down
      } else {
        $(this).attr('layout', 'fixed');
      }
    }
  });

  /**************************************************************************************
   * Replace certain elements on the page for AMP specifically
   *************************************************************************************/
  extras($);

  /**************************************************************************************
   * DONE
   *************************************************************************************/
  return $.html();
};

