import React from 'react';
import { motion } from 'framer-motion';

const PHASES = [
  {
    number: '01',
    name: 'Phase 1 — Acute Withdrawal',
    dayRange: 'Day 1–4',
    body: [
      'Dopamine D2 receptor downregulation begins reversing. During active pornography use, chronic supraphysiological stimulation of the mesolimbic dopamine pathway causes the nucleus accumbens to reduce D2 receptor density via homeostatic downscaling. Within 24–72 hours of abstinence, receptor upregulation begins.',
      "Prolactin levels surge as dopamine tone drops sharply — this produces the clinical 'flatline': anhedonia, reduced libido, emotional blunting. This is neurochemically identical to withdrawal from other dopaminergic substances.",
      'The anterior cingulate cortex (ACC), which governs impulse inhibition and conflict monitoring, shows measurably reduced activation during this phase. Norepinephrine dysregulation manifests as anxiety, hypervigilance, and disrupted sleep architecture — particularly reduced REM duration.',
    ],
  },
  {
    number: '02',
    name: 'Phase 2 — Stabilization',
    dayRange: 'Day 5–13',
    body: [
      'The mesolimbic dopamine pathway begins attenuating its hypersensitivity to pornography-conditioned cues. Corticotropin-releasing factor (CRF) levels — elevated during acute withdrawal and responsible for stress-induced craving — begin normalizing.',
      'The nucleus accumbens hedonic baseline recalibrates upward: natural stimuli (sunlight, food, movement, social connection) begin triggering proportionate dopamine responses again.',
      "A peer-reviewed study (Testosterone and cortisol in men after orgasm, Escasa et al.) documents a measurable testosterone spike peaking at approximately day 7 of abstinence before stabilizing at an elevated baseline — consistent with androgen receptor sensitivity changes.",
    ],
  },
  {
    number: '03',
    name: 'Phase 3 — Rewiring',
    dayRange: 'Day 14–29',
    body: [
      'Neuroimaging studies using fMRI show measurably reduced BOLD (blood-oxygen-level-dependent) signal response to explicit visual cues at the two-week mark — indicating reduced cue reactivity in the ventral striatum and orbitofrontal cortex.',
      "The prefrontal cortex (PFC) — governing executive function, impulse inhibition, and long-term planning — shows early signs of gray matter density recovery. Delta FosB, a stable transcription factor that accumulates with repeated dopaminergic stimulation and drives compulsive behavior by sensitizing reward circuitry, has a biological half-life of approximately 1.5–2 weeks. Levels drop significantly at this stage, weakening the compulsive loop at its molecular root.",
      'Synaptic pruning of pornography-associated neural circuits accelerates through use-dependent plasticity: unused pathways weaken.',
    ],
  },
  {
    number: '04',
    name: 'Phase 4 — Rebuilding',
    dayRange: 'Day 30–59',
    body: [
      'Androgen receptor upregulation peaks at approximately day 30–45. This is distinct from serum testosterone levels — the receptors that bind testosterone become more numerous and more sensitive, meaning identical serum T produces stronger anabolic, motivational, and cognitive downstream effects.',
      "The default mode network (DMN) — chronically hyperactivated in behavioral addiction, producing rumination and intrusive ideation — normalizes toward resting-state baseline.",
      'The medial prefrontal cortex, responsible for social cognition, theory of mind, and interpersonal attunement, shows increasing activity: this is the neurological substrate of improved eye contact, genuine interest in others, and reduced social anxiety. This is not psychological change. It is structural.',
    ],
  },
  {
    number: '05',
    name: 'Phase 5 — Transformation',
    dayRange: 'Day 60–89',
    body: [
      'Structural MRI studies on subjects abstaining from dopaminergic overstimulation document measurable gray matter volume increases in the prefrontal cortex at the 8-week mark.',
      'The hypothalamic-pituitary-gonadal (HPG) axis — the hormonal cascade governing testosterone production, stress response, and reproductive function — fully recalibrates. Cortisol-to-testosterone ratio improves significantly.',
      "The amygdala, the brain's threat-detection and fear-processing center, shows reduced hyperreactivity: this manifests clinically as lower baseline anxiety, reduced social fear response, and decreased freeze/avoidance behavior in confrontational situations.",
    ],
  },
  {
    number: '06',
    name: 'Phase 6 — Freedom',
    dayRange: 'Day 90+',
    body: [
      "The 90-day threshold is clinically established as a meaningful recovery marker across multiple addiction studies. Long-term potentiation (LTP) — the neurobiological process by which repeated activation strengthens synaptic connections — is now operating in your favor. Healthy neural circuits are being reinforced.",
      "The conditioned cue-craving-reward loop has been substantially weakened through consistent non-reinforcement, exploiting the brain's own extinction learning mechanisms.",
      "Structural and functional neuroimaging at this stage shows prefrontal normalization, reduced limbic hyperreactivity, and measurable recovery of gray matter in regions associated with decision-making and impulse control. You are not the same neurological person who started.",
    ],
  },
];

const ScienceTab: React.FC = () => {
  return (
    <div className="px-4 pt-12 pb-32">
      {/* Centered hero */}
      <div className="mb-10 text-center">
        <h1 className="font-sans font-semibold text-xl uppercase tracking-[0.2em] text-text-primary">
          Neurological Recovery Timeline
        </h1>
        <p className="mt-3 text-base text-text-primary font-sans max-w-md mx-auto">
          What abstinence does to your brain, phase by phase.
        </p>
        <p className="mt-1.5 text-sm text-text-secondary font-sans">
          Based on neuroscience research
        </p>
      </div>

      <div className="space-y-6">
        {PHASES.map((phase, i) => (
          <motion.article
            key={phase.number}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="bg-bg-card rounded-[16px] border border-border overflow-hidden"
          >
            {/* Phase card header — center-aligned (number, phase name, day range pill) */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '24px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-text-tertiary, #444444)', textAlign: 'center', width: '100%' }}>
                {phase.number}
              </p>
              <h2 style={{ marginTop: '4px', fontWeight: 700, fontSize: '18px', color: 'var(--color-text-primary, #ffffff)', textAlign: 'center', width: '100%' }}>
                {phase.name}
              </h2>
              <span style={{ marginTop: '8px', padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#0d0d0d', border: '1px solid #222222', color: '#666666', textAlign: 'center' }}>
                {phase.dayRange}
              </span>
            </div>
            {/* Body paragraphs — left-aligned */}
            <div className="px-5 pb-6 text-left space-y-4">
              {phase.body.map((paragraph, j) => (
                <p key={j} className="text-sm font-sans text-text-secondary leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};

export default ScienceTab;
