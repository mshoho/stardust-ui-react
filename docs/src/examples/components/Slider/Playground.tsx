import * as React from 'react'
import { useBooleanKnob, useStringKnob } from '@stardust-ui/docs-components'
import { Slider } from '@stardust-ui/react'

const SliderPlayground: React.FunctionComponent = () => {
  const [min] = useStringKnob({ name: 'min', initialValue: '0' })
  const [max] = useStringKnob({ name: 'max', initialValue: '50' })
  const [step] = useStringKnob({ name: 'step', initialValue: '5' })
  const [value, setValue] = useStringKnob({ name: 'value', initialValue: '10' })
  const [disabled] = useBooleanKnob({ name: 'disabled' })

  return (
    <Slider
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e, data) => setValue(String(data.value))}
    />
  )
}

export default SliderPlayground
