// Package of defining Vega-lite Specification's json schema
'use strict';

require('../globals');

var schema = module.exports = {},
  util = require('../util'),
  toMap = util.toMap,
  colorbrewer = require('colorbrewer');

var VALID_AGG_OPS = require('vega/src/transforms/Aggregate').VALID_OPS;

// TODO(#620) refer to vega schema
// var vgStackSchema = require('vega/src/transforms/Stack').schema;


schema.util = require('./schemautil');

schema.marktype = {
  type: 'string',
  enum: ['point', 'tick', 'bar', 'line', 'area', 'circle', 'square', 'text']
};

schema.aggregate = {
  type: 'string',
  enum: VALID_AGG_OPS,
  supportedEnums: {
    Q: VALID_AGG_OPS,
    O: ['median','min','max'],
    N: [],
    T: ['mean', 'median', 'min', 'max'],
    '': ['count']
  },
  supportedTypes: toMap([Q, N, O, T, ''])
};

schema.getSupportedRole = function(encType) {
  return schema.schema.properties.encoding.properties[encType].supportedRole;
};

schema.timeUnits = ['year', 'month', 'day', 'date', 'hours', 'minutes', 'seconds'];

schema.defaultTimeFn = 'month';

schema.timeUnit = {
  type: 'string',
  enum: schema.timeUnits,
  supportedTypes: toMap([T])
};

schema.scale_type = {
  type: 'string',
  // TODO(kanitw) read vega's schema here, add description
  enum: ['linear', 'log', 'pow', 'sqrt', 'quantile'],
  default: 'linear',
  supportedTypes: toMap([Q])
};

schema.field = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    }
  }
};

var clone = util.duplicate;
var merge = schema.util.merge;

schema.MAXBINS_DEFAULT = 15;

var bin = {
  type: ['boolean', 'object'],
  default: false,
  properties: {
    maxbins: {
      type: 'integer',
      default: schema.MAXBINS_DEFAULT,
      minimum: 2,
      description: 'Maximum number of bins.'
    }
  },
  supportedTypes: toMap([Q]) // TODO: add O after finishing #81
};

var typicalField = merge(clone(schema.field), {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [N, O, Q, T]
    },
    aggregate: schema.aggregate,
    timeUnit: schema.timeUnit,
    bin: bin,
    scale: {
      type: 'object',
      properties: {
        /* Common Scale Properties */
        type: schema.scale_type,

        /* Quantitative Scale Properties */
        nice: {
          type: 'string',
          enum: ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
          supportedTypes: toMap([T])
        },
        zero: {
          type: 'boolean',
          description: 'Include zero',
          default: undefined,
          supportedTypes: toMap([Q, T])
        },

        /* Vega-lite only Properties */
        useRawDomain: {
          type: 'boolean',
          default: undefined,
          description: 'Use the raw data range as scale domain instead of ' +
                       'aggregated data for aggregate axis. ' +
                       'This option does not work with sum or count aggregate' +
                       'as they might have a substantially larger scale range.' +
                       'By default, use value from config.useRawDomain.'
        }
      }
    }
  }
});

var onlyOrdinalField = merge(clone(schema.field), {
  type: 'object',
  supportedRole: {
    dimension: true
  },
  properties: {
    type: {
      type: 'string',
      enum: [N, O, Q, T] // ordinal-only field supports Q when bin is applied and T when time unit is applied.
    },
    timeUnit: schema.timeUnit,
    bin: bin,
    aggregate: {
      type: 'string',
      enum: ['count'],
      supportedTypes: toMap([N, O]) // FIXME this looks weird to me
    }
  }
});

var axisMixin = {
  type: 'object',
  supportedMarktypes: {point: true, tick: true, bar: true, line: true, area: true, circle: true, square: true},
  properties: {
    axis: {
      type: 'object',
      properties: {
        /* Vega Axis Properties */
        format: {
          type: 'string',
          default: undefined,  // auto
          description: 'The formatting pattern for axis labels. '+
                       'If not undefined, this will be determined by ' +
                       'small/largeNumberFormat and the max value ' +
                       'of the field.'
        },
        grid: {
          type: 'boolean',
          default: undefined,
          description: 'A flag indicate if gridlines should be created in addition to ticks. If `grid` is unspecified, the default value is `true` for ROW and COL. For X and Y, the default value is `true` for quantitative and time fields and `false` otherwise.'
        },
        layer: {
          type: 'string',
          default: 'back',
          description: 'A string indicating if the axis (and any gridlines) should be placed above or below the data marks. One of "front" (default) or "back".'
        },
        orient: {
          type: 'string',
          default: undefined,
          enum: ['top', 'right', 'left', 'bottom'],
          description: 'The orientation of the axis. One of top, bottom, left or right. The orientation can be used to further specialize the axis type (e.g., a y axis oriented for the right edge of the chart).'
        },
        ticks: {
          type: 'integer',
          default: 5,
          minimum: 0,
          description: 'A desired number of ticks, for axes visualizing quantitative scales. The resulting number may be different so that values are "nice" (multiples of 2, 5, 10) and lie within the underlying scale\'s range.'
        },
        /* Vega Axis Properties that are automatically populated by Vega-lite */
        title: {
          type: 'string',
          default: undefined,
          description: 'A title for the axis. (Shows field name and its function by default.)'
        },
        /* Vega-lite only */
        maxLabelLength: {
          type: 'integer',
          default: 25,
          minimum: 0,
          description: 'Truncate labels that are too long.'
        },
        labelAngle: {
          type: 'integer',
          default: undefined, // auto
          minimum: 0,
          maximum: 360,
          description: 'Angle by which to rotate labels. Set to 0 to force horizontal.'
        },
        titleMaxLength: {
          type: 'integer',
          default: undefined,
          minimum: 0,
          description: 'Max length for axis title if the title is automatically generated from the field\'s description'
        },
        titleOffset: {
          type: 'integer',
          default: undefined,  // auto
          description: 'A title offset value for the axis.'
        },
      }
    }
  }
};

var sortMixin = {
  type: 'object',
  properties: {
    sort: {
      default: 'ascending',
      supportedTypes: toMap([N, O]),
      oneOf: [
        {
          type: 'string',
          enum: ['ascending', 'descending', 'unsorted']
        },
        { // sort by aggregation of another field
          type: 'object',
          required: ['field', 'op'],
          properties: {
            field: {
              type: 'string',
              description: 'The field name to aggregate over.'
            },
            op: {
              type: 'string',
              enum: VALID_AGG_OPS,
              description: 'The field name to aggregate over.'
            },
            order: {
              type: 'string',
              enum: ['ascending', 'descending']
            }
          }
        }
      ]

    }
  }
};

var bandMixin = {
  type: 'object',
  properties: {
    band: {
      type: 'object',
      properties: {
        size: {
          type: 'integer',
          minimum: 0,
          default: undefined
        },
        padding: {
          type: 'integer',
          minimum: 0,
          default: 1
        }
      }
    }
  }
};

var legendMixin = {
  type: 'object',
  properties: {
    legend: {
      type: 'object',
      description: 'Properties of a legend.',
      properties: {
        title: {
          type: 'string',
          default: undefined,
          description: 'A title for the legend. (Shows field name and its function by default.)'
        },
        orient: {
          type: 'string',
          default: 'right',
          description: 'The orientation of the legend. One of "left" or "right". This determines how the legend is positioned within the scene. The default is "right".'
        }
      }
    }
  }
};

var textMixin = {
  type: 'object',
  supportedMarktypes: {'text': true},
  properties: {
    align: {
      type: 'string',
      default: 'right'
    },
    baseline: {
      type: 'string',
      default: 'middle'
    },
    color: {
      type: 'string',
      role: 'color',
      default: '#000000'
    },
    margin: {
      type: 'integer',
      default: 4,
      minimum: 0
    },
    placeholder: {
      type: 'string',
      default: 'Abc'
    },
    font: {
      type: 'object',
      properties: {
        weight: {
          type: 'string',
          enum: ['normal', 'bold'],
          default: 'normal'
        },
        size: {
          type: 'integer',
          default: 10,
          minimum: 0
        },
        family: {
          type: 'string',
          default: 'Helvetica Neue'
        },
        style: {
          type: 'string',
          default: 'normal',
          enum: ['normal', 'italic']
        }
      }
    },
    format: {
      type: 'string',
      default: undefined,  // auto
      description: 'The formatting pattern for text value. '+
                   'If not undefined, this will be determined by ' +
                   'small/largeNumberFormat and the max value ' +
                   'of the field.'
    },
  }
};

var sizeMixin = {
  type: 'object',
  supportedMarktypes: {point: true, bar: true, circle: true, square: true, text: true},
  properties: {
    value: {
      type: 'integer',
      default: 30,
      minimum: 0,
      description: 'Size of marks.'
    }
  }
};

var colorMixin = {
  type: 'object',
  supportedMarktypes: {point: true, tick: true, bar: true, line: true, area: true, circle: true, square: true, 'text': true},
  properties: {
    value: {
      type: 'string',
      role: 'color',
      default: '#4682b4',
      description: 'Color to be used for marks.'
    },
    opacity: {
      type: 'number',
      default: undefined,  // auto
      minimum: 0,
      maximum: 1
    },
    scale: {
      type: 'object',
      properties: {
        range: {
          type: ['string', 'array'],
          default: undefined,
          description:
            'Color palette, if undefined vega-lite will use data property' +
            'to pick one from c10palette, c20palette, or ordinalPalette.'
            //FIXME
        },
        c10palette: {
          type: 'string',
          default: 'category10',
          enum: [
            // Tableau
            'category10', 'category10k',
            // Color Brewer
            'Pastel1', 'Pastel2', 'Set1', 'Set2', 'Set3'
          ]
        },
        c20palette: {
          type: 'string',
          default: 'category20',
          enum: ['category20', 'category20b', 'category20c']
        },
        ordinalPalette: {
          type: 'string',
          default: undefined,
          description: 'Color palette to encode ordinal variables.',
          enum: util.keys(colorbrewer)
        },
        quantitativeRange: {
          type: 'array',
          default: ['#AFC6A3', '#09622A'], // tableau greens
          // default: ['#ccece6', '#00441b'], // BuGn.9 [2-8]
          description: 'Color range to encode quantitative variables.',
          minItems: 2,
          maxItems: 2,
          items: {
            type: 'string',
            role: 'color'
          }
        }
      }
    }
  }
};

var stackMixin = {
  type: 'object',
  properties: {
    stack: {
      type: ['boolean', 'object'],
      default: true,
      description: 'Enable stacking (for bar and area marks only).',
      properties: {
        reverse: {
          type: 'boolean',
          default: false,
          description: 'Whether to reverse the stack\'s sortby.'
        },
        offset: {
          type: 'string',
          default: undefined,
          enum: ['zero', 'center', 'normalize']
          // TODO(#620) refer to Vega spec once it doesn't throw error
          // enum: vgStackSchema.properties.offset.oneOf[0].enum
        }
      }
    }
  }
};

var shapeMixin = {
  type: 'object',
  supportedMarktypes: {point: true, circle: true, square: true},
  properties: {
    value: {
      type: 'string',
      enum: ['circle', 'square', 'cross', 'diamond', 'triangle-up', 'triangle-down'],
      default: 'circle',
      description: 'Mark to be used.'
    },
    filled: {
      type: 'boolean',
      default: false,
      description: 'Whether the shape\'s color should be used as fill color instead of stroke color.'
    }
  }
};

var detailMixin = {
  type: 'object',
  supportedMarktypes: {point: true, tick: true, line: true, circle: true, square: true}
};

var rowMixin = {
  properties: {
    height: {
      type: 'number',
      minimum: 0,
      default: 150
    }
  }
};

var colMixin = {
  properties: {
    width: {
      type: 'number',
      minimum: 0,
      default: 150
    },
    axis: {
      properties: {
        maxLabelLength: {
          type: 'integer',
          default: 12,
          minimum: 0,
          description: 'Truncate labels that are too long.'
        }
      }
    }
  }
};

var facetMixin = {
  type: 'object',
  supportedMarktypes: {point: true, tick: true, bar: true, line: true, area: true, circle: true, square: true, text: true},
  properties: {
    padding: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      default: 0.1
    }
  }
};

var requiredNameType = {
  required: ['name', 'type']
};

var multiRoleField = merge(clone(typicalField), {
  supportedRole: {
    measure: true,
    dimension: true
  }
});

var quantitativeField = merge(clone(typicalField), {
  supportedRole: {
    measure: true,
    dimension: 'ordinal-only' // using size to encoding category lead to order interpretation
  }
});

var onlyQuantitativeField = merge(clone(typicalField), {
  supportedRole: {
    measure: true
  }
});

var x = merge(clone(multiRoleField), axisMixin, bandMixin, requiredNameType, sortMixin);
var y = clone(x);

var facet = merge(clone(onlyOrdinalField), requiredNameType, facetMixin, sortMixin);
var row = merge(clone(facet), axisMixin, rowMixin);
var col = merge(clone(facet), axisMixin, colMixin);

var size = merge(clone(quantitativeField), legendMixin, sizeMixin, sortMixin);
var color = merge(clone(multiRoleField), legendMixin, colorMixin, stackMixin, sortMixin);

var shape = merge(clone(onlyOrdinalField), legendMixin, shapeMixin, sortMixin);
var detail = merge(clone(onlyOrdinalField), detailMixin, stackMixin, sortMixin);

// we only put aggregated measure in pivot table
var text = merge(clone(onlyQuantitativeField), textMixin, sortMixin);

// TODO add label

var data = {
  type: 'object',
  properties: {
    // data source
    formatType: {
      type: 'string',
      enum: ['json', 'csv'],
      default: 'json'
    },
    url: {
      type: 'string',
      default: undefined
    },
    values: {
      type: 'array',
      default: undefined,
      description: 'Pass array of objects instead of a url to a file.',
      items: {
        type: 'object',
        additionalProperties: true
      }
    },
    // we generate a vega filter transform
    filter: {
      type: 'string',
      default: undefined,
      description: 'A string containing the filter Vega expression. Use `datum` to refer to the current data object.'
    },
    // we generate a vega formula transform
    formulas: {
      type: 'array',
      default: undefined,
      description: 'Array of formula transforms. Formulas are applied before filter.',
      items: {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            description: 'The property name in which to store the computed formula value.'
          },
          expr: {
            type: 'string',
            description: 'A string containing an expression for the formula. Use the variable `datum` to to refer to the current data object.'
          }
        }
      }
    }
  }
};

var config = {
  type: 'object',
  properties: {
    // template
    width: {
      type: 'integer',
      default: undefined
    },
    height: {
      type: 'integer',
      default: undefined
    },
    viewport: {
      type: 'array',
      items: {
        type: 'integer'
      },
      default: undefined
    },
    gridColor: {
      type: 'string',
      role: 'color',
      default: '#000000'
    },
    gridOpacity: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      default: 0.08
    },

    // filter null
    // TODO(#597) revise this config
    filterNull: {
      type: 'object',
      properties: {
        N: {type:'boolean', default: false},
        O: {type:'boolean', default: false},
        Q: {type:'boolean', default: true},
        T: {type:'boolean', default: true}
      }
    },
    autoSortLine: {
      type: 'boolean',
      default: true
    },

    // single plot
    singleHeight: {
      // will be overwritten by bandWidth * (cardinality + padding)
      type: 'integer',
      default: 200,
      minimum: 0
    },
    singleWidth: {
      // will be overwritten by bandWidth * (cardinality + padding)
      type: 'integer',
      default: 200,
      minimum: 0
    },
    // band size
    largeBandSize: {
      type: 'integer',
      default: 21,
      minimum: 0
    },
    smallBandSize: {
      //small multiples or single plot with high cardinality
      type: 'integer',
      default: 12,
      minimum: 0
    },
    largeBandMaxCardinality: {
      type: 'integer',
      default: 10
    },
    // small multiples
    cellPadding: {
      type: 'number',
      default: 0.1
    },
    cellGridColor: {
      type: 'string',
      role: 'color',
      default: '#000000'
    },
    cellGridOpacity: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      default: 0.25
    },
    cellGridOffset: {
      type: 'number',
      default: 6 // equal to tickSize
    },
    cellBackgroundColor: {
      type: 'string',
      role: 'color',
      default: 'rgba(0,0,0,0)'
    },
    textCellWidth: {
      type: 'integer',
      default: 90,
      minimum: 0
    },

    // marks
    strokeWidth: {
      type: 'integer',
      default: 2,
      minimum: 0
    },
    singleBarOffset: {
      type: 'integer',
      default: 5,
      minimum: 0
    },
    // scales
    timeScaleLabelLength: {
      type: 'integer',
      default: 3,
      minimum: 0,
      description: 'Max length for values in dayScaleLabel and monthScaleLabel.  Zero means using full names in dayScaleLabel/monthScaleLabel.'
    },
    dayScaleLabel: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      description: 'Axis labels for day of week, starting from Sunday.' +
        '(Consistent with Javascript -- See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay.'
    },
    monthScaleLabel: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      description: 'Axis labels for month.'
    },
    // other
    characterWidth: {
      type: 'integer',
      default: 6
    },
    maxSmallNumber: {
      type: 'number',
      default: 10000,
      description: 'maximum number that a field will be considered smallNumber.'+
                   'Used for axis labelling.'
    },
    smallNumberFormat: {
      type: 'string',
      default: '',
      description: 'D3 Number format for axis labels and text tables '+
                   'for number <= maxSmallNumber. Used for axis labelling.'
    },
    largeNumberFormat: {
      type: 'string',
      default: '.3s',
      description: 'D3 Number format for axis labels and text tables ' +
                   'for number > maxSmallNumber.'
    },
    timeFormat: {
      type: 'string',
      default: '%Y-%m-%d',
      description: 'Date format for axis labels.'
    },
    useRawDomain: {
      type: 'boolean',
      default: false,
      description: 'Use the raw data range as scale domain instead of ' +
                   'aggregated data for aggregate axis. ' +
                   'This option does not work with sum or count aggregate' +
                   'as they might have a substantially larger scale range.' +
                   'By default, use value from config.useRawDomain.'
    }
  }
};

/** @type Object Schema of a vega-lite specification */
schema.schema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  description: 'Schema for Vega-lite specification',
  type: 'object',
  required: ['marktype', 'encoding', 'data'],
  properties: {
    data: data,
    marktype: schema.marktype,
    encoding: {
      type: 'object',
      properties: {
        x: x,
        y: y,
        row: row,
        col: col,
        size: size,
        color: color,
        shape: shape,
        text: text,
        detail: detail
      }
    },
    config: config
  }
};

schema.encTypes = util.keys(schema.schema.properties.encoding.properties);

/** Instantiate a verbose vl spec from the schema */
schema.instantiate = function() {
  return schema.util.instantiate(schema.schema);
};
