import { useEffect, useState } from 'react'

function App() {
  const base = import.meta.env.BASE_URL
  const [readable, setReadable] = useState(
    () => localStorage.getItem('readable-font') === '1'
  )

  useEffect(() => {
    document.body.classList.toggle('readable', readable)
    localStorage.setItem('readable-font', readable ? '1' : '0')
  }, [readable])

  return (
    <>
      <button
        className="font-toggle"
        onClick={() => setReadable(r => !r)}
        aria-label="toggle font"
      >
        {readable ? 'pixel font' : 'readable font'}
      </button>

      <div className="bootup">
        <img src={`${base}p8logo.png`} alt="pico-8" />
        {' '}
        <img src={`${base}maddy.png`} style={{ height: '1.5em' }} alt="maddy" />
        <br /><br />
        celeste-rl 0.1.0<br />
        (c) 2026 madipalli · malik · torre — vt cs 4824<br />
        <br />
      </div>

      <div className="content">
        <span className="prompt">celeste-rl</span><br />
        <br />
        deep reinforcement learning agent for celeste classic.<br />
        comparing dqn, behavioral cloning, hybrid, and curriculum methods.<br />
        <br />
        <a href="https://github.com/jmtorr3/celeste-rl" target="_blank">github</a> /
        {' '}<a href="#results">results</a> /
        {' '}<a href="#methods">methods</a> /
        {' '}<a href="#discussion">discussion</a><br />
        <br />

        <hr />
        <br />

        <span className="prompt">the problem</span>
        <br /><br />
        celeste classic is a precision platformer built in pico-8.<br />
        the goal: train an agent to climb the mountain — one screen at a time.<br />
        <br />
        <ul>
          <li>extremely precise controls — frame-perfect jumps and dashes</li>
          <li>sparse rewards — naive agents fail with just a "reach the top" signal</li>
          <li>rich expert data available — tool-assisted speedrun (tas) recordings</li>
          <li>core challenge: sparse + delayed reward in a precision-control domain</li>
        </ul>
        <br />

        <hr />
        <br />

        <span id="methods" className="prompt">methods</span>
        <br /><br />
        four approaches compared:<br />
        <br />
        <table>
          <thead>
            <tr>
              <th>method</th>
              <th>idea</th>
              <th>role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="accent-yellow">dqn</td>
              <td>trial-and-error rl + reward shaping</td>
              <td>baseline</td>
            </tr>
            <tr>
              <td className="accent-yellow">behavioral cloning</td>
              <td>supervised imitation of tas demos</td>
              <td>imitation baseline</td>
            </tr>
            <tr>
              <td className="accent-yellow">hybrid</td>
              <td>dqn + tas-prefilled replay buffer</td>
              <td>initial hypothesis</td>
            </tr>
            <tr>
              <td className="accent-yellow">curriculum</td>
              <td>backwards curriculum over spawn position</td>
              <td>best result</td>
            </tr>
          </tbody>
        </table>
        <br />

        <hr />
        <br />

        <span id="results" className="prompt">results</span>
        <br /><br />
        <table>
          <thead>
            <tr>
              <th>model</th>
              <th>train completions</th>
              <th>eval height</th>
              <th>eval completion</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>random baseline</td>
              <td>0</td>
              <td>~96</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>dqn (v3_r6)</td>
              <td>0</td>
              <td>51</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>behavioral cloning</td>
              <td>—</td>
              <td>77</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>hybrid dqn</td>
              <td>0</td>
              <td>77</td>
              <td>0%</td>
            </tr>
            <tr>
              <td className="accent-green">curriculum r2</td>
              <td className="accent-green">485+</td>
              <td>77</td>
              <td>0%</td>
            </tr>
            <tr>
              <td className="accent-green">curriculum r3</td>
              <td className="accent-green">5+</td>
              <td className="accent-green">64</td>
              <td>0%</td>
            </tr>
            <tr>
              <td className="muted">tas upper bound</td>
              <td className="muted">—</td>
              <td className="muted">complete</td>
              <td className="muted">100%</td>
            </tr>
          </tbody>
        </table>
        <br />
        <span className="accent-pink">headline:</span> curriculum r2 produced the first ever
        full-level completion from spawn y=96 (the normal level start) at episode 1,550 of stage 5.<br />
        <br />

        <hr />
        <br />

        <span className="prompt">curriculum stages</span>
        <br /><br />
        backwards curriculum — start the agent near the exit, move spawn down as it masters each section:<br />
        <br />
        <table>
          <thead>
            <tr>
              <th>stage</th>
              <th>spawn (x, y)</th>
              <th>max steps</th>
              <th>distance to exit</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>(97, 15)</td><td>100</td><td>1–2 moves</td></tr>
            <tr><td>2</td><td>(89, 30)</td><td>150</td><td>upper section</td></tr>
            <tr><td>3</td><td>(79, 50)</td><td>200</td><td>mid-level</td></tr>
            <tr><td>4 <span className="muted">(r3+)</span></td><td>(89, 60)</td><td>250</td><td>mid-lower bridge</td></tr>
            <tr><td>5</td><td>(88, 71)</td><td>300</td><td>lower-mid</td></tr>
            <tr><td>6</td><td>default y=96</td><td>500</td><td>full level</td></tr>
          </tbody>
        </table>
        <br />
        spawn x positions sampled from the tas replay so the agent lands on the actual level path, not inside a wall.<br />
        <br />

        <hr />
        <br />

        <span id="discussion" className="prompt">discussion</span>
        <br /><br />
        all four approaches hit the same wall: celeste classic requires a frame-perfect ~200-step
        sequence before any terminal reward. dqn's bootstrap-from-rare-events fails when events
        are this rare; ε-greedy noise disrupts the precision the level demands.<br />
        <br />
        <span className="accent-pink">what does work:</span>{' '}
        <a href="https://github.com/effdotsh/Celeste-Bot" target="_blank">effdotsh/Celeste-Bot</a>{' '}
        (c#/unity) solves this same game with a genetic algorithm. ga sidesteps our bottleneck —
        parallel exploration, no replay buffer to corrupt, no ε-greedy noise at evaluation.<br />
        <br />
        <span className="accent-pink">next steps:</span> ppo + intrinsic curiosity (rnd/icm),
        or a population-based method like neat. both bypass the sparse-reward / replay-buffer
        problem that bottlenecked every approach we tried.<br />
        <br />

        <hr />
        <br />

        <span className="prompt">team</span>
        <br /><br />
        akhil madipalli — tas data preprocessing<br />
        maryam malik — dqn &amp; reward shaping<br />
        jorge torre — pyleste env &amp; evaluation<br />
        <br />
        <span className="muted">cs 4824 — machine learning · spring 2026 · virginia tech</span><br />
        <br />
      </div>
    </>
  )
}

export default App
