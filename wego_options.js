(function($) {
  $.fn.WegoOptions = function(options) {
    options = $.extend({}, options);

    var actions;
    var content = $('#content');

    initialize();

    function initialize() {
      restoreOptions();
      loadActions();
      renderTables();
      addUtilityButtons();
    }

    function loadActions() {
      actions = options['actions'];
      delete options['actions'];
    }

    function renderTables() {
      for (var i in options) {
        content.append(loadIntoTable(i, options[i]));
      }
    }

    function addChangeListener(input) {
      input.on('change', function () {
        input.css('background-color', 'yellow');
      });
    }

    function fieldChanged() {
      $('input#save').css('background-color', 'yellow');
    }

    function addUtilityButtons() {
      content.append(button('save', 'Save', save));
      content.append(button('default', 'Load Defaults', loadDefaults));
    }

    function loadDefaults() {
      localStorage.removeItem('options');
      location.reload();
    }

    function save() {
      writeOptions();
      refreshMenus();
    }

    function refreshMenus() {
      $('body').WegoMenus();
    }

    function writeOptions() {
      var saveOptions = {};
      saveOptions['actions'] = actions;
      $.each($('table'), function () {
        var table = $(this);
        var rowCount = table.find('tr').length - 3;
        var fields = []
        var header = table.find('h3').text();
        var group = {};


        group['config'] = { 'action': table.find('select.action').val() }
        $.each(table.find('tr.fields th'), function (index, obj) {
          if (index !=0) { fields.push($(obj).text()); }
        });
        for (var i = 0; i < rowCount; i++) {
          var title = table.find('#row-' + i + '-title').val();
          var options = {}
          $.each(fields, function (index, field) {
            var val;
            var input = table.find('#row-' + i + '-' + field);
            if (field == 'enabled') {
              val = input.is(':checked') ? true : false;
            } else {
              val = input.val();
            }
            options[field] = val;
          })
          group[title] = options;
        }
        saveOptions[header] = group;
      });
      localStorage.setItem('options', JSON.stringify(saveOptions));
      clearChanged();
    }

    function clearChanged() {
      $('input#save').css('background-color', 'white');
    }

    function restoreOptions() {
      if (localStorage.getItem('options')) {
        options = jQuery.parseJSON(localStorage.getItem('options'));
      } else {
        localStorage.setItem('options', JSON.stringify(options));
      }
    }

    function actionSelect(group, selectedAction) {
      var select = $('<select>');
      select.data('action', group);
      select.addClass('action');
      for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        var option = $('<option/>').attr('value', action)
                                    .text(action);
        if (action == selectedAction) { option.attr('selected', 'true') }
        select.append(option);
      }
      return select;
    }

    function loadIntoTable(group, rowData) {
      var tTable = $('<table />');
      var tRow = $('<tr />');

      tRow.append(cT('td', cT('h3', group)));
      if (rowData['config'] && rowData['config']['action']) {
        tRow.append($('<td/>')
          .append('<strong>Action: </strong>')
          .append(actionSelect(group, rowData['config']['action'])));
      }
      tTable.append(tRow);
      var headerUnpopulated = true;
      var rowCount = 0;
      for (var row in rowData) {
        if (row != 'config') {
          if (headerUnpopulated == true) {
            tRow = $('<tr class="fields"/>');
            tRow.append(cT('th', 'title'));
            for (var field in rowData[row]) {
              tRow.append(cT('th', field));
            }
            headerUnpopulated = false;
            tTable.append(tRow);
          }
          tRow = $('<tr/>');
          if (rowCount == 0) { tRow.addClass('firstRow'); }
          tRow.append(cT('td', textbox('row-' + rowCount + '-title', row)));
          for (var field in rowData[row]) {
            var fieldId = 'row-' + rowCount + '-' + field;
            if (field == 'enabled') {
              tRow.append(cT('td', checkbox(fieldId, rowData[row][field])));
            } else {
              tRow.append(cT('td', textbox(fieldId, rowData[row][field])));
            }
          }
          tRow.append(cT('td', button(row, 'X', removeRow)));
          tTable.append(tRow);
          rowCount++;
        }
      }
      tRow = $('<tr/>');
      tRow.append(cT('td', button(group, 'Add', addRow, { 'data-row-count': rowCount })));
      tTable.append(tRow);
      return tTable;
    }

    function cT(tag, html) {
      var tag = $('<' + tag + ' />');
      if (html.length > 0) { tag.html(html); }
      return tag;
    }

    function button(id, value, action, attr) {
      var btn = $('<input/>')
               .attr('type', 'button')
               .attr('id', id)
               .attr('value', value)
               .on('click', action);
      if (btn.attr('id') != 'save') {
        btn.on('click', fieldChanged);
      }
      if (attr) {
        for (var i in attr) {
          btn.attr(i, attr[i]);
        }
      }
      return btn;
    }

    function textbox(id, value) {
      var txt = $('<input/>')
                  .attr('type', 'text')
                  .attr('id', id)
                  .attr('value', value);
      addChangeListener(txt);
      return txt;
    }

    function checkbox(id, value) {
      var check = $('<input/>')
                    .attr('type', 'checkbox')
                    .attr('id', id);
      if (value == true || value == 'true') { check.attr('checked', 'true') }
      addChangeListener(check);
      return check;
    }

    function removeRow () {
      var removeButton = $(this);
      var row = removeButton.closest('tr');
      if (!row.hasClass('firstRow')) {
        row.remove();
      } else {
        alert('First row is not removable');
      }
    }

    function addRow() {
      var addButton = $(this);
      var table = addButton.closest('table');
      var fields = table.find('tr.firstRow');
      var newRow = fields.clone().removeClass('firstRow');
      var rowCount = addButton.data('row-count');
      $.each(newRow.find('input'), function () {
        var input = $(this);
        var oldId = input.attr('id');
        if (notCheckOrButton(input)) {
          input.val('');
          input.attr('value', '');
        }
        input.attr('id', oldId.replace('-0-', '-' + rowCount + '-'));
        addChangeListener(input);
      });
      addButton.closest('tr').before(newRow);
      addButton.data('row-count', rowCount + 1);
    }

    function notCheckOrButton(input) {
      return input.attr('type') != 'checkbox' && input.attr('type') != 'button'
    }
  }
})(jQuery);

