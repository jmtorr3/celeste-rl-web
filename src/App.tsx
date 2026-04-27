import { useEffect, useState } from 'react'

// Images live in the celeste-rl repo's docs/ folder. We pull them directly
// from raw.githubusercontent.com so this site stays in sync as the repo
// updates without redeploying.
const REPO_RAW = 'https://raw.githubusercontent.com/jmtorr3/celeste-rl/master'
const completionBar = `${REPO_RAW}/docs/comparison/completion_bar.png`
const outcomeBreakdown = `${REPO_RAW}/docs/comparison/outcome_breakdown.png`
const heightDistribution = `${REPO_RAW}/docs/comparison/height_distribution.png`
const dqnR1Curve = `${REPO_RAW}/docs/dqn_r1_curve.png`
const v3R9Curve = `${REPO_RAW}/docs/v3_r9.png`
const comparisonGif = `${REPO_RAW}/docs/comparison.gif`
const demoGif = `${REPO_RAW}/docs/demo.gif`

function App() {
  const base = import.meta.env.BASE_URL
  const [readable, setReadable] = useState(
    () => localStorage.getItem('readable-font') === '1'
  )
  // Tracks whether the user has interacted with the font toggle at least once.
  // Used to stop the breathing glow on the button after they've found it.
  const [toggleFound, setToggleFound] = useState(
    () => localStorage.getItem('font-toggle-found') === '1'
  )

  useEffect(() => {
    document.body.classList.toggle('readable', readable)
    localStorage.setItem('readable-font', readable ? '1' : '0')
  }, [readable])

  useEffect(() => {
    document.body.classList.toggle('toggle-found', toggleFound)
    if (toggleFound) localStorage.setItem('font-toggle-found', '1')
  }, [toggleFound])

  return (
    <>
      <button
        className="font-toggle"
        onClick={() => {
          setReadable(r => !r)
          setToggleFound(true)
        }}
        aria-label="toggle font"
      >
        {readable ? 'pixel font' : 'readable font'}
      </button>

      <div className="bootup">
        <img src={`${base}p8logo.png`} alt="pico-8" />
        {' '}
        <img src={`${base}maddy.png`} style={{ height: '1.5em' }} alt="maddy" />
        <br /><br />
        celeste-rl 1.0.0<br />
        (c) 2026 madipalli · malik · torre — vt cs 4824<br />
        <br />
      </div>

      <div className="content">
        <span className="prompt">celeste-rl</span><br />
        <br />
        deep reinforcement learning agent for celeste classic.<br />
        comparing dqn, behavioral cloning, hybrid, and curriculum methods on room 0.<br />
        <br />
        <a href="https://github.com/jmtorr3/celeste-rl" target="_blank">github</a> /
        {' '}<a href="https://github.com/jmtorr3/celeste-rl/blob/master/DEVLOG.md" target="_blank">devlog</a> /
        {' '}<a href="#findings">findings</a> /
        {' '}<a href="#results">results</a> /
        {' '}<a href="#methods">methods</a> /
        {' '}<a href="#discussion">discussion</a><br />
        <br />

        <img
          className="chart"
          src={demoGif}
          alt="dqn_r1 agent completing celeste room 0"
          style={{ width: '40%', maxWidth: '400px' }}
        />
        <span className="muted">
          dqn_r1 (plain dqn + semantic state) clearing room 0 at ε=0.05.
        </span><br />
        <br />

        <hr />
        <br />

        <span id="findings" className="prompt">headline</span>
        <br /><br />
        <span className="accent-green">plain dqn with semantic tile encoding hit 57–68% completion</span>{' '}
        on celeste classic room 0. every other method we tried — dueling, curiosity bonus,
        behavioral cloning, hybrid, curriculum — performed equal to or worse.<br />
        <br />
        the dominant factor was the <span className="accent-pink">state representation</span>,
        not the algorithm. swapping raw pico-8 tile ids (0–255) for a 5-class semantic encoding
        (air / solid / spike / out-of-bounds / other) raised plain dqn from{' '}
        <span className="accent-red">8%</span> to ~<span className="accent-green">60%</span>{' '}
        with no other change.<br />
        <br />

        <hr />
        <br />

        <span className="prompt">the problem</span>
        <br /><br />
        celeste classic is a precision platformer built in pico-8.<br />
        the goal: train an agent to clear room 0 — climb to the top of one screen.<br />
        <br />
        <ul>
          <li>extremely precise controls — frame-perfect jumps and dashes</li>
          <li>sparse rewards — naive agents fail with just a "reach the top" signal</li>
          <li>long horizon — 50–100+ correct decisions before any terminal reward</li>
          <li>rich expert data available — tool-assisted speedrun (tas) recordings</li>
        </ul>
        <br />

        <hr />
        <br />

        <span id="methods" className="prompt">methods</span>
        <br /><br />
        we ran a controlled comparison of five rl methods plus a random baseline. all share
        the same 87-dim state, same milestone reward shaping, same hyperparameters, same
        action space. only the algorithm changes between rows.<br />
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
              <td className="muted">random</td>
              <td>uniform random actions</td>
              <td>floor</td>
            </tr>
            <tr>
              <td className="accent-yellow">behavioral cloning</td>
              <td>supervised imitation of a tas any% replay</td>
              <td>imitation baseline</td>
            </tr>
            <tr>
              <td className="accent-green">plain dqn</td>
              <td>trial-and-error rl + 15-step milestone reward</td>
              <td>winner</td>
            </tr>
            <tr>
              <td className="accent-yellow">dueling dqn + curiosity</td>
              <td>plain dqn + value/advantage split + counts-based exploration bonus</td>
              <td>"obvious" upgrade</td>
            </tr>
            <tr>
              <td className="accent-yellow">hybrid (bc + dqn)</td>
              <td>dqn warm-started with tas in a protected expert buffer</td>
              <td>imitation + rl</td>
            </tr>
            <tr>
              <td className="accent-yellow">curriculum</td>
              <td>6-stage spawn schedule, advance when ≥50% complete</td>
              <td>structured exploration</td>
            </tr>
          </tbody>
        </table>
        <br />

        <hr />
        <br />

        <span className="prompt">the perception fix</span>
        <br /><br />
        before the breakthrough, every dqn run plateaued around y=13 (mid-room) and stayed there
        for thousands of episodes. <span className="muted">akhil</span> noticed visually that the
        agent oscillated on the right side of the room without ever landing on the right ledge.
        the agent literally couldn't see what it was looking at.<br />
        <br />
        the bug: tile values in the 9×9 view were being passed as <span className="accent-red">raw pico-8 tile ids (0–255)</span>.
        a spike (id 17) is numerically closer to a decoration (id 18) than to empty air (id 0).
        the network had no way to learn the difference between landable and deadly.<br />
        <br />
        <span className="accent-pink">fix:</span> classify each tile into one of five semantic
        categories. fifteen lines of code. one of the smallest changes in the project; the
        single most impactful by orders of magnitude.<br />
        <br />
        <table>
          <thead>
            <tr>
              <th>class</th>
              <th>value</th>
              <th>meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="muted">out-of-bounds</td><td>-2.0</td><td>sentinel — distinguishes "wall ends" from "wall continues"</td></tr>
            <tr><td className="accent-red">spike</td><td>-1.0</td><td>death tiles (ids 17, 27, 43, 59)</td></tr>
            <tr><td>air</td><td>0.0</td><td>passable empty space</td></tr>
            <tr><td className="muted">other</td><td>0.5</td><td>decoration, fruit, anything non-deadly</td></tr>
            <tr><td className="accent-green">solid</td><td>1.0</td><td>landable platform / wall</td></tr>
          </tbody>
        </table>
        <br />

        <hr />
        <br />

        <span id="results" className="prompt">results</span>
        <br /><br />
        evaluation: 100 episodes per method, ε=0.05 (matches training-time noise), one seed each.<br />
        <br />
        <table>
          <thead>
            <tr>
              <th>method</th>
              <th>run id</th>
              <th>architecture</th>
              <th>completion</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="accent-green">plain dqn, semantic</td>
              <td>dqn_r1</td>
              <td>dqn</td>
              <td className="accent-green">57–68%</td>
            </tr>
            <tr>
              <td>dueling dqn + curiosity</td>
              <td>v3_r9</td>
              <td>dueling</td>
              <td>37–49%</td>
            </tr>
            <tr>
              <td className="muted">random baseline</td>
              <td className="muted">—</td>
              <td className="muted">—</td>
              <td className="muted">0%</td>
            </tr>
            <tr>
              <td className="muted">behavioral cloning</td>
              <td className="muted">bc_r2</td>
              <td className="muted">dqn</td>
              <td className="muted">0%</td>
            </tr>
            <tr>
              <td className="muted">hybrid (bc + dqn)</td>
              <td className="muted">hybrid_r2</td>
              <td className="muted">dqn</td>
              <td className="muted">0%</td>
            </tr>
            <tr>
              <td className="muted">curriculum, 6 stages</td>
              <td className="muted">curriculum_r5</td>
              <td className="muted">dueling</td>
              <td className="muted">0%</td>
            </tr>
            <tr>
              <td className="accent-red">dqn, raw tile ids</td>
              <td className="accent-red">v3_r8</td>
              <td className="accent-red">dueling</td>
              <td className="accent-red">0% (8% peak, then collapse)</td>
            </tr>
          </tbody>
        </table>
        <br />
        single-seed numbers carry roughly ±10 points of variance — dqn_r1 measured 68% in one
        eval and 57% in a batched re-run on the same checkpoint. the qualitative ordering is stable.<br />
        <br />

        <span className="prompt">completion rate &amp; outcome breakdown</span><br /><br />
        <div className="chart-row">
          <img className="chart" src={completionBar} alt="completion rate bar chart" />
          <img className="chart" src={outcomeBreakdown} alt="outcome breakdown stacked bar" />
        </div>
        <br />
        the failure modes diverge per method:<br />
        <ul>
          <li><span className="accent-green">dqn_r1</span> — mixed: some early ε-noise deaths, some "almost made it" timeouts at the upper ledge</li>
          <li><span className="accent-yellow">v3_r9</span> — dies more often, often at the upper-ledge zone (curiosity bonus pulls it off-path)</li>
          <li><span className="muted">random</span> — walks into spikes</li>
          <li><span className="muted">bc_r2</span> — freezes in a deterministic loop, runs out of time (88% timeouts)</li>
          <li><span className="muted">curriculum_r5</span> — freezes harder, 97% timeouts. trained well on intermediate stages, didn't generalize to the full level</li>
          <li><span className="accent-red">hybrid_r2</span> — actively walks into spikes (100% deaths). zero-reward expert transitions anti-trained the network — implementation issue, but striking</li>
        </ul>
        <br />

        <span className="prompt">mean height reached</span><br /><br />
        <img className="chart" src={heightDistribution} alt="mean height per method" />
        <br />

        <hr />
        <br />

        <span className="prompt">training curves</span>
        <br /><br />
        left: <span className="accent-green">dqn_r1 (winner).</span>{' '}
        first completions at ep 1500, sustained 30–60% completion rate, no collapse.<br />
        right: <span className="accent-yellow">v3_r9 (dueling + curiosity).</span>{' '}
        peaked 64% around ep 1950 then collapsed.<br /><br />
        <div className="chart-row">
          <img className="chart" src={dqnR1Curve} alt="dqn_r1 training curve" />
          <img className="chart" src={v3R9Curve} alt="v3_r9 training curve" />
        </div>
        <br />

        <hr />
        <br />

        <span id="discussion" className="prompt">discussion</span>
        <br /><br />
        five method variants were tested on the same problem. only one — plain dqn with semantic
        tile encoding — meaningfully beat random. that one also beat the next-best variant
        (dueling + curiosity) by 20 percentage points.<br />
        <br />
        every "enhancement" we tried — behavioral cloning, spawn curriculum, hybrid, dueling,
        curiosity — underperformed plain dqn with the same state representation. the dominant
        factor across all comparisons was state representation, not algorithm choice.<br />
        <br />
        a few honest caveats:<br />
        <ul>
          <li><span className="accent-pink">hybrid had a real implementation bug</span> — expert transitions used reward=0 instead of replaying through the env, polluting the q-learning bootstrap target. a correct implementation might recover meaningfully.</li>
          <li><span className="accent-pink">dqn_r1 vs v3_r9 isn't a clean single-variable ablation</span> — they differ on both architecture (plain vs dueling) and reward shaping (no curiosity vs curiosity). decomposing the 20-point gap would have required another run we didn't have time for.</li>
          <li><span className="accent-pink">single-seed comparisons.</span> variance estimates would require multiple seeds.</li>
          <li><span className="accent-pink">single-room evaluation.</span> all comparisons are on celeste room 0. generalization to other rooms is future work.</li>
        </ul>
        <br />
        <span className="accent-pink">prior art that solves the full game:</span>{' '}
        <a href="https://github.com/effdotsh/Celeste-Bot" target="_blank">effdotsh/Celeste-Bot</a>{' '}
        (c#/unity) — a genetic algorithm. ga sidesteps our bottleneck by using parallel exploration
        and population-based selection rather than a replay buffer + ε-greedy. for full-game celeste,
        the right algorithm class is probably population-based or on-policy with curiosity (ppo + rnd).<br />
        <br />

        <hr />
        <br />

        <span className="prompt">future work</span>
        <br /><br />
        a few directions we'd take this if we had more time. each one is a single
        runnable experiment on the existing infrastructure, not a vague aspiration.<br />
        <br />
        <ul>
          <li>
            <span className="accent-pink">fix hybrid and re-run.</span>{' '}
            our hybrid records expert transitions with reward=0, which polluted the
            q-learning bootstrap. a correct version replays the tas through the env.
            the corrected result is the most interesting open question we have —
            either it matches plain dqn (weakening "complexity hurts") or it still
            underperforms (strengthening it). most impactful single experiment left.
          </li>
          <li>
            <span className="accent-pink">multiple seeds.</span>{' '}
            every number here is single-seed. three seeds per method would give us
            confidence bands on the bar chart and let us test whether the 20-point
            gap between dqn_r1 and v3_r9 is significant. ~30 gpu-hours.
          </li>
          <li>
            <span className="accent-pink">generalization to other rooms.</span>{' '}
            all comparisons are on room 0. rooms 5+ require dash chains, rooms 12+
            have wind, rooms 20+ have falling blocks — different action skills.
            whether the perception-fix dominance holds across them is open.
          </li>
          <li>
            <span className="accent-pink">single-variable architectural ablation.</span>{' '}
            dqn_r1 vs v3_r9 differs on two axes (plain vs dueling, curiosity vs no
            curiosity). running plain dqn + curiosity is one extra training run that
            cleanly decomposes the 20-point gap. cheapest unfinished experiment.
          </li>
          <li>
            <span className="accent-pink">larger expert dataset.</span>{' '}
            66 tas transitions is too few. adding 5–10 hand-recorded human
            playthroughs would test whether bc's 0% is fundamental (covariate shift)
            or just data-limited.
          </li>
        </ul>
        <br />

        <hr />
        <br />

        <span className="prompt">what the agent looks like</span>
        <br /><br />
        side-by-side gameplay across all methods. each panel runs ten ε=0.05 episodes back-to-back.
        the running tally in each panel header shows how many of those episodes completed.<br />
        <br />
        <img className="chart" src={comparisonGif} alt="side-by-side comparison gif" /><br />
        <span className="muted">
          dqn_r1 climbs to the exit while bc and curriculum freeze in deterministic loops, hybrid
          walks straight into spikes, and v3_r9 makes it most of the way before stochastically
          falling.
        </span><br />
        <br />

        <hr />
        <br />

        <span className="prompt">team</span>
        <br /><br />
        jorge manuel torre — project lead · pyleste env · training infrastructure · bc and hybrid pipelines<br />
        akhil madipalli — dqn training · reward shaping · perception/state fix<br />
        maryam malik — evaluation across all methods · final results<br />
        <br />
        <span className="muted">cs 4824 — machine learning · spring 2026 · virginia tech</span><br />
        <br />
      </div>
    </>
  )
}

export default App
