import {
  mergeComponentVariables__PROD,
  mergeComponentVariables__DEV,
} from '../../../../src/lib/mergeThemes'
import * as debugEnabled from 'src/lib/debug/debugEnabled'
import { withDebugId } from 'src/lib'
import objectKeyToValues from 'src/lib/objectKeysToValues'

describe('mergeComponentVariables', () => {
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

  function testMergeComponentVariables(mergeComponentVariables) {
    test(`always returns a function that returns an object`, () => {
      expect(mergeComponentVariables({}, {})()).toMatchObject({})
      expect(mergeComponentVariables(null, null)()).toMatchObject({})
      expect(mergeComponentVariables(undefined, undefined)()).toMatchObject({})

      expect(mergeComponentVariables(null, undefined)()).toMatchObject({})
      expect(mergeComponentVariables(undefined, null)()).toMatchObject({})

      expect(mergeComponentVariables({}, undefined)()).toMatchObject({})
      expect(mergeComponentVariables(undefined, {})()).toMatchObject({})

      expect(mergeComponentVariables({}, null)()).toMatchObject({})
      expect(mergeComponentVariables(null, {})()).toMatchObject({})
    })

    test('gracefully handles null and undefined', () => {
      expect(mergeComponentVariables({ color: 'black' }, null)).not.toThrow()
      expect(mergeComponentVariables({ color: 'black' }, { color: null })).not.toThrow()

      expect(mergeComponentVariables(null, { color: 'black' })).not.toThrow()
      expect(mergeComponentVariables({ color: null }, { color: 'black' })).not.toThrow()

      expect(mergeComponentVariables({ color: 'black' }, undefined)).not.toThrow()
      expect(mergeComponentVariables({ color: 'black' }, { color: undefined })).not.toThrow()

      expect(mergeComponentVariables(undefined, { color: 'black' })).not.toThrow()
      expect(mergeComponentVariables({ color: undefined }, { color: 'black' })).not.toThrow()
    })

    test('undefined overwrites previously set value', () => {
      const merged = mergeComponentVariables({ color: 'black' }, { color: undefined })

      expect(merged()).toMatchObject({
        color: undefined,
      })
    })

    test('null overwrites previously set value', () => {
      const merged = mergeComponentVariables({ color: 'black' }, { color: null })

      expect(merged()).toMatchObject({
        color: null,
      })
    })

    test('merged functions return merged variables', () => {
      const target = () => ({ one: 1, three: 3 })
      const source = () => ({ one: 'one', two: 'two' })

      const merged = mergeComponentVariables(target, source)

      expect(merged()).toMatchObject({
        one: 'one',
        two: 'two',
        three: 3,
      })
    })

    test('merged functions accept and apply siteVariables', () => {
      const target = siteVariables => ({ one: 1, target: true, ...siteVariables })
      const source = siteVariables => ({ two: 2, source: true, ...siteVariables })

      const merged = mergeComponentVariables(target, source)

      const siteVariables = { one: 'one', two: 'two', fontSizes: {} }

      expect(merged(siteVariables)).toMatchObject({
        one: 'one',
        two: 'two',
        source: true,
        target: true,
      })
    })

    test('object values of variables are merged', () => {
      const target = { foo: { bar: true, deep: { dOne: 1 } }, target: true }
      const source = { foo: { baz: false, deep: { dTwo: 'two' } }, source: true }

      const merged = mergeComponentVariables(target, source)

      expect(merged()).toMatchObject({
        source: true,
        target: true,
        foo: { bar: true, baz: false, deep: { dOne: 1, dTwo: 'two' } },
      })
    })

    test('merges multiple objects', () => {
      const siteVariables = {
        colors: {
          colorForC: 'c_color',
        },
      }
      const target = { a: 1, b: 2, c: 3, d: 4, e: 5 }
      const source1 = { b: 'bS1', d: false, bb: 'bbS1' }
      const source2 = sv => ({ c: sv.colors.colorForC, cc: 'bbS2' })
      const source3 = { d: 'bS3', dd: 'bbS3' }

      expect(
        mergeComponentVariables(target, source1, source2, source3)(siteVariables),
      ).toMatchObject({
        a: 1,
        b: 'bS1',
        c: 'c_color',
        d: 'bS3',
        e: 5,
        bb: 'bbS1',
        cc: 'bbS2',
        dd: 'bbS3',
      })
    })
  }

  describe('prod version', () => {
    beforeEach(() => {
      mockIsDebugEnabled(true) // it is not possible to enable debug in prod
    })
    testMergeComponentVariables(mergeComponentVariables__PROD)

    test('debug frames are not saved', () => {
      const target = siteVariables => ({ one: 1, a: 'tA', target: true })
      const source = siteVariables => ({ two: 2, a: 'sA', source: true })

      const merged = mergeComponentVariables__PROD(target, source)
      expect(merged()._debug).toBe(undefined)
    })
  })

  describe('dev version, debug disabled', () => {
    beforeEach(() => {
      mockIsDebugEnabled(false)
    })
    testMergeComponentVariables(mergeComponentVariables__DEV)

    test('debug frames are not saved', () => {
      const target = siteVariables => ({ one: 1, a: 'tA', target: true })
      const source = siteVariables => ({ two: 2, a: 'sA', source: true })

      const merged = mergeComponentVariables__PROD(target, source)
      expect(merged()._debug).toBe(undefined)
    })
  })

  describe('dev version, debug enabled', () => {
    beforeEach(() => {
      mockIsDebugEnabled(true)
    })
    testMergeComponentVariables(mergeComponentVariables__DEV)

    describe('debug frames', () => {
      test('are saved', () => {
        const target = siteVariables => ({ one: 1, a: 'tA', target: true, ...siteVariables })
        const source = siteVariables => ({ two: 2, a: 'sA', source: true, ...siteVariables })

        const merged = mergeComponentVariables__DEV(target, source)

        const siteVariables = { one: 'one', two: 'two', fontSizes: {} }

        expect(merged(siteVariables)).toMatchObject({
          _debug: [
            { resolved: { target: true, one: 'one', a: 'tA' } },
            { resolved: { source: true, two: 'two', a: 'sA' } },
          ],
        })
      })

      test('contain debugId', () => {
        const target = siteVariables => withDebugId({ one: 1, a: 'tA', target: true }, 'target')
        const source = siteVariables => withDebugId({ two: 2, a: 'sA', source: true }, 'source')

        const merged = mergeComponentVariables__DEV(target, source)
        expect(merged()).toMatchObject({
          _debug: [{ debugId: 'target' }, { debugId: 'source' }],
        })
      })

      test('contain `input` with unresolved site variables', () => {
        const target = siteVariables => ({ one: 1, a: siteVariables.varA })
        const source = siteVariables => ({ two: 2, a: siteVariables.nested.varA })

        const merged = mergeComponentVariables__DEV(target, source)

        const siteVariables = { varA: 42, nested: { varA: 42 } }
        siteVariables['_invertedKeys'] = objectKeyToValues(siteVariables, v => `siteVariables.${v}`)

        expect(merged(siteVariables)).toMatchObject({
          _debug: [
            { input: { a: 'siteVariables.varA' } },
            { input: { a: 'siteVariables.nested.varA' } },
          ],
        })
      })

      test('are flat for recursive merge', () => {
        const siteVariables = {
          colors: {
            colorForC: 'c_color',
          },
        }
        const target = withDebugId({ a: 1, b: 2, c: 3, d: 4, e: 5 }, 'target')
        const source1 = withDebugId({ b: 'bS1', d: false, bb: 'bbS1' }, 'source1')
        const source2 = withDebugId(sv => ({ c: sv.colors.colorForC, cc: 'bbS2' }), 'source2')

        const merged1 = mergeComponentVariables__DEV(target, source1, source2)(siteVariables)
        const merged2 = mergeComponentVariables__DEV(
          mergeComponentVariables__DEV(target, source1),
          source2,
        )(siteVariables)
        const merged3 = mergeComponentVariables__DEV(
          target,
          mergeComponentVariables__DEV(source1, source2),
        )(siteVariables)

        expect(merged1).toMatchObject({
          _debug: [{ debugId: 'target' }, { debugId: 'source1' }, { debugId: 'source2' }],
        })
        expect(merged2).toMatchObject({
          _debug: [{ debugId: 'target' }, { debugId: 'source1' }, { debugId: 'source2' }],
        })
        expect(merged3).toMatchObject({
          _debug: [{ debugId: 'target' }, { debugId: 'source1' }, { debugId: 'source2' }],
        })
      })
    })
  })
})
