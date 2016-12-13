import * as log from '../../log';

import {Config} from '../../config';
import {Channel} from '../../channel';
import {ChannelDefWithScale, FieldDef} from '../../fielddef';
import {Mark} from '../../mark';
import {Scale, ScaleConfig, scaleTypeSupportProperty} from '../../scale';

import {channelScalePropertyIncompatability} from './scale';
import rangeMixins from './range';
import * as rules from './rules';
import {type} from './type';
import * as util from '../../util';

export default function init(
    channel: Channel, fieldDef: ChannelDefWithScale, config: Config,
    mark: Mark | undefined, topLevelSize: number | undefined, xyRangeSteps: number[]): Scale {
  let specifiedScale = (fieldDef || {}).scale || {};
  let scale: Scale = {};

  // Default discrete scale type depends on whether the scale can have rangeStep.
  const canHaveRangeStep = topLevelSize === undefined && specifiedScale.rangeStep !== null && config.scale.rangeStep !== null;
  scale.type = type(specifiedScale.type, fieldDef, channel, mark, canHaveRangeStep);

  // Use specified value if compatible or determine default values for each property
  [
    // general properties
    'domain', // For domain, we only copy specified value here.  Default value is determined during parsing phase.
    'round',
    // quantitative / time
    'clamp', 'nice',
    // quantitative
    'exponent', 'zero', // zero depends on domain
    // ordinal
    'padding', 'paddingInner', 'paddingOuter', // padding

    // FIXME: useRawDomain should not be included here as it is not really a Vega scale property
    'useRawDomain'
  ].forEach(function(property) {
    const specifiedValue = specifiedScale[property];

    let supportedByScaleType = scaleTypeSupportProperty(scale.type, property);
    const channelIncompatability = channelScalePropertyIncompatability(channel, property);

    if (specifiedValue !== undefined) {
      // If there is a specified value, check if it is compatible with scale type and channel
      if (!supportedByScaleType) {
        log.warn(log.message.scalePropertyNotWorkWithScaleType(scale.type, property, channel));
      } else if (channelIncompatability) { // channel
        log.warn(channelIncompatability);
      } else {
        scale[property] = specifiedValue;
      }
      return;
    } else {
      // If there is no property specified, check if we need to determine default value.
      if (supportedByScaleType && channelIncompatability === undefined) {
        const value = getDefaultValue(property, scale, channel, fieldDef, config.scale);
        if (value !== undefined) { // use the default value
          scale[property] = value;
        }
      }
    }
  });

  return util.extend(
    scale,
    rangeMixins(
      channel, scale.type, specifiedScale, config,
      fieldDef.type, scale.zero,
      mark, topLevelSize, xyRangeSteps
    )
  );
}

function getDefaultValue(property: string, scale: Scale, channel: Channel, fieldDef: FieldDef, scaleConfig: ScaleConfig) {
  // If we have default rule-base, determine default value first
  switch (property) {
    case 'nice':
      return rules.nice(scale.type, channel, fieldDef);
    case 'padding':
      return rules.padding(channel, scale.type, scaleConfig);
    case 'paddingInner':
      return rules.paddingInner(scale.padding, channel, scaleConfig);
    case 'paddingOuter':
      return rules.paddingOuter(scale.padding, channel, scale.type, scale.paddingInner, scaleConfig);
    case 'round':
      return rules.round(channel, scaleConfig);
    case 'zero':
      return rules.zero(scale, channel, fieldDef);
  }
  // Otherwise, use scale config
  return scaleConfig[property];
}

