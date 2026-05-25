import { TAPE_ITEMS } from './data';

function TapeItem({
  sym,
  val,
  chg,
  pos,
}: {
  sym: string;
  val: string;
  chg: string;
  pos: boolean;
}) {
  return (
    <span className="tape-item">
      <span className="tape-sym">{sym}</span>
      <span className="tape-val mono">{val}</span>
      <span className={`tape-chg mono ${pos ? 'pos' : 'neg'}`}>{chg}</span>
    </span>
  );
}

export function TapeTrack() {
  const items = [...TAPE_ITEMS, ...TAPE_ITEMS];
  return (
    <div className="tape">
      <div className="tape-track">
        {items.map((item, i) => (
          <TapeItem key={`${item.sym}-${i}`} {...item} />
        ))}
      </div>
    </div>
  );
}
