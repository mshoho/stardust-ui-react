type SliderCSSVariables = Required<Pick<React.CSSProperties, 'height' | 'width'>>

export interface SliderVariables extends SliderCSSVariables {
  height: number
  width: number
}

export default (): SliderVariables => ({
  height: 15,
  width: 130,
})
