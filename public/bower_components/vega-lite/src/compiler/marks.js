'use strict';

require('../globals');

var marks = module.exports = {};

marks.def = function(encoding, layout, style, stats) {

  var defs = [],
    mark = marks[encoding.marktype()],
    from = encoding.dataTable();

  // to add a background to text, we need to add it before the text
  if (encoding.marktype() === TEXT && encoding.has(COLOR)) {
    var bg = {
      x: {value: 0},
      y: {value: 0},
      x2: {value: layout.cellWidth},
      y2: {value: layout.cellHeight},
      fill: {scale: COLOR, field: encoding.fieldRef(COLOR)}
    };
    defs.push({
      type: 'rect',
      from: {data: from},
      properties: {enter: bg, update: bg}
    });
  }

  // add the mark def for the main thing
  var p = mark.prop(encoding, layout, style, stats);
  defs.push({
    type: mark.type,
    from: {data: from},
    properties: {enter: p, update: p}
  });

  return defs;
};

marks.bar = {
  type: 'rect',
  prop: bar_props,
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, size: 1, color: 1}
};

marks.line = {
  type: 'line',
  line: true,
  prop: line_props,
  requiredEncoding: ['x', 'y'],
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, color: 1, detail:1}
};

marks.area = {
  type: 'area',
  line: true,
  requiredEncoding: ['x', 'y'],
  prop: area_props,
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, color: 1}
};

marks.tick = {
  type: 'rect',
  prop: tick_props,
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, color: 1, detail: 1}
};

marks.circle = {
  type: 'symbol',
  prop: filled_point_props('circle'),
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, size: 1, color: 1, detail: 1}
};

marks.square = {
  type: 'symbol',
  prop: filled_point_props('square'),
  supportedEncoding: marks.circle.supportedEncoding
};

marks.point = {
  type: 'symbol',
  prop: point_props,
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, size: 1, color: 1, shape: 1, detail: 1}
};

marks.text = {
  type: 'text',
  prop: text_props,
  requiredEncoding: ['text'],
  supportedEncoding: {row: 1, col: 1, size: 1, color: 1, text: 1}
};

function bar_props(e, layout, style) {
  // jshint unused:false

  var p = {};

  // x's and width
  if (e.encDef(X).bin) {
    p.x = {scale: X, field: e.fieldRef(X, {bin_suffix: '_start'}), offset: 1};
    p.x2 = {scale: X, field: e.fieldRef(X, {bin_suffix: '_end'})};
  } else if (e.isMeasure(X)) {
    p.x = {scale: X, field: e.fieldRef(X)};
    if (!e.has(Y) || e.isDimension(Y)) {
      p.x2 = {value: 0};
    }
  } else {
    if (e.has(X)) { // is ordinal
       p.xc = {scale: X, field: e.fieldRef(X)};
    } else {
       p.x = {value: 0, offset: e.config('singleBarOffset')};
    }
  }

  // width
  if (!p.x2) {
    if (!e.has(X) || e.isOrdinalScale(X)) { // no X or X is ordinal
      if (e.has(SIZE)) {
        p.width = {scale: SIZE, field: e.fieldRef(SIZE)};
      } else {
        p.width = {
          value: e.bandSize(X, layout.x.useSmallBand),
          offset: -1
        };
      }
    } else { // X is Quant or Time Scale
      p.width = {value: 2};
    }
  }

  // y's & height
  if (e.encDef(Y).bin) {
    p.y = {scale: Y, field: e.fieldRef(Y, {bin_suffix: '_start'})};
    p.y2 = {scale: Y, field: e.fieldRef(Y, {bin_suffix: '_end'}), offset: 1};
  } else if (e.isMeasure(Y)) {
    p.y = {scale: Y, field: e.fieldRef(Y)};
    p.y2 = {field: {group: 'height'}};
  } else {
    if (e.has(Y)) { // is ordinal
      p.yc = {scale: Y, field: e.fieldRef(Y)};
    } else {
      p.y2 = {
        field: {group: 'height'},
        offset: -e.config('singleBarOffset')
      };
    }

    if (e.has(SIZE)) {
      p.height = {scale: SIZE, field: e.fieldRef(SIZE)};
    } else {
      p.height = {
        value: e.bandSize(Y, layout.y.useSmallBand),
        offset: -1
      };
    }
  }

  // fill
  if (e.has(COLOR)) {
    p.fill = {scale: COLOR, field: e.fieldRef(COLOR)};
  } else {
    p.fill = {value: e.value(COLOR)};
  }

  // opacity
  var opacity = e.encDef(COLOR).opacity;
  if (opacity) p.opacity = {value: opacity};

  return p;
}

function point_props(e, layout, style) {
  var p = {};

  // x
  if (e.has(X)) {
    p.x = {scale: X, field: e.fieldRef(X, {bin_suffix: '_mid'})};
  } else if (!e.has(X)) {
    p.x = {value: e.bandSize(X, layout.x.useSmallBand) / 2};
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.fieldRef(Y, {bin_suffix: '_mid'})};
  } else if (!e.has(Y)) {
    p.y = {value: e.bandSize(Y, layout.y.useSmallBand) / 2};
  }

  // size
  if (e.has(SIZE)) {
    p.size = {scale: SIZE, field: e.fieldRef(SIZE)};
  } else if (!e.has(SIZE)) {
    p.size = {value: e.value(SIZE)};
  }

  // shape
  if (e.has(SHAPE)) {
    p.shape = {scale: SHAPE, field: e.fieldRef(SHAPE)};
  } else if (!e.has(SHAPE)) {
    p.shape = {value: e.value(SHAPE)};
  }

  // fill or stroke
  if (e.encDef(SHAPE).filled) {
    if (e.has(COLOR)) {
      p.fill = {scale: COLOR, field: e.fieldRef(COLOR)};
    } else if (!e.has(COLOR)) {
      p.fill = {value: e.value(COLOR)};
    }
  } else {
    if (e.has(COLOR)) {
      p.stroke = {scale: COLOR, field: e.fieldRef(COLOR)};
    } else if (!e.has(COLOR)) {
      p.stroke = {value: e.value(COLOR)};
    }
    p.strokeWidth = {value: e.config('strokeWidth')};
  }

  // opacity
  var opacity = e.encDef(COLOR).opacity || style.opacity;
  if (opacity) p.opacity = {value: opacity};

  return p;
}

function line_props(e,layout, style) {
  // jshint unused:false
  var p = {};

  // x
  if (e.has(X)) {
    p.x = {scale: X, field: e.fieldRef(X, {bin_suffix: '_mid'})};
  } else if (!e.has(X)) {
    p.x = {value: 0};
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.fieldRef(Y, {bin_suffix: '_mid'})};
  } else if (!e.has(Y)) {
    p.y = {field: {group: 'height'}};
  }

  // stroke
  if (e.has(COLOR)) {
    p.stroke = {scale: COLOR, field: e.fieldRef(COLOR)};
  } else if (!e.has(COLOR)) {
    p.stroke = {value: e.value(COLOR)};
  }

  var opacity = e.encDef(COLOR).opacity;
  if (opacity) p.opacity = {value: opacity};

  p.strokeWidth = {value: e.config('strokeWidth')};

  return p;
}

// TODO(#694): optimize area's usage with bin
function area_props(e, layout, style) {
  // jshint unused:false
  var p = {};

  // x
  if (e.isMeasure(X)) {
    p.x = {scale: X, field: e.fieldRef(X)};
    if (e.isDimension(Y)) {
      p.x2 = {scale: X, value: 0};
      p.orient = {value: 'horizontal'};
    }
  } else if (e.has(X)) {
    p.x = {scale: X, field: e.fieldRef(X, {bin_suffix: '_mid'})};
  } else {
    p.x = {value: 0};
  }

  // y
  if (e.isMeasure(Y)) {
    p.y = {scale: Y, field: e.fieldRef(Y)};
    p.y2 = {scale: Y, value: 0};
  } else if (e.has(Y)) {
    p.y = {scale: Y, field: e.fieldRef(Y, {bin_suffix: '_mid'})};
  } else {
    p.y = {field: {group: 'height'}};
  }

  // fill
  if (e.has(COLOR)) {
    p.fill = {scale: COLOR, field: e.fieldRef(COLOR)};
  } else if (!e.has(COLOR)) {
    p.fill = {value: e.value(COLOR)};
  }

  var opacity = e.encDef(COLOR).opacity;
  if (opacity) p.opacity = {value: opacity};

  return p;
}

function tick_props(e, layout, style) {
  var p = {};

  // x
  if (e.has(X)) {
    p.x = {scale: X, field: e.fieldRef(X, {bin_suffix: '_mid'})};
    if (e.isDimension(X)) {
      p.x.offset = -e.bandSize(X, layout.x.useSmallBand) / 3;
    }
  } else if (!e.has(X)) {
    p.x = {value: 0};
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.fieldRef(Y, {bin_suffix: '_mid'})};
    if (e.isDimension(Y)) {
      p.y.offset = -e.bandSize(Y, layout.y.useSmallBand) / 3;
    }
  } else if (!e.has(Y)) {
    p.y = {value: 0};
  }

  // width
  if (!e.has(X) || e.isDimension(X)) {
    // TODO(#694): optimize tick's width for bin
    p.width = {value: e.bandSize(X, layout.y.useSmallBand) / 1.5};
  } else {
    p.width = {value: 1};
  }

  // height
  if (!e.has(Y) || e.isDimension(Y)) {
    // TODO(#694): optimize tick's height for bin
    p.height = {value: e.bandSize(Y, layout.y.useSmallBand) / 1.5};
  } else {
    p.height = {value: 1};
  }

  // fill
  if (e.has(COLOR)) {
    p.fill = {scale: COLOR, field: e.fieldRef(COLOR)};
  } else {
    p.fill = {value: e.value(COLOR)};
  }

  var opacity = e.encDef(COLOR).opacity  || style.opacity;
  if(opacity) p.opacity = {value: opacity};

  return p;
}

function filled_point_props(shape) {
  return function(e, layout, style) {
    var p = {};

    // x
    if (e.has(X)) {
      p.x = {scale: X, field: e.fieldRef(X, {bin_suffix: '_mid'})};
    } else if (!e.has(X)) {
      p.x = {value: e.bandSize(X, layout.x.useSmallBand) / 2};
    }

    // y
    if (e.has(Y)) {
      p.y = {scale: Y, field: e.fieldRef(Y, {bin_suffix: '_mid'})};
    } else if (!e.has(Y)) {
      p.y = {value: e.bandSize(Y, layout.y.useSmallBand) / 2};
    }

    // size
    if (e.has(SIZE)) {
      p.size = {scale: SIZE, field: e.fieldRef(SIZE)};
    } else if (!e.has(X)) {
      p.size = {value: e.value(SIZE)};
    }

    // shape
    p.shape = {value: shape};

    // fill
    if (e.has(COLOR)) {
      p.fill = {scale: COLOR, field: e.fieldRef(COLOR)};
    } else if (!e.has(COLOR)) {
      p.fill = {value: e.value(COLOR)};
    }

    var opacity = e.encDef(COLOR).opacity  || style.opacity;
    if(opacity) p.opacity = {value: opacity};

    return p;
  };
}

function text_props(e, layout, style, stats) {
  var p = {},
    encDef = e.encDef(TEXT);

  // x
  if (e.has(X)) {
    p.x = {scale: X, field: e.fieldRef(X, {bin_suffix: '_mid'})};
  } else if (!e.has(X)) {
    if (e.has(TEXT) && e.isType(TEXT, Q)) {
      p.x = {value: layout.cellWidth-5};
    } else {
      p.x = {value: e.bandSize(X, layout.x.useSmallBand) / 2};
    }
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.fieldRef(Y, {bin_suffix: '_mid'})};
  } else if (!e.has(Y)) {
    p.y = {value: e.bandSize(Y, layout.y.useSmallBand) / 2};
  }

  // size
  if (e.has(SIZE)) {
    p.fontSize = {scale: SIZE, field: e.fieldRef(SIZE)};
  } else if (!e.has(SIZE)) {
    p.fontSize = {value: encDef.font.size};
  }

  // fill
  // color should be set to background
  p.fill = {value: encDef.color};

  var opacity = e.encDef(COLOR).opacity  || style.opacity;
  if(opacity) p.opacity = {value: opacity};

  // text
  if (e.has(TEXT)) {
    if (e.isType(TEXT, Q)) {
      var fieldStats = stats[e.encDef(TEXT).name],
        numberFormat = encDef.format || e.numberFormat(fieldStats);

      p.text = {template: '{{' + e.fieldRef(TEXT, {datum: true}) + ' | number:\'' +
        numberFormat +'\'}}'};
      p.align = {value: encDef.align};
    } else {
      p.text = {field: e.fieldRef(TEXT)};
    }
  } else {
    p.text = {value: encDef.placeholder};
  }

  p.font = {value: encDef.font.family};
  p.fontWeight = {value: encDef.font.weight};
  p.fontStyle = {value: encDef.font.style};
  p.baseline = {value: encDef.baseline};

  return p;
}
