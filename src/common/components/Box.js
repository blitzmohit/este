// @flow
import type { Color, Theme } from '../themes/types';
import React from 'react';

// Universal styled Box component. The same API for browsers and React Native.
// Some props are ommited or limited or set to match React Native behaviour.
//  - display is always set to flex
//  - default position is relative
//  - default flex direction is column
// Use style prop for platform specific styling.

const isReactNative =
  typeof navigator === 'object' &&
  navigator.product === 'ReactNative'; // eslint-disable-line no-undef

export type BoxProps = {
  as?: () => React.Element<*>, // sitr.us/2017/01/03/flow-cookbook-react.html
  style?: (theme: Theme) => Object, // Low level deliberately not typed.

  // Maybe rhythm props.
  margin?: number | string,
  marginHorizontal?: number | string,
  marginVertical?: number | string,
  marginBottom?: number | string,
  marginLeft?: number | string,
  marginRight?: number | string,
  marginTop?: number | string,
  padding?: number | string,
  paddingHorizontal?: number | string,
  paddingVertical?: number | string,
  paddingBottom?: number | string,
  paddingLeft?: number | string,
  paddingRight?: number | string,
  paddingTop?: number | string,
  height?: number | string,
  maxHeight?: number | string,
  maxWidth?: number | string,
  minHeight?: number | string,
  minWidth?: number | string,
  width?: number | string,
  bottom?: number | string,
  left?: number | string,
  right?: number | string,
  top?: number | string,

  // Computed props.
  flex?: number,
  backgroundColor?: Color,

  // borderWidth
  // borderTopWidth
  // borderRightWidth
  // borderBottomWidth
  // borderLeftWidth

  // Just value props.
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline',
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline',
  flexBasis?: number | string,
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse',
  flexGrow?: number,
  flexShrink?: number,
  flexWrap?: 'wrap' | 'nowrap',
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around',
  opacity?: number,
  overflow?: 'visible' | 'hidden' | 'scroll',
  position?: 'absolute' | 'relative',
  zIndex?: number,
};

type BoxContext = {
  View: () => React.Element<*>,
  renderer: any, // TODO: Type it.
  theme: Theme,
};

const computeBoxStyle = (theme, {
  // Maybe rhythm props.
  margin,
  marginHorizontal,
  marginVertical,
  marginBottom,
  marginLeft,
  marginRight,
  marginTop,
  padding,
  paddingHorizontal,
  paddingVertical,
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingTop,
  height,
  maxHeight,
  maxWidth,
  minHeight,
  minWidth,
  width,
  bottom,
  left,
  right,
  top,

  // Computed props.
  flex,
  backgroundColor,

  // Just value props.
  alignItems,
  alignSelf,
  flexBasis,
  flexDirection,
  flexGrow,
  flexShrink,
  flexWrap,
  justifyContent,
  opacity,
  overflow,
  position,
  zIndex,

  ...props
}) => {
  let style = {
    // That's React Native default.
    flexDirection: 'column',
    position: 'relative',
  };
  if (!isReactNative) {
    style = { ...style, display: 'flex' }; // Enforce React Native behaviour.
  }

  // Maybe rhythm props.
  // Don't sort it. Margin < marginHorizontal < marginLeft | marginRight.
  const maybeRhythmProps = {
    margin,
    marginHorizontal,
    marginVertical,
    marginBottom,
    marginLeft,
    marginRight,
    marginTop,
    padding,
    paddingHorizontal,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingVertical,
    height,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    width,
    bottom,
    left,
    right,
    top,
  };

  for (const prop in maybeRhythmProps) { // eslint-disable-line guard-for-in, no-restricted-syntax
    const value = maybeRhythmProps[prop];
    const isNumber = typeof value === 'number';
    const isDefined = isNumber || value;
    if (!isDefined) continue; // eslint-disable-line no-continue
    const computedValue = isNumber ? theme.typography.rhythm(value) : value;
    switch (prop) {
      case 'marginHorizontal':
        style = { ...style, marginLeft: computedValue, marginRight: computedValue };
        break;
      case 'marginVertical':
        style = { ...style, marginTop: computedValue, marginBottom: computedValue };
        break;
      case 'paddingHorizontal':
        style = { ...style, paddingLeft: computedValue, paddingRight: computedValue };
        break;
      case 'paddingVertical':
        style = { ...style, paddingTop: computedValue, paddingBottom: computedValue };
        break;
      default:
        style = { ...style, [prop]: computedValue };
    }
  }

  // Computed props.
  if (typeof flex === 'number') {
    // Enforce React Native flex behaviour. Can be overridden later.
    style = { ...style, flexBasis: 'auto', flexGrow: flex, flexShrink: 1 };
  }
  if (backgroundColor) {
    style = { ...style, backgroundColor: theme.colors[backgroundColor] };
  }

  // Just value props.
  const justValueProps = {
    alignItems,
    alignSelf,
    flexBasis,
    flexDirection,
    flexGrow,
    flexShrink,
    flexWrap,
    justifyContent,
    opacity,
    overflow,
    position,
    zIndex,
  };

  for (const prop in justValueProps) { // eslint-disable-line guard-for-in, no-restricted-syntax
    const value = justValueProps[prop];
    const isDefined = typeof value === 'number' || value;
    if (!isDefined) continue;  // eslint-disable-line no-continue
    style = { ...style, [prop]: value };
  }

  return [style, props];
};

const Box = ({
  as,
  style,
  ...props
}: BoxProps, { // Note no $Exact<BoxProps>. It's up to rendered component.
  View,
  renderer,
  theme,
}: BoxContext) => {
  const Component = as || View;
  const [boxStyle, restProps] = computeBoxStyle(theme, props);
  return (
    <Component
      {...restProps}
      // TODO: Add the same logic for browser className.
      style={renderer.renderRule(() => ({
        ...boxStyle,
        ...(style && style(theme)),
      }))}
    />
  );
};

Box.contextTypes = {
  View: React.PropTypes.func,
  renderer: React.PropTypes.object,
  theme: React.PropTypes.object,
};

export default Box;
