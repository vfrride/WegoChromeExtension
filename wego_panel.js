(function($) {
  $.fn.WegoPanel = function(options) {
    options = $.extend({}, options);
    var menus = {};
    var icons = {};
    var colors = {};
    var content = $('#content');

    initialize();

    function initialize() {
      restoreOptions();
      loadActions();
      loadMenus();
      addListeners();
    }

    function loadActions() {
      actions = options['actions'];
      delete options['actions'];
    }

    function loadMenus() {
      for (var i in options) {
        for (var j in options[i]) {
          if (j != 'config') {
            menus[j] = options[i][j]['url'];
            var text = options[i][j]['iconText'];
            if (text) {
              icons[j] = text;
            }
            var color = options[i][j]['color'];
            if (color) {
              colors[j] = color;
            }
          }
        }
      }
    }

    function restoreOptions(){
      if (localStorage.getItem('options')) {
        options = jQuery.parseJSON(localStorage.getItem('options'));
      }
    }

    function renderMenus() {

    }

    function onTabUpdated(tabId, changeInfo, tab) {
      checkForValidUrl(tab);
    }

    function onTabActivated(activeInfo) {
      chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.url) {
          checkForValidUrl(tab);
        }
      });
    }

    function checkForValidUrl(tab) {
      var wegoMenu = getWegoMenu(tab.url);
      if (wegoMenu) {
        showIcon(icons[wegoMenu], colors[wegoMenu], tab.id);
      } else {
        chrome.pageAction.hide(tab.id);
      }
    };

    function getWegoMenu(url) {
      if (url) {
        for (var i in menus) {
          if (menus[i] && url.indexOf(menus[i]) == 0) {
            return i;
          }
        }
      }
      return null;
    }

    function showIcon(text, color, tabId) {
      console.log('text ' + text + ' color ' + color + ' tabId ' + tabId);
      chrome.pageAction.setIcon({ imageData: draw(text, color), tabId: tabId });
      chrome.pageAction.setTitle({ tabId: tabId, title: text });
      chrome.pageAction.show(tabId);
    }

    function addListeners() {
      // Listen for any changes to the URL of any tab.
      chrome.tabs.onUpdated.addListener(onTabUpdated);
      chrome.tabs.onActivated.addListener(onTabActivated);

      // Listen for command keys
      chrome.commands.onCommand.addListener(function(command) {
        chrome.tabs.query({ 'currentWindow': true, 'active': true }, function (tabs) {
          // genericOnClick({ 'menuItemId': command }, tabs[0]);
        });
      });
    }

    function draw(text, color) {    var canvas = document.getElementById('canvas');
      var context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      var gradient = context.createRadialGradient(10,10,2,10,10,12);
      var r = 6;
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "white");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 19, 19);
      context.font='bold 12px Arial';
      context.fillStyle = 'black';
      context.fillText(text,3,14);
      context.strokeStyle = color;
      context.beginPath();
      context.moveTo(r,0);
      context.lineTo(canvas.width-r,0);
      context.arc(canvas.width-r, r, r, 1.5*Math.PI, 0);
      context.lineTo(canvas.width,canvas.height-r);
      context.arc(canvas.width-r, canvas.height-r, r, 0, 0.5*Math.PI);
      context.lineTo(r,canvas.height);
      context.arc(r, canvas.height-r, r, 0.5*Math.PI, Math.PI);
      context.lineTo(0,r);
      context.arc(r, r, r, Math.PI, 1.5*Math.PI);
      context.stroke();
      return context.getImageData(0, 0, 19, 19);
    }
  }
})(jQuery);

$(document).ready(function () {
  $('body').WegoPanel();
  $('body').WegoMenus();
});
