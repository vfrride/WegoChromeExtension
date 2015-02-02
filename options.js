var default_options = {
  'actions': ['domainSubstitution', 'openInNewTab'],
  'Servers': {
    'config': {
      'action': 'domainSubstitution'
    },
    'Staging': {
      'url': 'https://staging.example.com',
      'enabled': 'true',
      'iconText': 'St',
      'color': 'orange'
    },
    'Localhost': {
      'url': 'http://localhost:3000',
      'enabled': 'false',
      'iconText': 'Lo',
      'color': 'green'
    },
    'Production': {
      'url': 'https://www.example.com',
      'enabled': 'true',
      'iconText': 'Pr',
      'color': 'red'
    }
  },
  'Quick Links': {
    'config': {
      'action': 'openInNewTab'
    },
    'Hangout (Standup)': {
      'url': 'https://plus.google.com/hangouts/',
      'enabled': 'true'
    },
    'Hangout (Generic)': {
      'url': 'https://plus.google.com/hangouts',
      'enabled': 'true'
    },
    'Trello': {
      'url': 'http://trello.com',
      'enabled': 'true'
    },
    'ChartIO': {
      'url': 'http://chartio.com',
      'enabled': 'true'
    },
    'Hubspot': {
      'url': 'http://hubspot.com',
      'enabled': 'true'
    }
  },
  'Options': {
    'config': { 'editable': 'false' },
    'loadInSeparateTab': { 'label': 'Open in New Tab',
                           'value': 'true',
                           'type': 'boolean' }
  }
};

$(document).ready(function() {
  wegotools = $('#content').WegoOptions(default_options);
});
