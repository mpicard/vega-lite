import {Binding} from 'vega';
import {SingleDefUnitChannel} from './channel';
import {FieldName} from './channeldef';
import {DateTime} from './datetime';
import {EventStream} from './vega.schema';

export const SELECTION_ID = '_vgsid_';
export type SelectionType = 'single' | 'multi' | 'interval';
export type SelectionResolution = 'global' | 'union' | 'intersect';

export type SelectionInit = boolean | number | string | DateTime;
export type SelectionInitArray = boolean[] | number[] | string[] | DateTime[];
export interface SelectionInitMapping {
  [key: string]: SelectionInit;
}

export interface SelectionInitArrayMapping {
  [key: string]: SelectionInitArray;
}

export interface BaseSelectionDef {
  /**
   * A [Vega event stream](https://vega.github.io/vega/docs/event-streams/) (object or selector) that triggers the selection.
   * For interval selections, the event stream must specify a [start and end](https://vega.github.io/vega/docs/event-streams/#between-filters).
   */
  on?: EventStream;
  /**
   * With layered and multi-view displays, a strategy that determines how
   * selections' data queries are resolved when applied in a filter transform,
   * conditional encoding rule, or scale domain.
   *
   */
  resolve?: SelectionResolution;

  // TODO(https://github.com/vega/vega-lite/issues/2596).
  // predicate?: string;
  // domain?: SelectionDomain;

  // Transforms

  /**
   * An array of encoding channels. The corresponding data field values
   * must match for a data tuple to fall within the selection.
   */
  encodings?: SingleDefUnitChannel[];

  /**
   * An array of field names whose values must match for a data tuple to
   * fall within the selection.
   */
  fields?: FieldName[];

  /**
   * By default, `all` data values are considered to lie within an empty selection.
   * When set to `none`, empty selections contain no data values.
   */
  empty?: 'all' | 'none';
}

export interface SingleSelectionConfig extends BaseSelectionDef {
  /**
   * Clears the selection, emptying it of all values. Can be an
   * [EventStream](https://vega.github.io/vega/docs/event-streams/) or `false` to disable.
   *
   * __Default value:__ `dblclick`.
   *
   * See the [clear](https://vega.github.io/vega-lite/docs/clear.html) documentation for more information.
   */
  clear?: EventStream | boolean;
  /**
   * Establish a two-way binding between a single selection and input elements
   * (also known as dynamic query widgets). A binding takes the form of
   * Vega's [input element binding definition](https://vega.github.io/vega/docs/signals/#bind)
   * or can be a mapping between projected field/encodings and binding definitions.
   *
   * See the [bind transform](https://vega.github.io/vega-lite/docs/bind.html) documentation for more information.
   */
  bind?: Binding | {[key: string]: Binding};

  /**
   * When true, an invisible voronoi diagram is computed to accelerate discrete
   * selection. The data value _nearest_ the mouse cursor is added to the selection.
   *
   * See the [nearest transform](https://vega.github.io/vega-lite/docs/nearest.html) documentation for more information.
   */
  nearest?: boolean;

  /**
   * Initialize the selection with a mapping between [projected channels or field names](https://vega.github.io/vega-lite/docs/project.html) and initial values.
   */
  init?: SelectionInitMapping;
}

export interface MultiSelectionConfig extends BaseSelectionDef {
  /**
   * Clears the selection, emptying it of all values. Can be an
   * [EventStream](https://vega.github.io/vega/docs/event-streams/) or `false` to disable.
   *
   * __Default value:__ `dblclick`.
   *
   * See the [clear](https://vega.github.io/vega-lite/docs/clear.html) documentation for more information.
   */
  clear?: EventStream | boolean;

  /**
   * Controls whether data values should be toggled or only ever inserted into
   * multi selections. Can be `true`, `false` (for insertion only), or a
   * [Vega expression](https://vega.github.io/vega/docs/expressions/).
   *
   * __Default value:__ `true`, which corresponds to `event.shiftKey` (i.e.,
   * data values are toggled when a user interacts with the shift-key pressed).
   *
   * See the [toggle transform](https://vega.github.io/vega-lite/docs/toggle.html) documentation for more information.
   */
  toggle?: string | boolean;

  /**
   * When true, an invisible voronoi diagram is computed to accelerate discrete
   * selection. The data value _nearest_ the mouse cursor is added to the selection.
   *
   * See the [nearest transform](https://vega.github.io/vega-lite/docs/nearest.html) documentation for more information.
   */
  nearest?: boolean;

  /**
   * Initialize the selection with a mapping between [projected channels or field names](https://vega.github.io/vega-lite/docs/project.html) and an initial
   * value (or array of values).
   */
  init?: SelectionInitMapping | SelectionInitMapping[];
}

export interface BrushConfig {
  /**
   * The fill color of the interval mark.
   *
   * __Default value:__ `#333333`
   *
   */
  fill?: string;
  /**
   * The fill opacity of the interval mark (a value between 0 and 1).
   *
   * __Default value:__ `0.125`
   */
  fillOpacity?: number;
  /**
   * The stroke color of the interval mark.
   *
   * __Default value:__ `#ffffff`
   */
  stroke?: string;
  /**
   * The stroke opacity of the interval mark (a value between 0 and 1).
   */
  strokeOpacity?: number;
  /**
   * The stroke width of the interval mark.
   */
  strokeWidth?: number;
  /**
   * An array of alternating stroke and space lengths,
   * for creating dashed or dotted lines.
   */
  strokeDash?: number[];
  /**
   * The offset (in pixels) with which to begin drawing the stroke dash array.
   */
  strokeDashOffset?: number;
}

export interface IntervalSelectionConfig extends BaseSelectionDef {
  /**
   * Clears the selection, emptying it of all values. Can be an
   * [EventStream](https://vega.github.io/vega/docs/event-streams/) or `false` to disable.
   *
   * __Default value:__ `dblclick`.
   *
   * See the [clear](https://vega.github.io/vega-lite/docs/clear.html) documentation for more information.
   */
  clear?: EventStream | boolean;
  /**
   * When truthy, allows a user to interactively move an interval selection
   * back-and-forth. Can be `true`, `false` (to disable panning), or a
   * [Vega event stream definition](https://vega.github.io/vega/docs/event-streams/)
   * which must include a start and end event to trigger continuous panning.
   *
   * __Default value:__ `true`, which corresponds to
   * `[mousedown, window:mouseup] > window:mousemove!` which corresponds to
   * clicks and dragging within an interval selection to reposition it.
   */
  translate?: string | boolean;

  /**
   * When truthy, allows a user to interactively resize an interval selection.
   * Can be `true`, `false` (to disable zooming), or a [Vega event stream
   * definition](https://vega.github.io/vega/docs/event-streams/). Currently,
   * only `wheel` events are supported.
   *
   *
   * __Default value:__ `true`, which corresponds to `wheel!`.
   */
  zoom?: string | boolean;

  /**
   * Establishes a two-way binding between the interval selection and the scales
   * used within the same view. This allows a user to interactively pan and
   * zoom the view.
   */
  bind?: 'scales';

  /**
   * An interval selection also adds a rectangle mark to depict the
   * extents of the interval. The `mark` property can be used to customize the
   * appearance of the mark.
   */
  mark?: BrushConfig;

  /**
   * Initialize the selection with a mapping between [projected channels or field names](https://vega.github.io/vega-lite/docs/project.html) and arrays of
   * initial values.
   */
  init?: SelectionInitArrayMapping;
}

export interface SingleSelection extends SingleSelectionConfig {
  type: 'single';
}

export interface MultiSelection extends MultiSelectionConfig {
  type: 'multi';
}

export interface IntervalSelection extends IntervalSelectionConfig {
  type: 'interval';
}

export type SelectionDef = SingleSelection | MultiSelection | IntervalSelection;

export function isIntervalSelection(s: SelectionDef): s is IntervalSelection {
  return s.type === 'interval';
}

export interface SelectionConfig {
  /**
   * The default definition for a [`single`](https://vega.github.io/vega-lite/docs/selection.html#type) selection. All properties and transformations
   *  for a single selection definition (except `type`) may be specified here.
   *
   * For instance, setting `single` to `{"on": "dblclick"}` populates single selections on double-click by default.
   */
  single?: SingleSelectionConfig;
  /**
   * The default definition for a [`multi`](https://vega.github.io/vega-lite/docs/selection.html#type) selection. All properties and transformations
   * for a multi selection definition (except `type`) may be specified here.
   *
   * For instance, setting `multi` to `{"toggle": "event.altKey"}` adds additional values to
   * multi selections when clicking with the alt-key pressed by default.
   */
  multi?: MultiSelectionConfig;
  /**
   * The default definition for an [`interval`](https://vega.github.io/vega-lite/docs/selection.html#type) selection. All properties and transformations
   * for an interval selection definition (except `type`) may be specified here.
   *
   * For instance, setting `interval` to `{"translate": false}` disables the ability to move
   * interval selections by default.
   */
  interval?: IntervalSelectionConfig;
}

export const defaultConfig: SelectionConfig = {
  single: {
    on: 'click',
    fields: [SELECTION_ID],
    resolve: 'global',
    empty: 'all',
    clear: 'dblclick'
  },
  multi: {
    on: 'click',
    fields: [SELECTION_ID],
    toggle: 'event.shiftKey',
    resolve: 'global',
    empty: 'all',
    clear: 'dblclick'
  },
  interval: {
    on: '[mousedown, window:mouseup] > window:mousemove!',
    encodings: ['x', 'y'],
    translate: '[mousedown, window:mouseup] > window:mousemove!',
    zoom: 'wheel!',
    mark: {fill: '#333', fillOpacity: 0.125, stroke: 'white'},
    resolve: 'global',
    clear: 'dblclick'
  }
};
