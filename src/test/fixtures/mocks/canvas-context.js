/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow
type MaybeFn = (any => any) | void
const identity = () => {};

export default function mockCanvasContext() {
  const log: Array<any> = [];

  /**
   * Logs canvas operations. The log will preserve the order of operations, which is
   * important for canvas rendering.
   */
  function spyLog(name: string, fn: MaybeFn = identity) {
    return jest.fn((...args) => {
      log.push([name, ...args]);
      if (fn) {
        return fn.apply(null, args);
      }
      return undefined;
    });
  }

  return new Proxy(
    {
      scale: spyLog('scale'),
      fillRect: spyLog('fillRect'),
      fillText: spyLog('fillText'),
      clearRect: spyLog('clearRect'),
      beginPath: spyLog('beginPath'),
      closePath: spyLog('closePath'),
      arc: spyLog('arc'),
      measureText: spyLog('measureText', text => ({width: text.length * 5})),
      createLinearGradient: spyLog('createLinearGradient', () => ({
        addColorStop: spyLog('addColorStop'),
      })),
      __flushDrawLog: (): Array<any> => {
        const oldLog = log.slice();
        log.splice(0, log.length);
        return oldLog;
      },
    },
    {
      // Record what values are set on the context.
      set(target, property, value) {
        target[property] = value;
        log.push(['set ' + property, value]);
        return true;
      },
    }
  );
}
