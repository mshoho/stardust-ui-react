import { mergeThemeVariables__PROD, mergeThemeVariables__DEV } from 'src/lib/mergeThemes'
import * as _ from 'lodash'
import { withDebugId } from 'src/lib'
import * as debugEnabled from 'src/lib/debug/debugEnabled'

describe('mergeThemeVariables', () => {
  let originalDebugEnabled

  beforeEach(() => {
    originalDebugEnabled = debugEnabled.isEnabled
  })

  afterEach(() => {
    Object.defineProperty(debugEnabled, 'isEnabled', {
      get: () => originalDebugEnabled,
    })
  })

  function mockIsDebugEnabled(enabled: boolean) {
    Object.defineProperty(debugEnabled, 'isEnabled', {
      get: jest.fn(() => enabled),
    })
  }

  function testMergeThemeVariables(mergeThemeVariables) {
    test('component variables are merged', () => {
      const target = { Button: {} }
      const source = { Icon: {} }

      const merged = mergeThemeVariables(target, source)

      expect(merged).toHaveProperty('Button')
      expect(merged).toHaveProperty('Icon')
    })

    test('component variable objects are converted to functions', () => {
      const target = { Button: {} }
      const source = { Button: {} }

      const merged = mergeThemeVariables(target, source)

      expect(merged.Button).toBeInstanceOf(Function)
      expect(merged.Button).toBeInstanceOf(Function)
    })

    test('component variable objects are deeply merged', () => {
      const target = { Button: { a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' } }
      const source1 = withDebugId(
        {
          Button: siteVariables => ({ b: siteVariables.colors.colorForB }),
        },
        's1',
      )
      const source2 = { Button: { c: 'cS2' } }
      const source3 = { Button: { d: 'dS3' } }

      const siteVariables = {
        fontSizes: {},
        colors: {
          colorForB: 'b_color',
          colorForC: 'c_color',
        },
      }
      const merged = mergeThemeVariables(target, mergeThemeVariables(source1, source2), source3)
      const resolved = _.mapValues(merged, cv => cv(siteVariables))
      expect(resolved).toMatchObject({
        Button: { a: 'a', b: 'b_color', c: 'cS2', d: 'dS3', e: 'e' },
      })
    })
  }

  describe('prod version', () => {
    beforeEach(() => {
      mockIsDebugEnabled(true) // it is not possible to enable debug in prod
    })
    testMergeThemeVariables(mergeThemeVariables__PROD)
  })

  describe('dev version, debug disabled', () => {
    beforeEach(() => {
      mockIsDebugEnabled(false)
    })
    testMergeThemeVariables(mergeThemeVariables__DEV)
  })

  describe('dev version, debug enabled', () => {
    beforeEach(() => {
      mockIsDebugEnabled(true)
    })
    testMergeThemeVariables(mergeThemeVariables__DEV)
  })
})
