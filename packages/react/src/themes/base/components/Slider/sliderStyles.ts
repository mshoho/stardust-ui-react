import { SliderVariables } from './sliderVariables'
import { SliderProps } from '../../../../components/Slider/Slider'
import { pxToRem } from '../../../../lib'
import { ComponentSlotStylesInput, ICSSInJSStyle } from '../../../types'

const selectors = {
  WEBKIT_THUMB: '::-webkit-slider-thumb',
  MOZ_THUMB: '::-moz-range-thumb',
  MS_THUMB: '::-ms-thumb',
  WEBKIT_TRACK: '::-webkit-slider-runnable-track',
  MOZ_TRACK: '::-moz-range-track',
  MS_TRACK: '::-ms-track',
}

const trackStyles = {
  background: '#aaa',
  border: '1px solid #777',
  borderRadius: '4px',
  cursor: 'pointer',
  height: '6px',
}

const thumbStyles = {
  background: '#ddd',
  border: '1px solid #777',
  borderRadius: '100%',
  cursor: 'pointer',
  height: '20px',
  marginTop: '-8px',
  width: '20px',
}

const thumbFocusStyles = {
  background: '#eee',
}

const trackFocusStyles = {
  background: '#ccc',
}

const sliderStyles: ComponentSlotStylesInput<SliderProps, SliderVariables> = {
  root: ({ props: p, variables: v }): ICSSInJSStyle => {
    const height = pxToRem(v.height)
    const width = pxToRem(v.width)

    return {
      position: 'relative',
      margin: '10px',
      height,
      width,
      ...(p.vertical && { height: width, width: height }),
      ...(p.fluid && !p.vertical && { width: '100%' }),
    }
  },

  input: ({ props: p, variables: v }): ICSSInJSStyle => {
    const height = pxToRem(v.height)
    const width = pxToRem(v.width)
    const transformOriginVal = pxToRem(v.width / 2)

    return {
      height,
      width,
      '-webkit-appearance': 'none',
      margin: 0,
      padding: 0,
      [selectors.WEBKIT_TRACK]: trackStyles,
      [selectors.MOZ_TRACK]: trackStyles,
      [selectors.MS_TRACK]: trackStyles,

      '::-ms-fill-lower': { display: 'none' },
      '::-ms-fill-upper': { display: 'none' },

      [selectors.WEBKIT_THUMB]: { '-webkit-appearance': 'none', ...thumbStyles },
      [selectors.MOZ_THUMB]: thumbStyles,
      [selectors.MS_THUMB]: { ...thumbStyles, marginTop: 0 },

      ':focus': {
        outline: 0,
        [`&${selectors.WEBKIT_TRACK}`]: trackFocusStyles,
        [`&${selectors.MOZ_TRACK}`]: trackFocusStyles,
        [`&${selectors.MS_TRACK}`]: trackFocusStyles,

        [`&${selectors.WEBKIT_THUMB}`]: { ...thumbFocusStyles, outline: 'auto' },
        [`&${selectors.MOZ_THUMB}`]: thumbFocusStyles,
        [`&${selectors.MS_THUMB}`]: thumbFocusStyles,
      },

      ...(p.vertical && {
        transform: 'rotate(-90deg)',
        transformOrigin: `${transformOriginVal} ${transformOriginVal}`,
      }),

      ...(p.fluid && !p.vertical && { width: '100%' }),
    }
  },
}

export default sliderStyles
