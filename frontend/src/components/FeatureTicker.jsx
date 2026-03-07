const ROW1 = [
  'AI Insights', 'BPC-157', 'HRV Tracking', 'Sleep Analysis', 'Protocol Builder',
  'Dose Schedules', 'TB-500', 'Biometric Data', 'Stack Optimizer', 'Smart Alerts',
  'Semax', 'Progress Charts', 'AI Insights', 'BPC-157', 'HRV Tracking', 'Sleep Analysis',
  'Protocol Builder', 'Dose Schedules', 'TB-500', 'Biometric Data', 'Stack Optimizer',
];

const ROW2 = [
  'Growth Hormone', 'CJC-1295', 'Recovery Metrics', 'Peptide Logs', 'Custom Protocols',
  'IGF-1 Tracking', 'Daily Reports', 'PT-141', 'AOD-9604', 'Ipamorelin', 'DSIP', 'Epitalon',
  'Growth Hormone', 'CJC-1295', 'Recovery Metrics', 'Peptide Logs', 'Custom Protocols',
  'IGF-1 Tracking', 'Daily Reports', 'PT-141', 'AOD-9604', 'Ipamorelin',
];

const ACCENT_WORDS = new Set(['AI Insights', 'Stack Optimizer', 'Custom Protocols', 'IGF-1 Tracking']);

export default function FeatureTicker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker-fade ticker-fade-left" />
      <div className="ticker-fade ticker-fade-right" />
      <div className="ticker-row">
        <div className="ticker-track ticker-left">
          {ROW1.map((tag, i) => (
            <span key={i} className={`ticker-tag${ACCENT_WORDS.has(tag) ? ' ticker-tag-accent' : ''}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="ticker-row">
        <div className="ticker-track ticker-right">
          {ROW2.map((tag, i) => (
            <span key={i} className={`ticker-tag${ACCENT_WORDS.has(tag) ? ' ticker-tag-accent' : ''}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
