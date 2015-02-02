(function($) {
  $.fn.WegoMenus = function(options) {
    options = $.extend({}, options);
    var menus = {};

    initialize();

    function initialize() {
      restoreOptions();
      loadActions();
      clearMenus();
      renderMenus();
    }

    function loadActions() {
      actions = options['actions'];
      delete options['actions'];
    }

    function restoreOptions(){
      if (localStorage.getItem('options')) {
        options = jQuery.parseJSON(localStorage.getItem('options'));
      }
    }

    function renderMenus() {
      var separated = false;
      var lastKey = findLastKey(options);
      for (var i in options) {
        if (separated && i != lastKey) {
          addSeparator();
        }
        processOptions(i, options[i]);
        separated = true;
      }
    }

    function processOptions(groupName, group) {
      var config = group['config'];
      if (config && config['action']) {
        if (config['action'] == 'domainSubstitution') {
          setupMenuItems(group, domainSubstitution);
        } else if (config['action'] == 'openInNewTab') {
          setupMenuItems(group, openInNewTab);
        }
      } else {
        addSeparator();
        setupOptions(group);
      }
    }

    function setupOptions(group) {
      for (var i in group) {
        if (i != 'config') {
          var val = jQuery.parseJSON(group[i]['value']);
          var type = group[i]['type'];
          var label = group[i]['label'];
          // Only supporting booleans for now
          if (type == 'boolean') {
            self[i] = val;
            createCheckbox(label, i, val);
          }
        }
      }
    }

    function setupMenuItems(group, action) {
      for (var i in group) {
        setupMenuItem(group, i, action);
        menus[i] = group[i].url;
      }
    }

    function clearMenus() {
      chrome.contextMenus.removeAll();
    }


    function createCheckbox(title, id, checked) {
      chrome.contextMenus.create({ "title": title,
                             "id": id,
                             "type": "checkbox",
                             "checked": checked,
                             "onclick": checkboxOnClick });

    }

    function addSeparator() {
      chrome.contextMenus.create({ "type": "separator" });
    }

    function setupMenuItem(group, id, action) {
      if (shouldCreateMenu(id, group)) {
        params = { "id":  id,
                   "title":  id,
                   "onclick":  action
                 }
        chrome.contextMenus.create(params);
      }
    }

    function shouldCreateMenu(title, opts) {
      if (title == 'config') { return false; }
      if (opts[title].enabled == true || opts[title].enabled == 'true') {
        return true;
      }
      return false;
    }

    function domainSubstitution(info, tab) {
      var url = '';

      if (isWegoMenu(tab.url)) {
        url = tab.url.split('/')
        url.splice(0, 3);
        url = menus[info.menuItemId] + "/" + url.join('/');
      } else {
        url = menus[info.menuItemId];
      }

      if (loadInSeparateTab) {
        chrome.tabs.create({ url: url, index: tab.index+1 });
      } else {
        chrome.tabs.update(tab.id, { url: url })
      }
    }

    function isWegoMenu(url) {
      if (url) {
        for (var i in menus) {
          if (menus[i] && url.indexOf(menus[i]) == 0) {
            return true;
          }
        }
      }
      return false;
    }

    function openInNewTab(info, tab) {
      var url = menus[info.menuItemId];
      chrome.tabs.create({ url: url, index: tab.index+1 });
    }

    function checkboxOnClick(info, tab) {
      localStorage[info.menuItemId] = info.checked
      this[info.menuItemId] = info.checked;
    }

    function countKeys(obj) {
      count = 0;
      for (var i in obj) {
        count++;
      }
      return count;
    }

    function findLastKey(obj) {
      var lastKey;
      for (var i in obj) {
        lastKey = i;
      }
      return lastKey;
    }

    function isBoolean(val) {
      val = jQuery.parseJSON(val);
      if (val == true || val == false) {
        return true;
      }
      return false;
    }
  }
})(jQuery);
