//
// Define our plugin. The name field must match the
// name field in our Plugin model.
exo.api.definePlugin('External', {playerCompatible: true}, function(registrar) {

var FieldsControl = Backbone.View.extend({
  initialize: function() {
    this.ctx = this.model.getCtx();
    this.model.selected.on('updateSelected', this.selectionChanged, this);
  },

  selectionChanged: function() {
    this.$el.append('Selection changed: '+
        this.model.selected.map(function(n) { return n.get('name'); }).join(', ')+
        '<br>');
  },

  events: {
    'click .createField': 'createField',
    'click .createRule': 'createRule',
    'click .adjustViewport': 'adjustViewport',
    'click .assignView': 'assignView',
    'click .closeView': 'closeView'
  },

  createField: function(e) {
    e.preventDefault();
    if (!this.ctx('%Fields').length) {
      this.ctx('%Scene').addNode('Fields', 'Fields');
    }
    var name = this.$('.fieldName').val();
    this.ctx('%Fields').addNode(name, 'Field');
  },

  createRule: function(e) {
    e.preventDefault();
    if (!this.ctx('%Rules').length) {
      this.ctx('%Scene').addNode('Rules', 'Rules');
    }
    var name = this.$('.ruleName').val();
    this.ctx('%Rules').addNode(name, 'Rule');
  },

  adjustViewport: function(e) {
    e.preventDefault();
    var viewport = this.$('.viewportPosition').val();
    var direction = this.$('.viewportDirection').val();
    this.model.adjustViewport(viewport, direction);
  },

  assignView: function(e) {
    this.model.openView(this.$('.assignViewTo').val(), 'Rules');
  },

  closeView: function(e) {
    this.model.closeView(this.$('.assignViewTo').val());
  },

  render: function() {
    var style = "width: 150px; padding: 5px; margin: 5px 20px 0 0;";
    var positions = _.map(['','topleft','topright','bottomleft','bottomright'], function(p) {
      return '<option>'+p+'</option>';
    }).join('');
    var directions = _.map(['','maximize','minimize','horizontal','vertical'], function(p) {
      return '<option>'+p+'</option>';
    }).join('');
    this.$el.html('<h1>Configurator</h1><ul>'+
                  '<li><input class="fieldName" style="'+style+'" value="Field" /><button class="btn createField">Create Field</button></li>'+
                  '<li><input class="ruleName" style="'+style+'" value="Rule" /><button class="btn createRule">Create Rule</button></li>'+
                  '</ul>'+
                  '<select style="width: 100px;" class="viewportPosition">'+positions+'</select>'+
                  '<select style="width: 100px;" class="viewportDirection">'+directions+'</select>'+
                  '<button class="btn adjustViewport">Adjust</button><br>'+
                  '<select style="width: 100px;" class="assignViewTo">'+positions+'</select>'+
                  '<button class="btn assignView">Rules</button>'+
                  '<button class="btn closeView">Close</button><br>'
                 );
  }
});

var RulesDisplay = Backbone.View.extend({
  initialize: function() {
    this.ctx = this.model.getCtx();
    this.rules = this.ctx('%Rules').first();
    this.ruleNodes = {};
    if (this.rules) {
      this.rules.on('dirty', this.rulesDirty, this);
      this.rules.nodes.each(function(rule) {
        this.ruleNodes[rule.id] = rule.version;
      }, this);
    }
    this.fields = this.ctx('%Fields').first();
    this.fieldNodes = {};
    if (this.fields) {
      this.fields.on('dirty', this.fieldsDirty, this);
      this.fields.nodes.each(function(field) {
        this.fieldNodes[field.id] = field.version;
      }, this);
    }
  },

  events: {
    'click .refresh': 'render'
  },

  fieldsDirty: function() {
    this.fields.nodes.each(function(field) {
      if (!this.fieldNodes[field.id]) {
        console.log('field node added', field);
      } else if (this.fieldNodes[field.id] !== field.version) {
        console.log('field node changed: ', field.get('name'), this.fieldNodes[field.id], field.version);
      }
      this.fieldNodes[field.id] = field.version;
    }, this);
  },

  rulesDirty: function() {
    this.rules.nodes.each(function(rule) {
      if (!this.ruleNodes[rule.id]) {
        console.log('rule node added', rule);
        this.ruleNodes[rule.id] = rule;
      } else if (this.ruleNodes[rule.id] !== rule.version) {
        console.log('rule node changed: ', rule.get('name'));
      }
      this.ruleNodes[rule.id] = rule.version;
    }, this);
  },

  render: function() {
    var result = '<p><button class="btn refresh">Refresh</button></p><ul>';
    this.ctx('%Rule').each(function(rule) {
      result += '<li>' + rule.get('name') + '</li>';
    });
    result += '</ul>'
    this.$el.html(result);
  }
});

registrar.defineOperator({
  name: 'Field',
  deletable: false,
  targets: [ 'Properties' ],
  target: 'Properties',

  //icon: '//exocortex.com/path/to/icon.png'

  schema: {
    xlength: {label: 'X Length', type: 'Integer', defaultValue: 0 },
    ylength: {label: 'Y Length', type: 'Integer', defaultValue: 0 },
    rule: {label: 'Rule', type: 'TextArea', defaultValue: 'Hey' },
    icon: {label: "Icon", type: "Options", defaultValue: 'two', display: "Dropdown", values: ['one','two','three']},
  },

  create: function(operator, primitive) {
    _.each(this.schema, function(val, key) {
      primitive[key] = operator.get(key);
    });
    return primitive;
  },

  ui: function(panel) {
    panel.addProperties(['xlength','ylength','icon']);

    var shadow = panel.addGroup({key: 'rulegroup', label: 'Rule', hidden: false });
    shadow.addProperties(['rule']);

    $('.External-Field-icon select').select2({
      dropdownCssClass: 'glyphicons',
      containerCssClass: 'glyphicons'
    });
  },

  uiUpdate: function(panel, operator) {
    panel.setVisibility({
      icon: operator.get('xlength') > 10,
      rulegroup: operator.get('xlength') > 12
    });
  }
});

registrar.defineOperator({
  name: 'Rule',
  deletable: true,
  target: 'Properties',

  schema: {
    rule: {label: 'Rule', type: 'TextArea', defaultValue: '' },
  },

  create: function(operator, primitive) {
    _.each(this.schema, function(val, key) {
      primitive[key] = operator.get(key);
    });
    return primitive;
  }
});

registrar.defineOperator({
  name: 'Materials',
  deletable: true,
  target: 'Properties',

  schema: {
    rule: {label: 'Rule', type: 'TextArea', defaultValue: '' },
  },

  create: function(operator, primitive) {
    _.each(this.schema, function(val, key) {
      primitive[key] = operator.get(key);
    });
    return primitive;
  }
});

registrar.definePanel({
  where: 'right', // values 'left', 'right', 'bottom', or 'center'
  name: 'Configurator', // Tab name
  view: FieldsControl // Backbone view
});

registrar.definePanel({
  where: 'center', // values 'left', 'right', 'bottom', or 'center'
  name: 'Rules', // Tab name
  view: RulesDisplay // Backbone view
});

registrar.defineLayout('custom', {
  left: false,
  right: false,
  toolbars: [],
  bottom: false,
  viewports: [
    {viewType: 'perspective', renderType: 'realistic', fullscreen: true},
    {visible: false}, {visible: false}, {visible: false}
  ],
  label: 'Custom'
});

registrar.defineNode({
  type: 'Field',
  selectable: true,
  defaultPlugs: {
    Properties: 'External/Field'
  },
});

registrar.defineNode({
  type: 'Fields',
  name: 'Fields',
  isCollection: true,
  allowedChildren: ['Field'],
  allowedParents: ['Scene']
  //icon: '//exocortex.com/path/to/icon.png'

});

registrar.defineNode({
  type: 'Rule',
  selectable: true,
  allowedParents: ['Rules'],
  defaultPlugs: {
    Properties: 'External/Rule'
  },
});

registrar.defineNode({
  type: 'Rules',
  name: 'Rules',
  isCollection: true,
  allowedParents: ['Scene']
});

registrar.whenObjectsLoaded(function(editor) {
  console.log('external: when objects loaded', editor.scene.get('name'));
});
registrar.whenLoaded(function(editor) {
  console.log('external: when loaded', editor.scene.get('name'));
});
registrar.whenLoadedPost(function(editor) {
  console.log('external: when loaded post', editor.scene.get('name'));
});

var addStyleString = function(str) {
  var node = document.createElement('style');
  document.body.appendChild(node);
  node.innerHTML = str;
};

addStyleString('li.xlength span { color: red; }');

});
