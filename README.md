# AMPIFY

Converts static HTML to AMP-ready HTML.

### Getting Started

```
yarn add ampify
```

### Usage

```
const ampify = require('ampify');
const someHTML = '<html>...</html>';

ampify(someHTML, '/url-to-original-page', ($) =>{
  // Do anything you want here to the AMP page using jQuery syntax from cheerio

  // For example, lets add Google Analytics
  $('head').append('<script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>');
  $('body').prepend('<amp-analytics type="googleanalytics" id="analytics1">\
    <script type="application/json">{"vars": {"account": "UA-99380302"},"triggers": {"trackPageview": {"on": "visible","request": "pageview"}}}</script>\
    </amp-analytics>');
})
```
